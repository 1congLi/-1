<template>
  <div class="statistics-view">
    <!-- 时间范围选择 -->
    <el-card class="range-card">
      <template #header>
        <div class="range-header">
          <span>统计时间范围</span>
        </div>
      </template>
      <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
        <el-radio-button value="today">今日</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
        <el-radio-button value="year">本年</el-radio-button>
        <el-radio-button value="custom">自定义</el-radio-button>
      </el-radio-group>
      <div v-if="timeRange === 'custom'" class="custom-range">
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-range-picker"
        />
      </div>
    </el-card>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>总支出</span>
              <el-icon><Money /></el-icon>
            </div>
          </template>
          <div class="stat-value">¥{{ totalAmount.toFixed(2) }}</div>
          <div class="stat-trend">
            <el-icon :size="12" v-if="trendAmount > 0" color="#E74C3C"><ArrowUp /></el-icon>
            <el-icon :size="12" v-else-if="trendAmount < 0" color="#67C23A"><ArrowDown /></el-icon>
            <span class="trend-text">
              {{ trendAmount > 0 ? '↑' : trendAmount < 0 ? '↓' : '-' }} {{ Math.abs(trendAmount).toFixed(2) }}
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>日均支出</span>
              <el-icon><PieChart /></el-icon>
            </div>
          </template>
          <div class="stat-value">¥{{ dailyAverage.toFixed(2) }}</div>
          <div class="stat-count">共 {{ filteredRecords.length }} 笔</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>最大单笔</span>
              <el-icon><Star /></el-icon>
            </div>
          </template>
          <div class="stat-value">¥{{ maxAmount.toFixed(2) }}</div>
          <div class="stat-category">{{ maxCategory }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card budget-card">
          <template #header>
            <div class="card-header">
              <span>月度预算</span>
              <el-icon><Coin /></el-icon>
            </div>
          </template>
          <div class="stat-value budget-value">¥{{ store.monthlyBudget.toFixed(2) }}</div>
          <div class="stat-budget-info">
            <div class="budget-detail">
              <span>已用: ¥{{ getMonthlySpent().toFixed(2) }}</span>
              <span>剩余: ¥{{ (store.monthlyBudget - getMonthlySpent()).toFixed(2) }}</span>
            </div>
            <el-progress
              :percentage="getBudgetPercentage()"
              :color="getBudgetColor(getBudgetPercentage())"
              :show-text="false"
              class="budget-progress"
            />
            <div class="budget-percent-text">
              已用 {{ getBudgetPercentage().toFixed(1) }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>支出趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button value="line">折线图</el-radio-button>
                <el-radio-button value="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类排行 -->
    <el-card class="ranking-card">
      <template #header>
        <div class="card-header">
          <span>分类排行</span>
          <el-select v-model="sortType" placeholder="排序方式" size="small" @change="handleSortChange">
            <el-option label="金额降序" value="amount" />
            <el-option label="笔数降序" value="count" />
            <el-option label="名称升序" value="name" />
          </el-select>
        </div>
      </template>
      <el-table :data="rankingData" stripe style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column label="分类">
          <template #default="{ row }">
            <div class="category-info">
              <span class="category-icon" :style="{ backgroundColor: row.color }">
                {{ row.icon }}
              </span>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="amount-cell">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="占比" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.percentage"
              :stroke-width="8"
              :show-text="false"
              class="percentage-bar"
            />
            <span class="percentage-text">{{ row.percentage }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="笔数" width="80">
          <template #default="{ row }">
            <span>{{ row.count }}笔</span>
          </template>
        </el-table-column>
        <el-table-column label="平均">
          <template #default="{ row }">
            <span>¥{{ row.average.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 导出按钮 -->
    <div class="export-actions">
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出统计
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money, ArrowUp, ArrowDown, PieChart, Star, Download, Coin } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useAppStore } from '../store'
import { categories } from '../data'
import type { Record } from '../types'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const router = useRouter()
const store = useAppStore()

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 统计配置
const timeRange = ref<'today' | 'week' | 'month' | 'year' | 'custom'>('month')
const customDateRange = ref<[string, string]>([
  dayjs().startOf('month').format('YYYY-MM-DD'),
  dayjs().endOf('month').format('YYYY-MM-DD'),
])
const chartType = ref<'line' | 'bar'>('line')
const sortType = ref<'amount' | 'count' | 'name'>('amount')

// 图表实例
const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// 防抖更新图表
const updateTrendChartDebounced = debounce(() => {
  if (trendChart) updateTrendChart()
}, 300)

const updatePieChartDebounced = debounce(() => {
  if (pieChart) updatePieChart()
}, 300)

// 计算属性
const filteredRecords = computed(() => {
  let records = [...store.records]

  // 日期筛选
  const today = dayjs()
  if (timeRange.value === 'today') {
    const start = today.startOf('day').toISOString()
    const end = today.endOf('day').toISOString()
    records = records.filter(r => r.date >= start && r.date <= end)
  } else if (timeRange.value === 'week') {
    const start = today.startOf('week').toISOString()
    const end = today.endOf('week').toISOString()
    records = records.filter(r => r.date >= start && r.date <= end)
  } else if (timeRange.value === 'month') {
    const start = today.startOf('month').toISOString()
    const end = today.endOf('month').toISOString()
    records = records.filter(r => r.date >= start && r.date <= end)
  } else if (timeRange.value === 'year') {
    const start = today.startOf('year').toISOString()
    const end = today.endOf('year').toISOString()
    records = records.filter(r => r.date >= start && r.date <= end)
  } else if (timeRange.value === 'custom' && customDateRange.value) {
    const start = customDateRange.value[0]
    const end = customDateRange.value[1]
    records = records.filter(r => r.date >= start && r.date <= end)
  }

  return records
})

const totalAmount = computed(() => filteredRecords.value.reduce((sum, r) => sum + r.amount, 0))

// 获取对比数据（上一个周期）
const previousAmount = computed(() => {
  const today = dayjs()
  let previousRecords: Record[] = []

  if (timeRange.value === 'month') {
    const prevMonthStart = today.subtract(1, 'month').startOf('month').toISOString()
    const prevMonthEnd = today.subtract(1, 'month').endOf('month').toISOString()
    previousRecords = store.records.filter(r => r.date >= prevMonthStart && r.date <= prevMonthEnd)
  }

  return previousRecords.reduce((sum, r) => sum + r.amount, 0)
})

const trendAmount = computed(() => totalAmount.value - previousAmount.value)

const dailyAverage = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  const days = getDaysCount()
  return days > 0 ? totalAmount.value / days : 0
})

const maxAmount = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.max(...filteredRecords.value.map(r => r.amount))
})

