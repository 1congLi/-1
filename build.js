const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 开始构建黑马记账应用...')

// 构建前端
const viteProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '.'),
})

viteProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 前端构建完成')

    // 创建 dist-electron 目录
    if (!fs.existsSync(path.join(__dirname, 'dist-electron'))) {
      fs.mkdirSync(path.join(__dirname, 'dist-electron'))
    }

    // 复制 electron 入口文件
    const mainSrc = path.join(__dirname, 'src-electron', 'electron.ts')
    const mainDist = path.join(__dirname, 'dist-electron', 'electron.js')

    if (fs.existsSync(mainSrc)) {
      const content = fs.readFileSync(mainSrc, 'utf8')
      // 替换导入路径
      const modifiedContent = content.replace(
        /import.*main.*ts.*from.*main\.ts/,
        ''
      ).replace(
        'app.on.*activate.*',
        `
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
`
      )

      fs.writeFileSync(mainDist, modifiedContent)
      console.log('✅ Electron 入口文件已准备')

      // 启动 Electron
      console.log('🚀 启动应用...')
      spawn('npx', ['electron', '.'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '.'),
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      })
    } else {
      console.error('❌ 找不到 Electron 入口文件')
    }
  } else {
    console.error('❌ 前端构建失败')
  }
})