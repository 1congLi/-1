<template>
  <div class="category-management-view">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
            添加分类
          </el-button>
        </div>
      </template>

      <!-- 分类列表 -->
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="分类列表" name="list">
          <div class="category-tree">
            <!-- 系统分类 -->
            <div class="system-categories">
              <h3>系统分类</h3>
              <div
                v-for="category in systemCategories"
                :key="category.id"
                class="category-group"
              >
                <div class="category-item system-category">
                  <div class="category-icon" :style="{ backgroundColor: category.color }">
                    <span>{{ category.icon }}</span>
                  </div>
                  <span class="category-name">{{ category.name }}</span>
                  <el-tag type="info" size="small" class="system-tag">系统</el-tag>
                </div>
                <div v-if="category.children && category.children.length" class="category-children">
                  <div
                    v-for="child in category.children"
                    :key="child.id"
                    class="category-item child-item"
                  >
                    <div class="category-icon" :style="{ backgroundColor: child.color }">
                      <span>{{ child.icon }}</span>
                    </div>
                    <span class="category-name">{{ child.name }}</span>
                    <el-tag type="info" size="small" class="system-tag">系统</el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户分类 -->
            <div class="user-categories">
              <h3>自定义分类</h3>
              <div
                v-if="userCategories.length === 0"
                class="empty-state"
              >
                <el-empty description="暂无自定义分类" />
              </div>
              <div
                v-for="category in userCategories"
                :key="category.id"
                class="category-group"
              >
                <div class="category-item user-category">
                  <div class="category-icon" :style="{ backgroundColor: category.color }">
                    <span>{{ category.icon }}</span>
                  </div>
                  <span class="category-name">{{ category.name }}</span>
                  <div class="category-actions">
                    <el-button
                      type="primary"
                      size="small"
                      :icon="Edit"
                      @click="handleEdit(category)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      @click="handleDelete(category.id)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                <div
                  v-if="category.children && category.children.length"
                  class="category-children"
                >
                  <div
                    v-for="child in category.children"
                    :key="child.id"
                    class="category-item child-item user-category"
                  >
                    <div class="category-icon" :style="{ backgroundColor: child.color }">
                      <span>{{ child.icon }}</span>
                    </div>
                    <span class="category-name">{{ child.name }}</span>
                    <div class="category-actions">
                      <el-button
                        type="primary"
                        size="small"
                        :icon="Edit"
                        @click="handleEdit(child)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :icon="Delete"
                        @click="handleDelete(child.id)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="添加分类" name="add">
          <div class="add-category-form">
            <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
              <el-form-item label="分类名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入分类名称"
                  maxlength="10"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="选择类型" prop="type">
                <el-radio-group v-model="form.type">
                  <el-radio label="level1">一级分类</el-radio>
                  <el-radio label="level2">二级分类</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="form.type === 'level2'"
                label="父分类"
                prop="parentId"
              >
                <el-select
                  v-model="form.parentId"
                  placeholder="请选择父分类"
                  clearable
                >
                  <el-option
                    v-for="cat in userCategories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="图标" prop="icon">
                <el-select v-model="form.icon" placeholder="请选择图标">
                  <el-option
                    v-for="option in iconOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="颜色" prop="color">
                <el-color-picker v-model="form.color" show-alpha />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleAdd" :loading="loading">
                  添加分类
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑分类对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="'编辑分类 - ' + editForm.name"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="editForm.icon" placeholder="请选择图标">
            <el-option
              v-for="option in iconOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="editForm.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="loading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <div class="delete-confirm">
        <p>确定要删除分类 <strong>"{{ deleteForm.name }}"</strong> 吗？</p>
        <p class="delete-warning">此操作不可恢复！</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="loading">
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useAppStore } from '../store'
import { categories } from '../data'

const activeTab = ref('list')
const store = useAppStore()
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = ref({
  name: '',
  type: 'level1' as 'level1' | 'level2',
  parentId: undefined as string | undefined,
  icon: '📁',
  color: '#409EFF'
})