const maxCategory = computed(() => {
  if (filteredRecords.value.length === 0) return '-'
  const maxRecord = filteredRecords.value.reduce((max, r) =>
    r.amount > max.amount ? r : max
  )
  return categories.find(c => c.id === maxRecord.category1)?.children?.find(child => child.id === maxRecord.category2)?.name || '-'
})

// 获取月度已支出金额
function getMonthlySpent() {
  const today = dayjs()
  const monthStart = today.startOf('month').toISOString()
  const monthEnd = today.endOf('month').toISOString()

  return filteredRecords.value
    .filter(r => r.date >= monthStart && r.date <= monthEnd)
    .reduce((sum, r) => sum + r.amount, 0)
}

// 获取预算使用百分比
function getBudgetPercentage() {
  const spent = getMonthlySpent()
  return store.monthlyBudget > 0 ? (spent / store.monthlyBudget) * 100 : 0
}

// 获取预算颜色
function getBudgetColor(percentage: number) {
  if (percentage > 100) return '#F56C6C'
  if (percentage > 90) return '#E6A23C'
  return '#67C23A'
}

// 获取天数
function getDaysCount() {
  if (timeRange.value === 'today') return 1
  if (timeRange.value === 'week') return 7
  if (timeRange.value === 'month') return dayjs().daysInMonth()
  if (timeRange.value === 'year') return 365
  if (timeRange.value === 'custom' && customDateRange.value) {
    return dayjs(customDateRange.value[1]).diff(dayjs(customDateRange.value[0]), 'day') + 1
  }
  return 1
}

