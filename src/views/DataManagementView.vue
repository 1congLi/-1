<template>
  <div class="data-management-view">
    <!-- 管理选项卡 -->
    <el-tabs v-model="activeTab" class="management-tabs">
      <!-- 数据管理 -->
      <el-tab-pane label="数据管理" name="management">
        <el-row :gutter="20">
          <!-- 备份数据 -->
          <el-col :span="12">
            <el-card class="action-card">
              <template #header>
                <div class="card-header">
                  <span>数据备份</span>
                  <el-icon><Box /></el-icon>
                </div>
              </template>
              <div class="backup-info">
                <el-alert
                  title="数据备份可以防止意外数据丢失"
                  type="info"
                  :closable="false"
                  class="backup-alert"
                />
                <div class="backup-actions">
                  <el-button
                    type="primary"
                    :icon="Download"
                    @click="handleBackup"
                    :loading="backupLoading"
                  >
                    备份数据
                  </el-button>
                  <el-button
                    text
                    :icon="FolderOpened"
                    @click="openBackupFolder"
                  >
                    查看备份
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 恢复数据 -->
          <el-col :span="12">
            <el-card class="action-card">
              <template #header>
                <div class="card-header">
                  <span>数据恢复</span>
                  <el-icon><RefreshRight /></el-icon>
                </div>
              </template>
              <div class="restore-info">
                <el-alert
                  title="从备份文件恢复数据"
                  type="warning"
                  :closable="false"
                  class="restore-alert"
                />
                <div class="restore-actions">
                  <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :show-file-list="false"
                    :accept="'.json'"
                    @change="handleFileChange"
                  >
                    <el-button
                      type="primary"
                      :icon="Upload"
                    >
                      选择备份文件
                    </el-button>
                  </el-upload>
                  <el-button
                    type="danger"
                    text
                    :icon="Delete"
                    @click="showRestoreConfirm = true"
                    :disabled="!selectedBackupFile"
                  >
                    确认恢复
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 备份列表 -->
        <el-card class="backup-list-card" v-if="backupFiles.length > 0">
          <template #header>
            <div class="card-header">
              <span>备份历史</span>
              <el-button
                text
                :icon="Refresh"
                @click="loadBackupFiles"
              >
                刷新
              </el-button>
            </div>
          </template>
          <el-table :data="backupFiles" stripe>
            <el-table-column prop="name" label="文件名" width="200" />
            <el-table-column prop="size" label="大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="mtime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.mtime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  text
                  size="small"
                  :icon="Download"
                  @click="downloadBackup(row)"
                >
                  下载
                </el-button>
                <el-button
                  text
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="deleteBackup(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 确认对话框 -->
        <el-dialog
          v-model="showRestoreConfirm"
          title="确认恢复数据"
          width="400px"
        >
          <div class="restore-confirm">
            <el-alert
              title="警告：恢复数据将覆盖当前所有数据！"
              type="error"
              :closable="false"
              class="restore-warning"
            />
            <p class="restore-text">
              确定要从以下文件恢复数据吗？
            </p>
            <p class="backup-file-name">{{ selectedBackupFile?.name || '' }}</p>
          </div>
          <template #footer>
            <el-button @click="showRestoreConfirm = false">取消</el-button>
            <el-button
              type="primary"
              :loading="restoreLoading"
              @click="confirmRestore"
            >
              确认恢复
            </el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 导出管理 -->
      <el-tab-pane label="导出管理" name="export">
        <el-row :gutter="20">
          <!-- 导出记录 -->
          <el-col :span="12">
            <el-card class="export-card">
              <template #header>
                <div class="card-header">
                  <span>导出记录</span>
                  <el-icon><Document /></el-icon>
                </div>
              </template>
              <div class="export-info">
                <p>导出功能可以将数据保存为不同格式：</p>
                <ul class="export-formats">
                  <li>JSON - 完整数据，可用于导入</li>
                  <li>CSV - 表格格式，可导入Excel</li>
                  <li>XLSX - Excel格式，带美化</li>
                </ul>
              </div>
              <div class="export-actions">
                <el-button
                  type="primary"
                  @click="handleExport('json')"
                >
                  导出 JSON
                </el-button>
                <el-button
                  @click="handleExport('csv')"
                >
                  导出 CSV
                </el-button>
                <el-button
                  type="success"
                  @click="handleExport('xlsx')"
                >
                  导出 Excel
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 导入管理 -->
          <el-col :span="12">
            <el-card class="import-card">
              <template #header>
                <div class="card-header">
                  <span>导入数据</span>
                  <el-icon><UploadFilled /></el-icon>
                </div>
              </template>
              <div class="import-info">
                <p>支持从导出的JSON文件导入数据：</p>
                <el-alert
                  title="导入前请确保数据格式正确"
                  type="warning"
                  :closable="false"
                  class="import-warning"
                />
              </div>
              <div class="import-actions">
                <el-upload
                  ref="importUploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  :accept="'.json'"
                  @change="handleImportFileChange"
                >
                  <el-button
                    type="primary"
                    :icon="Upload"
                  >
                    选择JSON文件
                  </el-button>
                </el-upload>
                <el-button
                  type="success"
                  :loading="importLoading"
                  :disabled="!importFile"
                  @click="confirmImport"
                >
                  导入数据
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 数据清理 -->
      <el-tab-pane label="数据清理" name="cleanup">
        <el-alert
          title="数据清理功能"
          type="warning"
          :closable="false"
          class="cleanup-alert"
        >
          <p>清理数据前请确保已备份重要数据！</p>
        </el-alert>

        <el-card class="cleanup-card">
          <template #header>
            <div class="card-header">
              <span>清理选项</span>
              <el-icon><Delete /></el-icon>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="cleanup-option">
                <h4>清理重复记录</h4>
                <p>查找并删除完全相同的重复记录</p>
                <el-button
                  type="danger"
                  text
                  @click="cleanupDuplicates"
                  :loading="cleanupLoading"
                >
                  清理重复
                </el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="cleanup-option">
                <h4>清理空记录</h4>
                <p>删除金额为0或空白的记录</p>
                <el-button
                  type="danger"
                  text
                  @click="cleanupEmpty"
                  :loading="cleanupLoading"
                >
                  清理空记录
                </el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="cleanup-option">
                <h4>清理旧数据</h4>
                <p>删除指定日期之前的记录</p>
                <div class="date-picker">
                  <el-date-picker
                    v-model="cleanupDate"
                    type="date"
                    placeholder="选择清理日期"
                    value-format="YYYY-MM-DD"
                  />
                </div>
                <el-button
                  type="danger"
                  text
                  @click="cleanupByDate"
                  :loading="cleanupLoading"
                >
                  清理旧数据
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  RefreshRight,
  Upload,
  Delete,
  Refresh,
  FolderOpened,
  Document,
  UploadFilled,
  Box
} from '@element-plus/icons-vue'
import { useAppStore } from '../store'
import { categories } from '../data'

