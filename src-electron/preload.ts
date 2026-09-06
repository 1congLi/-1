import { contextBridge, ipcRenderer } from 'electron'
import * as electron from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 数据存储
  saveData: (data: any) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),

  // 数据导出
  exportData: (data: any, format: 'json' | 'csv' | 'xlsx') => ipcRenderer.invoke('export-data', data, format),

  // 数据备份
  backupData: (data: any) => ipcRenderer.invoke('backup-data', data),

  // 数据恢复
  restoreData: (backupPath: string) => ipcRenderer.invoke('restore-data', backupPath),

  // 应用信息
  onAppReady: (callback: () => void) => {
    ipcRenderer.on('app-ready', callback)
  },

  // 图片预览功能（使用electron对象）
  previewImage: (base64Data: string) => {
    if (electron.dialog && electron.shell) {
      electron.dialog.showMessageBox({
        type: 'info',
        title: '图片预览',
        message: '点击确定在新窗口中查看图片',
        buttons: ['确定', '取消'],
      }).then(({ response }) => {
        if (response === 0) {
          electron.shell.openExternal(`data:image/png;base64,${base64Data}`)
        }
      })
    }
  },
})
