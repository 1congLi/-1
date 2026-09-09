import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  // 开发模式：加载 Vite 服务器
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 初始化应用
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC 通信 - 数据存储
ipcMain.handle('save-data', (event, data: any) => {
  const dataPath = path.join(app.getPath('userData'), 'accounting-data.json')
  try {
    // 确保有userCategories字段
    if (!data.userCategories) {
      data.userCategories = []
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('load-data', () => {
  const dataPath = path.join(app.getPath('userData'), 'accounting-data.json')
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf-8')
    const parsedData = JSON.parse(data)

    // 确保有userCategories字段（向后兼容）
    if (!parsedData.userCategories) {
      parsedData.userCategories = []
    }

    return parsedData
  }
  // 返回默认值（系统分类 + 空的用户分类数组）
  return {
    records: [],
    categories: [],
    userCategories: []
  }
})

// IPC 通信 - 数据持久化（自动保存）
ipcMain.handle('get-app-data-path', () => {
  return app.getPath('userData')
})

// IPC 通信 - 数据导出
ipcMain.handle('export-data', async (event, data: any, format: 'json' | 'csv' | 'xlsx') => {
  try {
    const outputPath = path.join(app.getPath('userData'), `export-${new Date().toISOString().split('T')[0]}.${format}`)

    if (format === 'json') {
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    } else if (format === 'csv') {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Records')
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: '金额', key: 'amount', width: 15 },
        { header: '日期', key: 'date', width: 20 },
        { header: '一级分类', key: 'category1', width: 15 },
        { header: '二级分类', key: 'category2', width: 15 },
        { header: '备注', key: 'note', width: 30 },
      ]
      worksheet.addRows(data.records)
      await workbook.csv.writeFile(outputPath)
    } else if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Records')

      // 添加表头
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: '金额', key: 'amount', width: 15 },
        { header: '日期', key: 'date', width: 20 },
        { header: '一级分类', key: 'category1', width: 15 },
        { header: '二级分类', key: 'category2', width: 15 },
        { header: '备注', key: 'note', width: 30 },
      ]

      // 添加数据
      worksheet.addRows(data.records)

      // 设置表头样式
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

      // 调整列宽
      worksheet.getColumn(1).width = 20
      worksheet.getColumn(2).width = 15
      worksheet.getColumn(3).width = 20
      worksheet.getColumn(4).width = 15
      worksheet.getColumn(5).width = 15
      worksheet.getColumn(6).width = 30

      // 设置数据列格式
      worksheet.getColumn(2).numFmt = '#,##0.00'
      worksheet.getColumn(3).numFmt = 'yyyy-mm-dd hh:mm:ss'

      await workbook.xlsx.writeFile(outputPath)
    }

    return { success: true, path: outputPath }
  } catch (error: any) {
    console.error('Export error:', error)
    return { success: false, error: error.message }
  }
})

// IPC 通信 - 数据备份
ipcMain.handle('backup-data', async (event, data: any) => {
  try {
    const backupPath = path.join(app.getPath('userData'), 'backups')
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(backupPath, `backup-${timestamp}.json`)

    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2))
    return { success: true, path: backupFile }
  } catch (error: any) {
    console.error('Backup error:', error)
    return { success: false, error: error.message }
  }
})

// IPC 通信 - 数据恢复
ipcMain.handle('restore-data', async (event, backupPath: string) => {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error('备份文件不存在')
    }

    const data = fs.readFileSync(backupPath, 'utf-8')
    const parsedData = JSON.parse(data)

    // 保存到主数据文件
    const mainDataPath = path.join(app.getPath('userData'), 'accounting-data.json')
    fs.writeFileSync(mainDataPath, JSON.stringify(parsedData, null, 2))

    return { success: true }
  } catch (error: any) {
    console.error('Restore error:', error)
    return { success: false, error: error.message }
  }
})

// IPC 通信 - 加载用户自定义分类
ipcMain.handle('load-custom-categories', () => {
  const customPath = path.join(app.getPath('userData'), 'custom-categories.json')
  if (fs.existsSync(customPath)) {
    const data = fs.readFileSync(customPath, 'utf-8')
    return JSON.parse(data)
  }
  return { categories: [], children: [] }  // 默认返回空
})

// IPC 通信 - 保存用户自定义分类
ipcMain.handle('save-custom-categories', (event, data: any) => {
  const customPath = path.join(app.getPath('userData'), 'custom-categories.json')
  try {
    fs.writeFileSync(customPath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error: any) {
    console.error('Save custom categories error:', error)
    return { success: false, error: error.message }
  }
})
