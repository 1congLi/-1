# 黑马记账 - 个人消费记录应用

一个基于 Electron + Vue 3 开发的跨平台桌面记账应用，支持 Windows 和 Mac 系统。

## 功能特性

### ✨ 核心功能
- 📝 记录日常花销，支持金额、日期、分类、备注
- 📊 2级分类体系（一级大类 + 二级小类）
- 📈 数据统计分析（支出趋势、分类占比、排行）
- 💾 本地数据存储，数据安全可靠
- 🎨 美观的界面设计，操作简单直观

### 📱 跨平台支持
- Windows 10/11
- macOS

## 技术栈

- **桌面框架**: Electron
- **前端框架**: Vue 3
- **UI组件库**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **图表库**: ECharts
- **日期处理**: dayjs

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 构建应用

```bash
npm run build
```

## 项目结构

```
├── src-electron/         # Electron 主进程
│   ├── main.ts          # 主进程入口
│   ├── preload.ts       # 预加载脚本
│   └── electron.ts      # Electron 启动脚本
├── src/                  # Vue 3 前端应用
│   ├── components/      # 组件
│   ├── views/          # 页面
│   ├── store/          # 状态管理
│   ├── router/         # 路由
│   └── main.ts         # 前端入口
└── package.json        # 项目配置
```

## 开发指南

### 添加新功能
1. 在对应的 views 目录下创建页面组件
2. 在 router/index.ts 中添加路由配置
3. 在 store 中添加状态管理逻辑

### 修改分类系统
编辑 `src/data.ts` 文件中的 `categories` 数组，可以修改分类体系和图标。

### 数据存储
应用数据存储在用户的 `userData` 目录下，文件名为 `accounting-data.json`。

## 构建发布

### Windows
```bash
npm run build
```

### macOS
```bash
npm run build
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
