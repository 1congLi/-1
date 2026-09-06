const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 启动黑马记账开发环境...')

// 先启动 Vite 开发服务器
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '.'),
})

// 等待 Vite 启动
viteProcess.on('ready', () => {
  console.log('✅ Vite 启动成功，正在启动 Electron...')

  // 开发模式 - 直接指向Vite服务器
  spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '.'),
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173'
    }
  })
})

// 处理进程退出
process.on('exit', () => {
  viteProcess.kill()
})

process.on('SIGINT', () => {
  viteProcess.kill()
  process.exit()
})