// 分类排行数据
const rankingData = computed(() => {
  const categoryMap = new Map<string, {
    id: string
    name: string
    icon: string
    color: string
    amount: number
    count: number
  }>()

  filteredRecords.value.forEach(r => {
    const key = `${r.category1}-${r.category2}`
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        id: r.category2,
        name: r.category2,
        icon: categories.find(c => c.id === r.category1)?.children?.find(child => child.id === r.category2)?.icon || '📁',
        color: categories.find(c => c.id === r.category1)?.children?.find(child => child.id === r.category2)?.color || '#909399',
        amount: 0,
        count: 0,
      })
    }
    const item = categoryMap.get(key)!
    item.amount += r.amount
    item.count += 1
  })

  let data = Array.from(categoryMap.values())

  // 排序
  if (sortType.value === 'amount') {
    data.sort((a, b) => b.amount - a.amount)
  } else if (sortType.value === 'count') {
    data.sort((a, b) => b.count - a.count)
  } else if (sortType.value === 'name') {
    data.sort((a, b) => a.name.localeCompare(b.name))
  }

  // 添加排名和百分比
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  data = data.map((item, index) => ({
    ...item,
    rank: index + 1,
    percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0,
    average: item.count > 0 ? item.amount / item.count : 0,
  }))

  return data
})

// 处理时间范围变化
function handleTimeRangeChange() {
  if (timeRange.value === 'custom') {
    customDateRange.value = [
      dayjs().startOf('month').format('YYYY-MM-DD'),
      dayjs().endOf('month').format('YYYY-MM-DD'),
    ]
  }
}

// 处理排序变化
function handleSortChange() {
  // 排序逻辑在计算属性中处理
}