const activeTab = ref('management')
const store = useAppStore()

// 备份相关
const backupLoading = ref(false)
const backupFiles = ref([])
const showRestoreConfirm = ref(false)
const selectedBackupFile = ref(null)
const restoreLoading = ref(false)
const uploadRef = ref()

// 导出相关
const importLoading = ref(false)
const importFile = ref(null)
const importUploadRef = ref()

// 清理相关
const cleanupLoading = ref(false)
const cleanupDate = ref('')

// 加载备份文件
async function loadBackupFiles() {
  try {
    const fs = require('fs')
    const path = require('path')
    const userDataPath = await window.electronAPI.getAppDataPath()
    const backupPath = path.join(userDataPath, 'backups')

    if (!fs.existsSync(backupPath)) {
      backupFiles.value = []
      return
    }

    const files = fs.readdirSync(backupPath)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupPath, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          path: filePath,
          size: stats.size,
          mtime: stats.mtime,
        }
      })
      .sort((a, b) => b.mtime - a.mtime)

    backupFiles.value = files
  } catch (error) {
    console.error('Load backup files error:', error)
    ElMessage.error('加载备份文件失败')
  }
}

// 备份数据
async function handleBackup() {
  backupLoading.value = true
  try {
    const data = {
      records: store.records,
      categories,
      backupTime: new Date().toISOString(),
    }
    // store.records 是响应式 Proxy，无法通过 IPC 结构化克隆，需转为纯对象
    const result = await window.electronAPI.backupData(JSON.parse(JSON.stringify(data)))
    if (result.success) {
      ElMessage.success(`数据已备份到: ${result.path}`)
      await loadBackupFiles()
    } else {
      ElMessage.error('备份失败: ' + result.error)
    }
  } catch (error) {
    console.error('Backup error:', error)
    ElMessage.error('备份失败')
  } finally {
    backupLoading.value = false
  }
}