const editForm = ref({
  id: '',
  name: '',
  icon: '',
  color: ''
})

const deleteForm = ref({
  id: '',
  name: ''
})

// 图标选项
const iconOptions = [
  { label: '🍔', value: '🍔' },
  { label: '🚗', value: '🚗' },
  { label: '☕', value: '☕' },
  { label: '🎮', value: '🎮' },
  { label: '💰', value: '💰' },
  { label: '📱', value: '📱' },
  { label: '🛒', value: '🛒' },
  { label: '🎨', value: '🎨' },
  { label: '🎵', value: '🎵' },
  { label: '⚽', value: '⚽' },
  { label: '🎬', value: '🎬' },
  { label: '✈️', value: '✈️' },
  { label: '🏠', value: '🏠' },
  { label: '💼', value: '💼' },
  { label: '🎁', value: '🎁' },
  { label: '💡', value: '💡' },
  { label: '🔥', value: '🔥' },
  { label: '❤️', value: '❤️' },
  { label: '⭐', value: '⭐' },
  { label: '🌟', value: '🌟' },
]

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 10, message: '名称长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ],
  icon: [
    { required: true, message: '请选择图标', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择颜色', trigger: 'change' }
  ]
}

// 系统分类（只读）
const systemCategories = computed(() => categories)

// 用户分类
const userCategories = computed(() => store.getUserCategories())

// 重置表单
function resetForm() {
  form.value = {
    name: '',
    type: 'level1',
    parentId: undefined,
    icon: '📁',
    color: '#409EFF'
  }
  formRef.value?.clearValidate()
}

// 添加分类
async function handleAdd() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.value.type === 'level2' && !form.value.parentId) {
      ElMessage.warning('请选择父分类')
      return
    }

    loading.value = true
    await store.createUserCategory({
      name: form.value.name,
      icon: form.value.icon,
      color: form.value.color,
      parentId: form.value.parentId
    })

    ElMessage.success('分类添加成功')
    activeTab.value = 'list'
    resetForm()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Add category error:', error)
      ElMessage.error('添加失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 编辑分类
function handleEdit(category: any) {
  editForm.value = {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color
  }
  showEditDialog.value = true
}

// 保存编辑
async function handleSaveEdit() {
  try {
    loading.value = true
    await store.updateUserCategory(editForm.value.id, {
      name: editForm.value.name,
      icon: editForm.value.icon,
      color: editForm.value.color
    })

    ElMessage.success('分类修改成功')
    showEditDialog.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Update category error:', error)
      ElMessage.error('修改失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 删除分类
function handleDelete(id: string) {
  try {
    const category = userCategories.value.find(c => c.id === id)
    if (!category) return

    deleteForm.value = {
      id: category.id,
      name: category.name
    }
    showDeleteDialog.value = true
  } catch (error: any) {
    console.error('Delete category error:', error)
  }
}

// 确认删除
async function confirmDelete() {
  try {
    await store.deleteUserCategory(deleteForm.value.id)
    ElMessage.success('分类已删除')
    showDeleteDialog.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete category error:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 初始化
onMounted(async () => {
  await store.loadUserCategories()
})
</script>

<style scoped lang="css">
.category-management-view {
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
}

.management-card {
  width: 100%;
  max-width: 1000px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.system-categories, .user-categories {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.system-categories h3, .user-categories h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
  flex-shrink: 0;
}

.category-tree {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  padding-right: 10px;
}

.category-group {
  .category-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    position: relative;

    &.system-category {
      opacity: 0.8;

      &:hover {
        opacity: 1;
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
      flex: 1;
      font-size: 15px;
    }

    .system-tag {
      flex-shrink: 0;
    }

    .category-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
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
    .category-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      font-size: 14px;
    }

    .system-tag {
      margin-left: auto;
    }
  }
}

.empty-state {
  padding: 40px 0;
}

.add-category-form {
  max-width: 600px;
  margin: 0 auto;
}

.delete-confirm {
  text-align: center;

  .delete-warning {
    color: #F56C6C;
    font-size: 14px;
    margin-top: 10px;
  }
}
</style>