// 导出统计
async function handleExport() {
  try {
    const exportData = {
      exportTime: new Date().toISOString(),
      statistics: {
        timeRange: timeRange.value,
        customDateRange: customDateRange.value,
        totalAmount: totalAmount.value,
        dailyAverage: dailyAverage.value,
        maxAmount: maxAmount.value,
        maxCategory: maxCategory.value,
        recordCount: filteredRecords.value.length,
      },
      trendData: rankingData.value.map(item => ({
        date: item.name,
        amount: item.amount,
      })),
      categoryDistribution: rankingData.value.map(item => ({
        name: item.name,
        amount: item.amount,
        percentage: item.percentage,
      })),
      records: filteredRecords.value.map(r => ({
        date: r.date,
        amount: r.amount,
        category1: r.category1,
        category2: r.category2,
        note: r.note,
      })),
    }

    // 创建导出格式数据
    const exportFormatData = {
      categories,
      ...exportData,
    }

    ElMessageBox.confirm(
      '您想要导出哪种格式？\n\n' +
      '• JSON: 完整数据，可用于导入\n' +
      '• CSV: 表格格式，可导入Excel\n' +
      '• Excel: 带格式美化，可直接使用',
      '选择导出格式',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '导出JSON',
        cancelButtonText: '导出CSV',
        closeOnClickModal: false,
      }
    ).then(async (action) => {
      const format = action === 'confirm' ? 'json' : 'csv'
      const result = await window.electronAPI.exportData(exportFormatData, format as 'json' | 'csv')
      if (result.success) {
        ElMessage.success(`${format.toUpperCase()} 数据已导出到: ${result.path}`)
      } else {
        ElMessage.error('导出失败: ' + result.error)
      }
    }).catch((action) => {
      // 用户点击取消，导出CSV
      if (action === 'cancel') {
        const result = window.electronAPI.exportData(exportFormatData, 'csv')
        if (result.success) {
          ElMessage.success('CSV 数据已导出到: ' + result.path)
        } else {
          ElMessage.error('导出失败: ' + result.error)
        }
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 初始化图表
function initCharts() {
  // 确保DOM已渲染
  if (!trendChartRef.value || !pieChartRef.value) {
    console.log('Chart refs not ready')
    return
  }

  // 稍微延迟初始化，确保DOM完全渲染
  setTimeout(() => {
    // 初始化趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      updateTrendChart()
    }

    // 初始化饼图
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
      updatePieChart()
    }
  }, 100)
}

// 更新趋势图
function updateTrendChart() {
  if (!trendChart) return

  const data: { date: string; amount: number }[] = []

  // 按日期分组
  const dailyMap = new Map<string, number>()
  filteredRecords.value.forEach(r => {
    const day = r.date.split('T')[0]
    dailyMap.set(day, (dailyMap.get(day) || 0) + r.amount)
  })

  // 生成日期序列
  const days = getDaysCount()
  const today = dayjs()

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD')
    data.push({
      date,
      amount: dailyMap.get(date) || 0,
    })
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>支出: ¥{c}',
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [{
      type: chartType.value,
      data: data.map(d => d.amount),
      itemStyle: {
        color: '#409EFF',
      },
      lineStyle: {
        width: 3,
      },
    }],
  }

  trendChart.setOption(option)
}

// 更新饼图
function updatePieChart() {
  if (!pieChart) return

  const data = rankingData.value.map(item => ({
    name: item.name,
    value: item.amount,
    itemStyle: {
      color: item.color,
    },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)',
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      data: data.map(d => d.name),
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    }],
  }

  pieChart.setOption(option)
}

// 监听变化
watch([filteredRecords, chartType, sortType, timeRange], () => {
  updateTrendChartDebounced()
  updatePieChartDebounced()
})

// 组件挂载
onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
  })
})
</script>

<style scoped lang="css">
.statistics-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.range-card {
  border-radius: 12px;
  flex-shrink: 0;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .range-header {
    span {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .custom-range {
    margin-top: 12px;
  }

  .date-range-picker {
    width: 100%;
  }
}

.stats-overview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .overview-card {
    border-radius: 12px;
    transition: all 0.3s;
    flex: 1;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
      overflow-y: auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 15px;
      }
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;

      .trend-text {
        font-size: 14px;
      }
    }

    .stat-count {
      font-size: 14px;
      color: #909399;
    }

    .stat-category {
      font-size: 14px;
      color: #67C23A;
    }

    .budget-value {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
      margin-bottom: 8px;
    }

    .budget-detail {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;

      span:last-child {
        color: #67C23A;
        font-weight: 500;
      }
    }

    .budget-progress {
      margin-top: 8px;
    }

    .budget-percent-text {
      text-align: center;
      font-size: 13px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .budget-card {
    border: 1px solid #E6A23C;

    .card-header {
      color: #E6A23C;
    }
  }
}

.stats-overview {
  .overview-card {
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 15px;
      }
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;

      .trend-text {
        font-size: 14px;
      }
    }

    .stat-count {
      font-size: 14px;
      color: #909399;
    }

    .stat-category {
      font-size: 14px;
      color: #67C23A;
    }
  }
}

.charts-row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .chart-card {
    border-radius: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .chart-container {
      width: 100%;
      height: 300px;
      flex-shrink: 0;
      margin-bottom: 16px;
    }
  }
}

.ranking-card {
  border-radius: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    span {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      font-size: 14px;
    }
  }

  .amount-cell {
    color: #E74C3C;
    font-weight: 500;
  }

  .percentage-bar {
    width: 100px;
  }

  .percentage-text {
    margin-left: 8px;
    color: #909399;
    font-size: 13px;
  }
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 20px;
}
</style>
