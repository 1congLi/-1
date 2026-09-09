# 黑马记账 📊

<div align="center">

**一个简洁好用的跨平台桌面记账应用**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourname/heima-accounting/releases)
[![Electron](https://img.shields.io/badge/Electron-44.2.0-47848F)](https://www.electronjs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-blue.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 📖 简介

黑马记账是一款专为个人设计的跨平台桌面记账应用，支持 Windows 和 macOS 系统。采用 Electron + Vue 3 技术栈开发，提供简洁直观的用户界面和完善的记账功能。

### ✨ 主要功能

#### 💰 花销记录
- 支持输入金额（精确到小数点后两位）
- 自由选择日期
- 2级分类体系（10个一级大类，80个二级小类）
- 支持添加备注
- 支持上传消费凭证图片（最多5MB）

#### 📊 数据统计
- 多维度数据展示：总支出、日均支出、最大单笔
- 支出趋势图（折线图/柱状图切换）
- 分类占比饼图
- 分类排行（支持按金额、笔数、名称排序）
- 月度预算管理及提醒

#### 📁 分类管理
- **系统分类**：预置10个一级大类和80个二级小类
  - 餐饮美食、交通出行、购物消费、休闲娱乐
  - 居住缴费、医疗健康、教育学习、人情往来
  - 工作相关、其他支出
- **自定义分类**：用户可添加、编辑、删除分类
- 支持自定义图标和颜色

#### 💾 数据管理
- **数据备份**：一键备份到本地
- **数据恢复**：从备份文件恢复数据
- **数据导出**：支持 JSON、CSV、Excel 格式
- **数据导入**：导入 JSON 文件合并数据
- **数据清理**：清理重复记录、空记录、旧数据

#### 🔒 数据安全
- 本地数据存储，数据完全掌握在自己手中
- 定期备份提醒
- 恢复数据前确认提示

### 🎯 适用场景

- 个人日常消费记录
- 家庭开支管理
- 预算规划与控制
- 消费习惯分析
- 财务数据导出分析

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourname/heima-accounting.git
cd heima-accounting

# 2. 安装依赖
npm install

# 3. 开发模式启动
npm run dev

# 4. 打包应用（Windows/Mac）
npm run build
```

### 运行应用

开发模式下，应用会在 `http://127.0.0.1:5173` 启动。

打包后的应用会生成在 `dist` 目录下，可以直接运行 `.exe`（Windows）或 `.dmg`（macOS）文件。

## 📱 功能截图

> [功能截图待补充]

### 主要界面

1. **主页**：展示今日/本周/本月/全部记录，支持搜索和分类筛选
2. **记一笔**：添加花销记录，支持图片上传
3. **统计分析**：图表展示和数据统计
4. **分类管理**：管理系统分类和自定义分类
5. **数据管理**：备份、恢复、导入、导出

## 🛠️ 技术栈

### 前端技术
- **框架**: [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **构建工具**: [Vite](https://vitejs.dev/) - 下一代前端构建工具
- **UI 组件库**: [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
- **图标库**: [Element Plus Icons](https://element-plus.org/zh-CN/component/icon.html)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐的状态管理库
- **路由**: [Vue Router](https://router.vuejs.org/) - Vue 官方路由
- **图表库**: [ECharts](https://echarts.apache.org/) - 百度开源的图表库
- **日期处理**: [dayjs](https://day.js.org/) - 轻量级日期处理库

### 桌面技术
- **框架**: [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- **预加载脚本**: Context isolation 实现 IPC 通信
- **文件操作**: Node.js fs 模块

### 构建工具
- **构建脚本**: Vite + Electron Builder
- **打包格式**:
  - Windows: NSIS 安装程序
  - macOS: DMG 镜像文件

## 📁 项目结构

```
heima-accounting/
├── src/                          # Vue 3 前端应用
│   ├── views/                    # 页面组件
│   │   ├── HomeView.vue          # 主页
│   │   ├── RecordView.vue        # 记录花销
│   │   ├── StatisticsView.vue    # 统计分析
│   │   ├── DataManagementView.vue # 数据管理
│   │   └── CategoryManagementView.vue # 分类管理
│   ├── components/               # 公共组件
│   ├── store/                    # Pinia 状态管理
│   │   └── index.ts              # 应用状态
│   ├── router/                   # 路由配置
│   │   └── index.ts
│   ├── data.ts                   # 预设分类数据
│   ├── types.ts                  # TypeScript 类型定义
│   ├── App.vue                   # 根组件
│   └── main.ts                   # Vue 应用入口
├── src-electron/                 # Electron 主进程
│   ├── main.ts                   # 主进程入口
│   ├── preload.ts                # 预加载脚本（IPC 通信）
│   ├── electron.ts               # Electron 启动脚本
│   └── isDev.ts                  # 环境判断
├── docs/                         # 文档
│   └── USER_GUIDE.md             # 用户使用指南
├── index.html                    # HTML 入口
├── vite.config.ts                # Vite 配置
├── electron-builder.json         # 打包配置
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
└── CLAUDE.md                     # 项目记录
```

## 🔧 开发指南

### 添加新功能

1. **添加新页面**
   - 在 `src/views/` 创建新组件
   - 在 `src/router/index.ts` 添加路由配置

2. **添加状态管理**
   - 在 `src/store/index.ts` 添加新的 state、getter、mutation、action

3. **修改分类系统**
   - 编辑 `src/data.ts` 中的 `categories` 数组

4. **修改样式**
   - 在组件的 `<style scoped>` 中修改
   - 在 `src/styles/global.css` 中修改全局样式

### IPC 通信

Electron 主进程和渲染进程通过 IPC 通信：

```typescript
// 渲染进程调用（在 preload.ts 中暴露）
window.electronAPI.saveData(data)
window.electronAPI.loadData()
window.electronAPI.exportData(data, format)

// 主进程处理（在 main.ts 中）
ipcMain.handle('save-data', (event, data) => { ... })
ipcMain.handle('load-data', () => { ... })
```

### 数据存储

- **主数据文件**: `<userData>/accounting-data.json`
- **备份目录**: `<userData>/backups/`
- **自定义分类**: `<userData>/custom-categories.json`

数据格式：
```json
{
  "records": [
    {
      "id": "1234567890",
      "amount": 35.50,
      "date": "2026-09-02T12:00:00.000Z",
      "category1": "1",
      "category2": "1-2",
      "note": "午餐",
      "attachment": { "type": "image", "data": "base64...", "name": "receipt.jpg", "size": 102400 },
      "createdAt": "2026-09-02T12:00:00.000Z"
    }
  ],
  "userCategories": [
    {
      "id": "1234567891",
      "name": "学习资料",
      "icon": "📚",
      "color": "#2ECC71",
      "parentId": "7",
      "createdAt": "2026-09-02T12:00:00.000Z",
      "updatedAt": "2026-09-02T12:00:00.000Z"
    }
  ]
}
```

## 📦 打包发布

### Windows
```bash
npm run build
```
生成文件：`dist/heima-accounting Setup 1.0.0.exe`

### macOS
```bash
npm run build
```
生成文件：`dist/heima-accounting-1.0.0.dmg`

### 清理构建文件
```bash
npm run clean
```

## 🐛 常见问题

### Q: 应用启动失败？
A: 确保已安装所有依赖：`npm install`

### Q: 如何备份数据？
A: 进入"数据管理" → "数据备份" → "备份数据"

### Q: 如何恢复数据？
A: 进入"数据管理" → "数据恢复" → "选择备份文件" → "确认恢复"

### Q: 图片上传失败？
A: 确保图片格式为 JPG/PNG，大小不超过 5MB

### Q: 如何修改系统分类？
A: 系统分类是只读的，可以添加用户自定义分类

### Q: 数据可以同步到云端吗？
A: 当前版本不支持，数据存储在本地

## 📝 更新日志

### v1.0.0 (2026-09-07)
- ✨ 初始版本发布
- ✅ 支持花销记录、编辑、删除
- ✅ 10个一级分类，80个二级分类
- ✅ 用户自定义分类管理
- ✅ 数据统计和图表分析
- ✅ 预算管理和提醒
- ✅ 数据备份和恢复
- ✅ 数据导出（JSON、CSV、Excel）
- ✅ 数据导入和合并
- ✅ 数据清理功能
- ✅ 图片附件支持

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript
- 遵循 Vue 3 Composition API 规范
- 使用 Pinia 管理状态
- 编写清晰的注释
- 提交前测试功能

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 👥 作者

**黑马记账**
- 项目地址: https://github.com/yourname/heima-accounting
- Email: your.email@example.com

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [Vue 3](https://vuejs.org/) - 前端框架
- [Element Plus](https://element-plus.org/) - UI 组件库
- [ECharts](https://echarts.apache.org/) - 图表库

## 📮 联系方式

- 提交 Issue: [Issues](https://github.com/yourname/heima-accounting/issues)
- 发起讨论: [Discussions](https://github.com/yourname/heima-accounting/discussions)

---

<div align="center">

**如果觉得有用，请给个 ⭐️ Star！**

Made with ❤️ by 黑马记账团队

</div>
