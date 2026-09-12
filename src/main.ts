import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import { useAppStore } from './store'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 先从磁盘加载持久化数据，再挂载应用：保证首屏渲染时历史记录已就位，
// 避免出现"先渲染空列表、再补充数据"的中间状态
useAppStore(pinia)
  .init()
  .finally(() => {
    app.mount('#app')
  })
