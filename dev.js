const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const DEV_SERVER_URL = 'http://localhost:5173'

console.log('🚀 启动黑马记账开发环境...')

// 先启动 Vite 开发服务器
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '.'),
})

let electronProcess = null
let shuttingDown = false

// Windows 下 shell:true 产生的是进程树，kill 只能杀掉外层 shell，需要 taskkill /T 才能杀干净，否则 vite 会残留占用端口
function killTree(proc, done) {
  const finish = () => done && done()
  if (!proc || proc.killed || proc.exitCode !== null) return finish()
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
    // 等 taskkill 真正执行完再继续，避免主进程先退出导致清理中断
    killer.on('exit', finish)
    killer.on('error', finish)
  } else {
    proc.kill()
    finish()
  }
}

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  killTree(electronProcess)
  killTree(viteProcess, () => process.exit())
  // 兜底：清理卡住时也要能退出
  setTimeout(() => process.exit(), 3000).unref()
}

// spawn 没有 ready 事件，改为轮询 HTTP 直到 Vite 就绪
function waitForDevServer(url, retries = 60, interval = 500) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      const req = http.get(url, (res) => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (left <= 0) {
          reject(new Error(`等待开发服务器超时：${url}`))
          return
        }
        setTimeout(() => attempt(left - 1), interval)
      })
    }
    attempt(retries)
  })
}

waitForDevServer(DEV_SERVER_URL)
  .then(() => {
    console.log('✅ Vite 启动成功，正在启动 Electron...')

    // 开发模式 - 直接指向Vite服务器
    electronProcess = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '.'),
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: DEV_SERVER_URL,
      },
    })

    // 关闭应用窗口后结束整个开发环境
    electronProcess.on('exit', () => {
      console.log('👋 Electron 已退出，正在关闭 Vite...')
      shutdown()
    })
  })
  .catch((err) => {
    console.error('❌', err.message)
    shutdown()
  })

process.on('SIGINT', shutdown)
