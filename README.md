# 能量管理 - 智能任务管理应用

一款基于能量状态的任务管理应用，根据用户每日能量水平智能生成个性化任务计划。

## 功能特性

- 能量状态评估（1-5级）
- 三档任务结构（基础/常规/挑战）
- 智能任务生成算法（基于Yerkes-Dodson定律）
- 随机幸运任务与奖励系统
- 番茄钟计时器
- 任务完成圆环可视化
- 统计与成就系统
- 用户画像问卷（10题）
- VIP订阅系统
- 夜间/白天双模式

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Capacitor（Android打包）
- Firebase（Auth + Firestore）

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建Web应用

```bash
npm run build
```

### 构建Android APK

```bash
# 同步Capacitor
npx cap sync

# 打开Android Studio
npx cap open android

# 或者在命令行构建
cd android && ./gradlew assembleRelease
```

## GitHub Actions自动构建

本项目配置了GitHub Actions工作流，可以自动构建APK并发布到GitHub Releases：

1. 推送代码到 `main` 分支会触发构建
2. 创建以 `v` 开头的tag（如 `v1.0.0`）会自动创建Release

### 手动触发构建

在GitHub仓库页面，进入 Actions → Build Android APK → Run workflow

## 下载APK

访问 [Releases页面](../../releases) 下载最新版本APK。

## 项目结构

```
app/
├── src/
│   ├── components/     # UI组件
│   ├── context/        # React Context
│   ├── data/           # 静态数据
│   ├── lib/            # 工具函数和Firebase
│   ├── pages/          # 页面组件
│   └── types/          # TypeScript类型
├── android/            # Capacitor Android项目
├── .github/workflows/  # GitHub Actions
└── capacitor.config.ts # Capacitor配置
```

## 许可证

MIT License
