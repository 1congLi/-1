<template>
  <div class="home-view">
    <!-- 搜索和视图切换 -->
    <el-card class="control-card">
      <div class="control-header">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索记录（金额、分类、备注）"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        <div class="view-switcher">
          <el-radio-group v-model="store.currentView" @change="handleViewChange">
            <el-radio-button value="today">今日</el-radio-button>
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="all">全部</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="12">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">
              <span class="stat-title">总支出</span>
              <el-icon :size="20" color="#409EFF"><Money /></el-icon>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">¥{{ store.getTotalAmount().toFixed(2) }}</div>
            <div class="stat-desc">共 {{ store.getFilteredRecords().length }} 笔</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">
              <span class="stat-title">本月预算</span>
              <el-icon :size="20" color="#67C23A"><Coin /></el-icon>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">¥{{ store.monthlyBudget.toFixed(2) }}</div>
            <div class="stat-desc">
              <span class="budget-remaining">剩余 ¥{{ store.getBudgetProgress().remaining.toFixed(2) }}</span>
              <el-progress
                :percentage="store.getBudgetProgress().percentage"
                :color="getBudgetColor(store.getBudgetProgress().percentage)"
                :show-text="false"
                class="budget-progress"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类筛选 -->
    <el-card class="category-filter">
      <template #header>
        <div class="filter-header">
          <span>分类筛选</span>
          <el-button
            text
            :icon="Refresh"
            @click="store.resetFilters"
          >
            重置
          </el-button>
        </div>
      </template>
      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: store.selectedCategory === category.id }"
          @click="handleCategoryClick(category.id)"
        >
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            <span>{{ category.icon }}</span>
          </div>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </el-card>

    <!-- 记录列表 -->
    <el-card class="records-card">
      <template #header>
        <div class="records-header">
          <span>支出记录</span>
          <el-button
            text
            :icon="Refresh"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-empty
        v-if="filteredRecords.length === 0"
        description="暂无支出记录"
        :image-size="100"
      />

      <div v-else class="records-list">
        <div
          v-for="record in paginatedRecords"
          :key="record.id"
          class="record-item"
          @click="handleRecordClick(record)"
        >
          <div class="record-main">
            <div class="record-left">
              <div class="record-category">
                <span class="category-icon" :style="{ backgroundColor: getCategoryColor(record.category1) }">
                  <span>{{ getCategoryIcon(record.category1) }}</span>
                </span>
                <span class="category-name">{{ record.category2 }}</span>
              </div>
              <div class="record-date">{{ formatDate(record.date) }}</div>
            </div>
            <div class="record-right">
              <div class="record-amount">-¥{{ record.amount.toFixed(2) }}</div>
              <div v-if="record.note" class="record-note">{{ record.note }}</div>
            </div>
          </div>
          <div class="record-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredRecords.length"
            layout="prev, pager, next, jumper"
            @current-change="goToPage"
            small
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money, Coin, Refresh, ArrowRight, Search } from '@element-plus/icons-vue'
import { useAppStore } from '../store'
import { categories } from '../data'
import type { Record } from '../types'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAppStore()
const searchKeyword = ref('')

// 分页
const pageSize = ref(20)
const currentPage = ref(1)

const filteredRecords = computed(() => {
  let records = store.getFilteredRecords()

  // 搜索功能
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    records = records.filter(record => {
      // 搜索金额
      if (record.amount.toString().includes(keyword)) {
        return true
      }
      // 搜索分类
      if (record.category1.toLowerCase().includes(keyword) ||
          record.category2.toLowerCase().includes(keyword)) {
        return true
      }
      // 搜索备注
      if (record.note && record.note.toLowerCase().includes(keyword)) {
        return true
      }
      // 搜索日期
      if (record.date.toLowerCase().includes(keyword)) {
        return true
      }
      return false
    })
  }

  return records
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pageSize.value)
})

// 切换页码
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function handleViewChange() {
  // 视图切换时清空分类筛选
  store.selectedCategory = null
}

function handleCategoryClick(categoryId: string) {
  if (store.selectedCategory === categoryId) {
    store.selectedCategory = null
  } else {
    store.selectedCategory = categoryId
  }
}

function handleRefresh() {
  // 刷新记录
  store.init()
}

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

function getCategoryColor(categoryId: string) {
  const category = categories.find((c) => c.id === categoryId)
  return category?.color || '#909399'
}

function getCategoryIcon(categoryId: string) {
  const category = categories.find((c) => c.id === categoryId)
  return category?.icon || '📁'
}

function getBudgetColor(percentage: number) {
  if (percentage > 100) return '#F56C6C'
  if (percentage > 90) return '#E6A23C'
  return '#67C23A'
}

function handleRecordClick(record: Record) {
  router.push({
    path: '/record',
    query: { id: record.id },
  })
}

function handleSearch() {
  // 搜索时重置分类筛选
  store.selectedCategory = null
  currentPage.value = 1
  if (searchKeyword.value.trim()) {
    ElMessage.info('搜索功能已应用')
  }
}
</script>

<style scoped lang="css">
.home-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-card {
  border-radius: 12px;

  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .search-box {
      flex: 1;
      max-width: 400px;
    }

    .view-switcher {
      flex: 1;
    }
  }
}

.view-switcher {
  border-radius: 12px;
}

.stats-row {
  .stat-card {
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 8px;
      }

      .stat-desc {
        font-size: 14px;
        color: #909399;
      }

      .budget-remaining {
        font-size: 14px;
        color: #67C23A;
        margin-bottom: 8px;
        display: block;
      }

      .budget-progress {
        margin-top: 8px;
      }
    }
  }
}

.category-filter {
  border-radius: 12px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
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
    }

    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 14px;
    }

    .category-name {
      font-size: 14px;
    }
  }
}

.records-card {
  border-radius: 12px;
  flex: 1;

  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .record-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
      border-color: #409EFF;
    }

    .record-main {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      .record-left {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .record-category {
          display: flex;
          align-items: center;
          gap: 8px;

          .category-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            font-size: 18px;
          }

          .category-name {
            font-size: 15px;
            font-weight: 500;
          }
        }

        .record-date {
          font-size: 13px;
          color: #909399;
        }
      }

      .record-right {
        text-align: right;

        .record-amount {
          font-size: 18px;
          font-weight: bold;
          color: #E74C3C;
          margin-bottom: 4px;
        }

        .record-note {
          font-size: 13px;
          color: #909399;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .record-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #f5f7fa;
      color: #909399;
      transition: all 0.3s;
    }

    &:hover .record-arrow {
      background-color: #409EFF;
      color: white;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
