import { createPinia } from 'pinia'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppState, Record } from '../types'
import { categories } from '../data'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', () => {
  // 状态
  const records = ref<Record[]>([])
  const currentView = ref<'today' | 'week' | 'month' | 'all'>('today')
  const selectedCategory = ref<string | null>(null)
  const selectedDateRange = ref<[Date, Date] | null>(null)

  // 预算管理
  const monthlyBudget = ref(5000)
  const budgetAlerts = ref({
    daily: true,
    weekly: true,
    monthly: true,
  })

  // 缓存
  let _filteredRecordsCache: Record[] | null = null
  let _currentFilterKey = ''

  function clearFilterCache() {
    _filteredRecordsCache = null
  }

  // 初始化应用
  async function init() {
    const data = await window.electronAPI.loadData()
    if (data) {
      records.value = data.records || []
    } else {
      // 初始空数据
      records.value = []
    }
    // 保存分类数据
    await saveData()
    // 清空缓存
    clearFilterCache()
  }

  // 保存数据
  async function saveData() {
    const data = {
      records: records.value,
      categories,
    }
    await window.electronAPI.saveData(data)
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
    clearFilterCache() // 清空缓存
    return newRecord
  }

  // 更新记录
  function updateRecord(id: string, record: Partial<Omit<Record, 'id' | 'createdAt'>>) {
    const index = records.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...record }
      saveData()
      clearFilterCache() // 清空缓存
    }
  }

  // 删除记录
  function deleteRecord(id: string) {
    records.value = records.value.filter((r) => r.id !== id)
    saveData()
    clearFilterCache() // 清空缓存
  }

  // 获取筛选后的记录（带缓存）
  function getFilteredRecords() {
    const filterKey = `${currentView.value}-${selectedCategory.value || 'none'}`

    // 如果缓存有效，直接返回
    if (_filteredRecordsCache && _currentFilterKey === filterKey) {
      return _filteredRecordsCache
    }

    let filtered = [...records.value]

    // 日期筛选
    const today = dayjs()
    const todayStart = today.startOf('day').toISOString()
    const todayEnd = today.endOf('day').toISOString()

    if (currentView.value === 'today') {
      filtered = filtered.filter((r) => r.date >= todayStart && r.date <= todayEnd)
    } else if (currentView.value === 'week') {
      const weekStart = today.startOf('week').toISOString()
      const weekEnd = today.endOf('week').toISOString()
      filtered = filtered.filter((r) => r.date >= weekStart && r.date <= weekEnd)
    } else if (currentView.value === 'month') {
      const monthStart = today.startOf('month').toISOString()
      const monthEnd = today.endOf('month').toISOString()
      filtered = filtered.filter((r) => r.date >= monthStart && r.date <= monthEnd)
    }

    // 分类筛选
    if (selectedCategory.value) {
      filtered = filtered.filter((r) => r.category2 === selectedCategory.value || r.category1 === selectedCategory.value)
    }

    // 更新缓存
    _filteredRecordsCache = filtered
    _currentFilterKey = filterKey

    return filtered
  }

  // 获取总支出
  function getTotalAmount() {
    return getFilteredRecords().reduce((sum, record) => sum + record.amount, 0)
  }

  // 获取统计数据（带缓存）
  let _statisticsCache: any = null

  function getStatistics() {
    const filtered = getFilteredRecords()

    // 如果有缓存且数据未变，返回缓存
    if (_statisticsCache && _statisticsCache.length === filtered.length) {
      return _statisticsCache
    }

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

    const statistics = {
      totalAmount: filtered.reduce((sum, r) => sum + r.amount, 0),
      dailyTrend: Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount })),
      categoryDistribution: Array.from(categoryMap.entries()).map(([key, value]) => ({
        name: value.name,
        amount: value.amount,
      })),
    }

    // 更新缓存
    _statisticsCache = statistics

    return statistics
  }

  // 重置视图状态
  function resetFilters() {
    currentView.value = 'today'
    selectedCategory.value = null
    clearFilterCache() // 清空缓存
  }

  // 预算管理相关函数
  function setMonthlyBudget(amount: number) {
    monthlyBudget.value = amount
    saveData()
    clearFilterCache() // 清空缓存
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
    const monthStart = today.startOf('month').toISOString()
    const monthEnd = today.endOf('month').toISOString()

    const monthRecords = records.value.filter(
      r => r.date >= monthStart && r.date <= monthEnd
    )

    return monthRecords.reduce((sum, r) => sum + r.amount, 0)
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
    const today = dayjs().startOf('day').toISOString()
    const tomorrow = dayjs().endOf('day').toISOString()

    const todayRecords = records.value.filter(
      r => r.date >= today && r.date <= tomorrow
    )

    return todayRecords.reduce((sum, r) => sum + r.amount, 0)
  }

  return {
    // 状态
    records,
    currentView,
    selectedCategory,
    monthlyBudget,
    budgetAlerts,

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
  }
})
