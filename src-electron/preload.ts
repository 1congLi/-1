import { contextBridge, ipcRenderer } from 'electron'

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: {
      saveData: (data: any) => Promise<{ success: boolean; error?: string }>
      loadData: () => Promise<any>
      getAppDataPath: () => Promise<string>
      exportData: (data: any, format: 'json' | 'csv' | 'xlsx') => Promise<{ success: boolean; path?: string; error?: string }>
      backupData: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>
      restoreData: (backupPath: string) => Promise<{ success: boolean; error?: string }>
      loadCustomCategories: () => Promise<any>
      saveCustomCategories: (data: any) => Promise<{ success: boolean; error?: string }>
      onAppReady: (callback: () => void) => void
      previewImage: (base64Data: string) => void
    }
  }
}

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

  // 用户自定义分类
  loadCustomCategories: () => ipcRenderer.invoke('load-custom-categories'),
  saveCustomCategories: (data: any) => ipcRenderer.invoke('save-custom-categories', data),

  // 应用信息
  onAppReady: (callback: () => void) => {
    ipcRenderer.on('app-ready', callback)
  },

  // 图片预览功能
  previewImage: (base64Data: string) => {
    try {
      const { dialog, shell } = require('electron')
      if (dialog && shell) {
        dialog.showMessageBox({
          type: 'info',
          title: '图片预览',
          message: '点击确定在新窗口中查看图片',
          buttons: ['确定', '取消'],
        }).then(({ response }) => {
          if (response === 0) {
            shell.openExternal(`data:image/png;base64,${base64Data}`)
          }
        })
      }
    } catch (error) {
      console.error('Preview image error:', error)
    }
  },
})