// 打开备份文件夹
async function openBackupFolder() {
  try {
    const fs = require('fs')
    const path = require('path')
    const userDataPath = await window.electronAPI.getAppDataPath()
    const backupPath = path.join(userDataPath, 'backups')

    if (fs.existsSync(backupPath)) {
      const { shell } = require('electron')
      shell.openPath(backupPath)
    } else {
      ElMessage.info('暂无备份文件')
    }
  } catch (error) {
    console.error('Open backup folder error:', error)
    ElMessage.error('打开文件夹失败')
  }
}

// 文件变化处理
function handleFileChange(file) {
  selectedBackupFile.value = file.raw
}

// 确认恢复
async function confirmRestore() {
  if (!selectedBackupFile.value) return

  restoreLoading.value = true
  try {
    const result = await window.electronAPI.restoreData(selectedBackupFile.value.path)
    if (result.success) {
      // 重新加载数据
      await store.init()
      ElMessage.success('数据恢复成功')
      showRestoreConfirm.value = false
      selectedBackupFile.value = null
      await loadBackupFiles()
    } else {
      ElMessage.error('恢复失败: ' + result.error)
    }
  } catch (error) {
    console.error('Restore error:', error)
    ElMessage.error('恢复失败')
  } finally {
    restoreLoading.value = false
  }
}

// 下载备份
async function downloadBackup(file) {
  try {
    const { dialog } = require('electron')
    const result = await dialog.showSaveDialog({
      title: '保存备份文件',
      defaultPath: file.name,
      filters: [
        { name: 'JSON文件', extensions: ['json'] }
      ]
    })

    if (!result.canceled) {
      const fs = require('fs')
      fs.copyFileSync(file.path, result.filePath)
      ElMessage.success('备份文件下载成功')
    }
  } catch (error) {
    console.error('Download backup error:', error)
    ElMessage.error('下载失败')
  }
}

