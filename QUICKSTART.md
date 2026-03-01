# 快速开始指南

## 项目概述

能量管理是一款基于能量状态的任务管理Android应用，使用React + Capacitor构建。

## 目录结构

```
app/
├── .github/workflows/     # GitHub Actions自动构建
├── android/               # Capacitor Android项目
├── scripts/               # 辅助脚本
├── src/
│   ├── components/        # UI组件
│   │   ├── timer/         # 计时器组件
│   │   ├── visualization/ # 可视化组件
│   │   └── ui/            # shadcn/ui组件
│   ├── context/           # React Context状态管理
│   ├── data/              # 问卷数据
│   ├── lib/               # 工具函数和Firebase
│   ├── pages/             # 页面组件
│   │   ├── auth/          # 登录页面
│   │   └── onboarding/    # 引导页面
│   └── types/             # TypeScript类型定义
├── capacitor.config.ts    # Capacitor配置
└── package.json           # 项目依赖
```

## 5分钟快速开始

### 1. 克隆并安装

```bash
cd /mnt/okcomputer/output/app
npm install
```

### 2. 本地开发

```bash
npm run dev
```
访问 http://localhost:5173

### 3. 配置Firebase（必需）

按照 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) 配置:
- 创建Firebase项目
- 下载 `google-services.json` 到 `android/app/`

### 4. 推送到GitHub

```bash
# 初始化仓库
git init
git add .
git commit -m "Initial commit"

# 创建GitHub仓库并推送
git remote add origin https://github.com/YOUR_USERNAME/energy-app.git
git push -u origin main
```

### 5. 发布APK

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions会自动构建APK并创建Release。

## 核心功能

| 功能 | 文件位置 |
|------|----------|
| 能量评估 | `src/components/EnergyGauge.tsx` |
| 任务列表 | `src/components/TaskList.tsx` |
| 番茄钟 | `src/components/timer/TaskTimer.tsx` |
| 圆环可视化 | `src/components/visualization/TaskRing.tsx` |
| 用户认证 | `src/pages/auth/LoginPage.tsx` |
| 问卷系统 | `src/pages/onboarding/QuestionnairePage.tsx` |
| 状态管理 | `src/context/AppContext.tsx` |
| Firebase API | `src/lib/firebase.ts` |

## 自定义配置

### 修改应用信息

编辑 `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.app',  // 修改包名
  appName: '您的应用名',           // 修改应用名
  webDir: 'dist'
};
```

### 修改版本号

编辑 `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 1           // 版本代码（整数，每次发布+1）
    versionName "1.0"       // 版本名称
}
```

### 修改问卷题目

编辑 `src/data/questions.ts`

### 修改VIP配置

编辑 `src/context/AppContext.tsx` 中的 `VIP_PRICES`

## 构建命令

```bash
# 构建Web
npm run build

# 同步Capacitor
npx cap sync

# 打开Android Studio
npx cap open android

# 构建Release APK
cd android && ./gradlew assembleRelease
```

## 常见问题

**Q: 如何修改幸运任务位置？**
A: 编辑 `src/pages/HomePage.tsx`，搜索 `fixed bottom-24 right-4`

**Q: 如何添加新任务类型？**
A: 编辑 `src/types/index.ts` 中的 `TaskType`

**Q: 如何修改主题颜色？**
A: 编辑 `tailwind.config.js` 中的 colors 配置

**Q: 如何禁用VIP系统？**
A: 编辑 `src/context/AppContext.tsx`，将 `isVip` 返回 `true`

## 文档索引

- [README.md](./README.md) - 项目介绍
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase配置
- [QUICKSTART.md](./QUICKSTART.md) - 本文件

## 技术支持

- [Capacitor文档](https://capacitorjs.com/docs)
- [Firebase文档](https://firebase.google.com/docs)
- [React文档](https://react.dev/)
