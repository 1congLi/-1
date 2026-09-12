import { createPinia } from 'pinia'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState, Record, UserCategory } from '../types'
import { categories } from '../data'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', () => {
  // 状态
  const records = ref<Record[]>([])
  const currentView = ref<'today' | 'week' | 'month' | 'all'>('today')
  const selectedCategory = ref<string | null>(null)
  const selectedDateRange = ref<[Date, Date] | null>(null)
  const userCategories = ref<UserCategory[]>([])  // 新增：用户自定义分类

  // 预算管理
  const monthlyBudget = ref(5000)
  const budgetAlerts = ref({
    daily: true,
    weekly: true,
    monthly: true,
  })

  // 筛选后的记录：用 computed 代替手写缓存。computed 的依赖由 Vue 自动
  // 追踪、变化时自动重算；手写的非响应式缓存曾导致"数据已加载但界面
  // 不刷新"的问题（渲染效果在缓存命中路径上丢失依赖订阅）
  const filteredRecords = computed<Record[]>(() => {
    let filtered = [...records.value]

    // 日期筛选：用 dayjs 按天粒度比较，避免日期字符串与 ISO 时间戳直接
    // 字符串比较导致的时区相关 bug
    const today = dayjs()
    if (currentView.value === 'today') {
      filtered = filtered.filter((r) => dayjs(r.date).isSame(today, 'day'))
    } else if (currentView.value === 'week') {
      const weekStart = today.startOf('week')
      const weekEnd = today.endOf('week')
      filtered = filtered.filter(
        (r) => !dayjs(r.date).isBefore(weekStart, 'day') && !dayjs(r.date).isAfter(weekEnd, 'day')
      )
    } else if (currentView.value === 'month') {
      const monthStart = today.startOf('month')
      const monthEnd = today.endOf('month')
      filtered = filtered.filter(
        (r) => !dayjs(r.date).isBefore(monthStart, 'day') && !dayjs(r.date).isAfter(monthEnd, 'day')
      )
    }

    // 分类筛选
    if (selectedCategory.value) {
      filtered = filtered.filter((r) => r.category2 === selectedCategory.value || r.category1 === selectedCategory.value)
    }

    return filtered
  })

  // 统计数据：同样用 computed 派生
  const statistics = computed(() => {
    const filtered = filteredRecords.value

    // 按日期分组
    const dailyMap = new Map<string, number>()
    filtered.forEach((record) => {
      const dayKey = record.date.split('T')[0]
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + record.amount)
    })

    // 按分类分组
    const categoryMap = new Map<string, { name: string; icon: string; amount: number }>()
    filtered.forEach((record) => {
      const key = record.category2 // 使用二级分类作为key，减少冲突
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: record.category2,
          icon: categories.find(c => c.id === record.category1)?.children?.find(child => child.id === record.category2)?.icon || '📁',
          amount: 0,
        })
      }
      categoryMap.get(key)!.amount += record.amount
    })

    return {
      totalAmount: filtered.reduce((sum, r) => sum + r.amount, 0),
      dailyTrend: Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount })),
      categoryDistribution: Array.from(categoryMap.entries()).map(([key, value]) => ({
        name: value.name,
        amount: value.amount,
      })),
    }
  })

  // 初始化应用（从磁盘加载持久化数据）
  async function init() {
    // 非 Electron 环境（如纯浏览器打开）下无法读写本地文件，退化为内存模式
    if (!window.electronAPI) return
    const data = await window.electronAPI.loadData()
    if (data) {
      records.value = data.records || []
      userCategories.value = data.userCategories || []  // 加载用户分类
    } else {
      // 初始空数据
      records.value = []
      userCategories.value = []
    }
    // 保存分类数据
    await saveData()
  }

  // 保存数据
  async function saveData() {
    if (!window.electronAPI) return
    const data = {
      records: records.value,
      categories,
      userCategories: userCategories.value,
    }
    // Vue 响应式 Proxy 无法被 Electron IPC 结构化克隆（An object could not be cloned），
    // 必须先深拷贝为纯对象再传输，否则静默失败、数据不落盘
    const plainData = JSON.parse(JSON.stringify(data))
    await window.electronAPI.saveData(plainData)
  }

  // 添加记录
  function addRecord(record: Omit<Record, 'id' | 'createdAt'>) {
    const newRecord: Record = {
      ...record,
      id: Date.now().toString(),
      createdAt: dayjs().toISOString(),
    }
    records.value.unshift(newRecord)
    saveData()
    return newRecord
  }

  // 更新记录
  function updateRecord(id: string, record: Partial<Omit<Record, 'id' | 'createdAt'>>) {
    const index = records.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...record }
      saveData()
    }
  }

  // 删除记录
  function deleteRecord(id: string) {
    records.value = records.value.filter((r) => r.id !== id)
    saveData()
  }

  // 获取筛选后的记录
  function getFilteredRecords() {
    return filteredRecords.value
  }

  // 获取总支出
  function getTotalAmount() {
    return filteredRecords.value.reduce((sum, record) => sum + record.amount, 0)
  }

  // 获取统计数据
  function getStatistics() {
    return statistics.value
  }

  // 重置视图状态
  function resetFilters() {
    currentView.value = 'today'
    selectedCategory.value = null
  }

  // 预算管理相关函数
  function setMonthlyBudget(amount: number) {
    monthlyBudget.value = amount
    saveData()
  }

  function getBudgetProgress() {
    const currentMonthSpent = getMonthlySpent()
    return {
      spent: currentMonthSpent,
      remaining: monthlyBudget.value - currentMonthSpent,
      percentage: monthlyBudget.value > 0 ? (currentMonthSpent / monthlyBudget.value) * 100 : 0,
    }
  }

  function getMonthlySpent() {
    const today = dayjs()
    return records.value.filter((r) => dayjs(r.date).isSame(today, 'month')).reduce(
      (sum, r) => sum + r.amount,
      0
    )
  }

  function checkBudgetAlerts() {
    const budget = getBudgetProgress()
    const alerts = []

    if (budget.percentage > 100) {
      alerts.push({
        type: 'danger',
        message: '本月支出已超出预算！',
      })
    } else if (budget.percentage > 90) {
      alerts.push({
        type: 'warning',
        message: `本月支出已达预算的 ${budget.percentage.toFixed(1)}%，请注意控制支出！`,
      })
    }

    // 日预算提醒（按30天计算）
    if (budgetAlerts.value.daily) {
      const dailyBudget = monthlyBudget.value / 30
      const todaySpent = getTodaySpent()
      if (todaySpent > dailyBudget * 1.5) {
        alerts.push({
          type: 'warning',
          message: '今日支出偏高，请注意控制！',
        })
      }
    }

    return alerts
  }

  function getTodaySpent() {
    const today = dayjs()
    return records.value.filter((r) => dayjs(r.date).isSame(today, 'day')).reduce(
      (sum, r) => sum + r.amount,
      0
    )
  }

  // 用户分类相关方法

  // 检查分类是否为系统预设
  function isSystemCategory(categoryId: string): boolean {
    return categories.some(c => c.id === categoryId)
  }

  // 获取所有分类（系统 + 用户，混合显示）
  function getAllCategories(): Category[] {
    const result = [...categories]  // 复制系统分类

    // 添加用户自定义的一级分类
    const userLevel1 = userCategories.value.filter(c => !c.parentId)
    userLevel1.forEach(userCat => {
      result.push({
        id: userCat.id,
        name: userCat.name,
        icon: userCat.icon,
        color: userCat.color,
        children: []  // 用户自定义的二级分类
      })
    })

    // 添加用户自定义的二级分类
    const userLevel2 = userCategories.value.filter(c => c.parentId)
    userLevel2.forEach(userCat => {
      const parent = result.find(c => c.id === userCat.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push({
          id: userCat.id,
          name: userCat.name,
          icon: userCat.icon,
          color: userCat.color,
        })
      }
    })

    return result
  }

  // 加载用户分类
  async function loadUserCategories() {
    if (!window.electronAPI) return []
    const customData = await window.electronAPI.loadCustomCategories()
    if (customData && customData.categories) {
      userCategories.value = customData.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        parentId: cat.parentId,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    } else {
      userCategories.value = []
    }
    return userCategories.value
  }

  // 创建新分类
  function createUserCategory(data: {
    name: string
    icon: string
    color: string
    parentId?: string
  }): UserCategory {
    const newCategory: UserCategory = {
      ...data,
      id: Date.now().toString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    }
    // 新分类添加到最前面
    userCategories.value.unshift(newCategory)
    saveData()
    return newCategory
  }

  // 更新分类（名称、图标、颜色）
  function updateUserCategory(id: string, updates: {
    name?: string
    icon?: string
    color?: string
  }): void {
    const index = userCategories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      userCategories.value[index] = {
        ...userCategories.value[index],
        ...updates,
        updatedAt: dayjs().toISOString()
      }
      saveData()
    }
  }

  // 删除分类（如果有记录则阻止）
  function deleteUserCategory(id: string): void {
    // 检查是否有记录使用该分类
    const hasRecords = records.value.some(r =>
      r.category1 === id || r.category2 === id
    )

    if (hasRecords) {
      throw new Error('该分类下有记录，无法删除')
    }

    userCategories.value = userCategories.value.filter(c => c.id !== id)
    saveData()
  }

  // 获取用户自定义的分类
  function getUserCategories(): UserCategory[] {
    return userCategories.value
  }

  return {
    // 状态
    records,
    currentView,
    selectedCategory,
    monthlyBudget,
    budgetAlerts,
    userCategories,

    // 方法
    init,
    saveData,
    addRecord,
    updateRecord,
    deleteRecord,
    getFilteredRecords,
    getTotalAmount,
    getStatistics,
    resetFilters,

    // 预算管理
    setMonthlyBudget,
    getBudgetProgress,
    checkBudgetAlerts,

    // 用户分类管理
    getUserCategories,
    createUserCategory,
    updateUserCategory,
    deleteUserCategory,
    isSystemCategory,
    getAllCategories,
  }
})
