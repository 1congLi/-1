<template>
  <div id="app" class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <h1>黑马记账</h1>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            :icon="Setting"
            @click="goToCategoryManagement"
          >
            分类管理
          </el-button>
          <el-button
            type="primary"
            :icon="Plus"
            @click="goToRecord"
          >
            记一笔
          </el-button>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>

      <el-footer class="app-footer">
        <div class="footer-content">
          <div class="footer-stat">
            <span class="stat-label">今日支出</span>
            <span class="stat-value">¥{{ store.getTotalAmount().toFixed(2) }}</span>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Setting } from '@element-plus/icons-vue'
import { useAppStore } from './store'

const router = useRouter()
const store = useAppStore()

// 启动时从本地磁盘加载历史数据，保证重启后记录仍可见
onMounted(() => {
  store.init()
})

function goToRecord() {
  router.push('/record')
}

function goToCategoryManagement() {
  router.push('/category-management')
}
</script>

<style scoped lang="css">
.app-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 24px;
    margin: 0;
  }
}

.app-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 10px 20px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;

    .footer-stat {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-label {
        font-size: 14px;
        color: #909399;
      }

      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: #409EFF;
      }
    }
  }
}
</style>