// 删除备份
async function deleteBackup(file) {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份文件 "${file.name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const fs = require('fs')
    fs.unlinkSync(file.path)
    ElMessage.success('备份文件已删除')
    await loadBackupFiles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete backup error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 导出数据
async function handleExport(format) {
  try {
    const data = {
      records: store.records,
      categories,
      exportTime: new Date().toISOString(),
    }

    const result = await window.electronAPI.exportData(JSON.parse(JSON.stringify(data)), format)
    if (result.success) {
      ElMessage.success(`${format.toUpperCase()} 数据已导出到: ${result.path}`)
    } else {
      ElMessage.error('导出失败: ' + result.error)
    }
  } catch (error) {
    console.error('Export error:', error)
    ElMessage.error('导出失败')
  }
}

// 导入文件变化
function handleImportFileChange(file) {
  importFile.value = file.raw
}

// 确认导入
async function confirmImport() {
  if (!importFile.value) return

  importLoading.value = true
  try {
    const text = await importFile.value.text()
    const importData = JSON.parse(text)

    // 验证数据格式
    if (!importData.records || !Array.isArray(importData.records)) {
      throw new Error('无效的数据格式')
    }

    await ElMessageBox.confirm(
      `确定要导入 ${importData.records.length} 条记录吗？这将会合并到现有数据中。`,
      '确认导入',
      {
        confirmButtonText: '导入',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 合并数据
    const newRecords = [...store.records, ...importData.records]
    await store.saveData({
      records: newRecords,
      categories,
    })

    // 重新加载数据
    await store.init()
    ElMessage.success(`成功导入 ${importData.records.length} 条记录`)
    importFile.value = null
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Import error:', error)
      ElMessage.error('导入失败: ' + error.message)
    }
  } finally {
    importLoading.value = false
  }
}

// 清理重复记录
async function cleanupDuplicates() {
  cleanupLoading.value = true
  try {
    const seen = new Set()
    const duplicates = []

    store.records.forEach((record, index) => {
      const key = `${record.date}-${record.amount}-${record.category1}-${record.category2}-${record.note}`
      if (seen.has(key) && index > store.records.findIndex(r => r.date === record.date && r.amount === record.amount && r.category1 === record.category1 && r.category2 === record.category2 && r.note === record.note)) {
        duplicates.push(record.id)
      } else {
        seen.add(key)
      }
    })

    if (duplicates.length === 0) {
      ElMessage.info('没有找到重复记录')
      return
    }

    await ElMessageBox.confirm(
      `找到 ${duplicates.length} 条重复记录，确定要删除吗？`,
      '清理重复记录',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 删除重复记录
    store.records = store.records.filter(r => !duplicates.includes(r.id))
    await store.saveData({
      records: store.records,
      categories,
    })

    await store.init()
    ElMessage.success(`已清理 ${duplicates.length} 条重复记录`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cleanup duplicates error:', error)
      ElMessage.error('清理失败')
    }
  } finally {
    cleanupLoading.value = false
  }
}

// 清理空记录
async function cleanupEmpty() {
  cleanupLoading.value = true
  try {
    const emptyRecords = store.records.filter(r => r.amount === 0 || (!r.note && r.category1 === '其他支出' && r.category2 === '其他支出'))

    if (emptyRecords.length === 0) {
      ElMessage.info('没有找到空记录')
      return
    }

    await ElMessageBox.confirm(
      `找到 ${emptyRecords.length} 条空记录，确定要删除吗？`,
      '清理空记录',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    store.records = store.records.filter(r => !emptyRecords.some(e => e.id === r.id))
    await store.saveData({
      records: store.records,
      categories,
    })

    await store.init()
    ElMessage.success(`已清理 ${emptyRecords.length} 条空记录`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cleanup empty error:', error)
      ElMessage.error('清理失败')
    }
  } finally {
    cleanupLoading.value = false
  }
}

// 按日期清理
async function cleanupByDate() {
  if (!cleanupDate.value) {
    ElMessage.warning('请选择清理日期')
    return
  }

  cleanupLoading.value = true
  try {
    const cutoffDate = new Date(cleanupDate.value)
    cutoffDate.setHours(23, 59, 59, 999)

    const oldRecords = store.records.filter(r => new Date(r.date) < cutoffDate)

    if (oldRecords.length === 0) {
      ElMessage.info('没有找到需要清理的旧数据')
      return
    }

    await ElMessageBox.confirm(
      `确定要删除 ${oldRecords.length} 条 ${cleanupDate.value} 之前的记录吗？`,
      '清理旧数据',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    store.records = store.records.filter(r => new Date(r.date) >= cutoffDate)
    await store.saveData({
      records: store.records,
      categories,
    })

    await store.init()
    ElMessage.success(`已清理 ${oldRecords.length} 条旧记录`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cleanup by date error:', error)
      ElMessage.error('清理失败')
    }
  } finally {
    cleanupLoading.value = false
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
function formatDateTime(date) {
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(async () => {
  await loadBackupFiles()
})
</script>

<style scoped lang="css">
.data-management-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.management-tabs {
  .action-card {
    border-radius: 12px;
    height: 100%;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .backup-info,
    .restore-info {
      .backup-alert,
      .restore-alert {
        margin-bottom: 16px;
      }
    }

    .backup-actions,
    .restore-actions,
    .export-actions,
    .import-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .backup-list-card {
    border-radius: 12px;
    margin-top: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .export-card,
  .import-card {
    border-radius: 12px;
    height: 100%;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .export-formats {
      list-style: none;
      padding: 0;
      margin: 12px 0;

      li {
        margin-bottom: 8px;
        color: #606266;
      }
    }

    .import-warning {
      margin-bottom: 16px;
    }
  }

  .cleanup-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .cleanup-option {
      padding: 16px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      text-align: center;

      h4 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 8px 0;
        color: #909399;
        font-size: 14px;
      }

      .date-picker {
        margin: 12px 0;
      }

      .el-button {
        margin-top: 12px;
      }
    }
  }

  .restore-confirm {
    .restore-warning {
      margin-bottom: 16px;
    }

    .restore-text {
      margin: 12px 0;
      color: #606266;
    }

    .backup-file-name {
      font-weight: bold;
      color: #409eff;
      word-break: break-all;
    }
  }

  .cleanup-alert {
    margin-bottom: 20px;
  }
}
</style>