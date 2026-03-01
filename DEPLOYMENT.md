# 部署指南

本文档介绍如何将能量管理应用部署为Android APK并通过GitHub Releases分发。

## 部署流程概览

```
开发 → GitHub托管 → GitHub Actions构建 → GitHub Releases分发
```

## 方式一: GitHub Actions自动构建（推荐）

### 1. 准备代码

```bash
# 确保所有更改已提交
git add .
git commit -m "准备发布 v1.0.0"
```

### 2. 创建GitHub仓库

```bash
# 在GitHub创建新仓库（不要初始化README）
# 然后推送代码
git remote add origin https://github.com/YOUR_USERNAME/energy-app.git
git push -u origin main
```

### 3. 配置Firebase

按照 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) 配置:
- 创建Firebase项目
- 添加Android应用
- 下载 `google-services.json` 到 `android/app/`
- 提交并推送更改

### 4. 创建Release

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

推送标签后，GitHub Actions会自动:
1. 构建React应用
2. 构建Android APK
3. 创建GitHub Release
4. 上传APK文件

### 5. 下载APK

1. 访问仓库的 Releases 页面
2. 找到最新版本
3. 下载 `能量管理-v1.0.0.apk`

## 方式二: 本地构建

### 环境要求

- Node.js 18+
- Java 17+
- Android SDK
- Android Studio（可选）

### 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建Web应用
npm run build

# 3. 同步Capacitor
npx cap sync

# 4. 打开Android Studio（可选）
npx cap open android

# 5. 命令行构建APK
cd android
./gradlew assembleRelease

# APK输出位置:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 签名APK（发布用）

```bash
# 生成密钥库
keytool -genkey -v -keystore energy-app.keystore -alias energy -keyalg RSA -keysize 2048 -validity 10000

# 签名APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore energy-app.keystore app-release-unsigned.apk energy

# 优化APK
zipalign -v 4 app-release-unsigned.apk energy-app-signed.apk
```

## GitHub Actions工作流说明

工作流文件: `.github/workflows/build-apk.yml`

### 触发条件

- 推送到 `main` 或 `master` 分支
- 创建以 `v` 开头的标签（如 `v1.0.0`）
- 手动触发

### 构建流程

1. **build-web**: 构建React应用
2. **build-android**: 构建未签名APK
3. **release**: 创建Release并上传APK（仅标签触发）

### 自定义配置

编辑 `.github/workflows/build-apk.yml`:

```yaml
# 修改应用ID
capacitor.config.ts 中: appId: 'com.yourcompany.app'

# 修改应用名称
capacitor.config.ts 中: appName: '您的应用名'

# 修改版本号
android/app/build.gradle 中: versionCode 和 versionName
```

## 常见问题

### Q: 构建失败，提示找不到Android SDK
A: GitHub Actions已配置自动安装Android SDK，本地构建需要手动安装。

### Q: APK安装失败
A: 确保设备允许安装未知来源应用。设置 → 安全 → 未知来源。

### Q: Firebase登录失败
A: 检查 `google-services.json` 是否正确配置，包名是否匹配。

### Q: 如何更新应用
A: 增加 `android/app/build.gradle` 中的 `versionCode`，重新构建并发布。

## 发布检查清单

- [ ] Firebase配置完成
- [ ] `google-services.json` 已添加到项目
- [ ] 版本号已更新
- [ ] 代码已推送到GitHub
- [ ] GitHub Actions构建成功
- [ ] Release页面APK可下载
- [ ] APK可在Android设备安装运行
