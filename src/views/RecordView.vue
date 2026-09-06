<template>
  <div class="record-view">
    <el-card class="record-card">
      <el-page-header @back="goBack" title="返回">
        <template #content>
          <span class="header-title">记录花销</span>
        </template>
      </el-page-header>

      <div class="record-form">
        <!-- 金额输入 -->
        <div class="form-section">
          <div class="section-title">金额</div>
          <el-input-number
            v-model="form.amount"
            :min="0"
            :precision="2"
            :step="0.01"
            controls-position="right"
            class="amount-input"
          />
          <div class="amount-symbol">人民币 (¥)</div>
        </div>

        <!-- 日期选择 -->
        <div class="form-section">
          <div class="section-title">日期</div>
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="date-picker"
          />
        </div>

        <!-- 分类选择 -->
        <div class="form-section">
          <div class="section-title">分类</div>
          <div class="category-tree">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-group"
            >
              <div
                class="category-item"
                :class="{ active: selectedCategory1 === category.id }"
                @click="selectCategory1(category.id)"
              >
                <div class="category-icon" :style="{ backgroundColor: category.color }">
                  <span>{{ category.icon }}</span>
                </div>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div v-if="selectedCategory1 === category.id" class="category-children">
                <div
                  v-for="child in category.children"
                  :key="child.id"
                  class="category-item child-item"
                  :class="{ active: selectedCategory2 === child.id }"
                  @click="selectCategory2(child.id)"
                >
                  <div class="category-icon child-icon" :style="{ backgroundColor: child.color }">
                    <span>{{ child.icon }}</span>
                  </div>
                  <span class="category-name">{{ child.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="form-section">
          <div class="section-title">备注（可选）</div>
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 图片附件 -->
        <div class="form-section">
          <div class="section-title">
            图片附件（可选）
            <el-tooltip content="上传消费凭证图片" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="upload-section">
            <el-upload
              ref="uploadRef"
              class="image-upload"
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              :accept="'image/*'"
              :on-change="handleImageChange"
              :on-remove="handleImageRemove"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>
                上传图片
              </el-button>
              <template #tip>
                <div class="upload-tip">
                  支持 JPG、PNG 格式，最大 5MB
                </div>
              </template>
            </el-upload>
            <div v-if="form.attachment?.data" class="image-preview">
              <img :src="form.attachment.data" alt="附件预览" />
              <div class="preview-actions">
                <el-button
                  type="primary"
                  size="small"
                  :icon="ZoomIn"
                  @click="previewImage"
                >
                  预览
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="removeImage"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSave">保存记录</el-button>
        </div>
      </div>
    </el-card>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  QuestionFilled,
  Upload,
  ZoomIn,
  Delete
} from '@element-plus/icons-vue'
import { useAppStore } from '../store'
import { categories } from '../data'
import type { Record } from '../types'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

// 表单数据
const form = ref<{
  amount: number
  date: string
  category1: string
  category2: string
  note: string
  attachment: any
}>({
  amount: 0,
  date: dayjs().format('YYYY-MM-DD'),
  category1: '',
  category2: '',
  note: '',
  attachment: null,
})

// 选中的分类
const selectedCategory1 = ref<string>('')
const selectedCategory2 = ref<string>('')

// 初始化表单
function initForm() {
  const recordId = route.query.id as string

  if (recordId) {
    // 编辑模式
    const record = store.records.find((r) => r.id === recordId)
    if (record) {
      Object.assign(form.value, {
        amount: record.amount,
        date: record.date,
        category1: record.category1,
        category2: record.category2,
        note: record.note || '',
        attachment: record.attachment || null,
      })
      selectedCategory1.value = record.category1
      selectedCategory2.value = record.category2
    }
  } else {
    // 新增模式，默认选择今日的第一个分类
    const todayCategory = categories[0]?.children?.[0]
    if (todayCategory) {
      selectedCategory1.value = categories[0].id
      selectedCategory2.value = todayCategory.id
      form.value.category1 = categories[0].id
      form.value.category2 = todayCategory.id
    }
  }
}

// 选择一级分类
function selectCategory1(categoryId: string) {
  selectedCategory1.value = categoryId
  selectedCategory2.value = ''
  const category = categories.find((c) => c.id === categoryId)
  if (category?.children?.[0]) {
    selectedCategory2.value = category.children[0].id
    form.value.category1 = categoryId
    form.value.category2 = category.children[0].id
  }
}

// 选择二级分类
function selectCategory2(categoryId: string) {
  selectedCategory2.value = categoryId
  form.value.category1 = selectedCategory1.value
  form.value.category2 = categoryId
}

// 图片上传处理
async function handleImageChange(file: any) {
  if (!file || !file.raw) return

  try {
    // 检查文件类型
    if (!file.raw.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件')
      return
    }

    // 检查文件大小（5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.raw.size > maxSize) {
      ElMessage.error('图片大小不能超过 5MB')
      return
    }

    // 读取图片文件
    const result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('读取失败'))
      reader.readAsDataURL(file.raw)
    })

    // 转换为 base64
    form.value.attachment = {
      type: 'image',
      data: result,
      name: file.raw.name,
      size: file.raw.size,
    }

    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('Image upload error:', error)
    ElMessage.error('图片上传失败')
  }
}

// 图片删除
function handleImageRemove() {
  form.value.attachment = null
}

// 预览图片
function previewImage() {
  if (form.value.attachment?.data) {
    window.electronAPI.previewImage(form.value.attachment.data)
  }
}

// 删除图片
function removeImage() {
  form.value.attachment = null
}

// 保存记录
function handleSave() {
  if (form.value.amount <= 0) {
    return
  }
  if (!form.value.category1 || !form.value.category2) {
    return
  }

  const recordData = {
    amount: form.value.amount,
    date: dayjs(form.value.date).format('YYYY-MM-DD'),
    category1: form.value.category1,
    category2: form.value.category2,
    note: form.value.note || undefined,
    attachment: form.value.attachment,
  }

  if (route.query.id) {
    // 编辑现有记录
    store.updateRecord(route.query.id as string, recordData)
  } else {
    // 添加新记录
    store.addRecord(recordData)
  }

  goBack()
}

// 返回
function goBack() {
  router.push('/')
}

// 初始化
initForm()
</script>

<style scoped lang="css">
.record-view {
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
}

.record-card {
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.record-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px;
}

.form-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }
}

.amount-input {
  width: 300px;
}

.amount-symbol {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.date-picker {
  width: 100%;
}

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-group {
  .category-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    background-color: #f5f7fa;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #e8f4ff;
    }

    &.active {
      background-color: #409EFF;
      color: white;

      .category-name {
        color: white;
      }
    }

    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 18px;
      flex-shrink: 0;
    }

    .category-name {
      font-size: 15px;
    }
  }

  .category-children {
    margin-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px dashed #e4e7ed;
  }

  .category-item.child-item {
    .category-icon.child-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      font-size: 14px;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  max-width: 800px;
  margin: 0 auto;
}

.upload-section {
  .help-icon {
    margin-left: 4px;
    color: #909399;
    cursor: help;
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
  }

  .image-preview {
    margin-top: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      background-color: #f5f7fa;
    }

    .preview-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 12px;
      background-color: #fafafa;
    }
  }
}
</style>
