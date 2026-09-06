import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import HomeView from '../views/HomeView.vue'
import RecordView from '../views/RecordView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import DataManagementView from '../views/DataManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/record',
      name: 'record',
      component: RecordView,
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView,
    },
    {
      path: '/data-management',
      name: 'data-management',
      component: DataManagementView,
    },
  ],
})

export default router