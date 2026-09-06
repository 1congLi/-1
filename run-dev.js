const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 启动黑马记账开发环境...')

// 设置环境变量
process.env.NODE_ENV = 'development'
process.env.VITE_DEV_SERVER_URL = 'http://localhost:5173'

// 启动 Electron（直接使用TypeScript源文件）
spawn('npx', ['electron', 'src-electron/main.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
})