const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔨 开始构建Electron主进程代码...\n')

// 创建兼容层
const electronCompatCode = `
"use strict";
const electronPath = require('electron');
const electron = {
  app: electronPath,
  BrowserWindow: electronPath,
  ipcMain: electronPath,
  contextBridge: electronPath,
  ipcRenderer: electronPath,
  dialog: electronPath,
  shell: electronPath,
  global: global,
  console: console,
};
Object.keys(electron).forEach(key => {
  if (key === 'app') {
    const electronApp = require('electron');
    electron.app = electronApp;
  } else {
    try {
      electron[key] = require('electron');
    } catch (e) {
      electron[key] = electronPath;
    }
  }
});
const originalWhenReady = electron.app.whenReady?.bind(electron.app);
if (originalWhenReady) {
  electron.app.whenReady = function() {
    return originalWhenReady();
  };
}
module.exports = electron;
`;

fs.mkdirSync(path.join(__dirname, 'dist-electron'), { recursive: true })
fs.writeFileSync(path.join(__dirname, 'dist-electron/electron.js'), electronCompatCode, 'utf-8');
console.log('✅ Electron兼容层创建成功\n');

// 编译preload脚本
try {
  console.log('📦 编译preload脚本...')
  execSync('npx tsc src-electron/preload.ts --outDir dist-electron --module commonjs --target es2020 --esModuleInterop --skipLibCheck --types node', {
    stdio: 'inherit',
  })
  console.log('✅ Preload脚本编译成功\n')
} catch (error) {
  console.error('❌ Preload脚本编译失败:', error.message)
  process.exit(1)
}

// 编译main脚本
try {
  console.log('📦 编译main脚本...')
  execSync('npx tsc src-electron/main.ts --outDir dist-electron --module commonjs --target es2020 --esModuleInterop --skipLibCheck --types node', {
    stdio: 'inherit',
  })
  console.log('✅ Main脚本编译成功\n')
} catch (error) {
  console.error('❌ Main脚本编译失败:', error.message)
  process.exit(1)
}

console.log('✨ Electron应用构建完成！')
console.log('📁 构建产物位置: dist-electron/')
console.log('🚀 运行命令: npx electron .\n')
