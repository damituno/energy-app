# Bug 修复总结

## 修复的问题

### 1. 点击"开始体验"无响应
**原因**: OnboardingPage 的 `onComplete` 和 `onSkip` 是空函数，没有更新用户状态。

**修复**: 
- 在 OnboardingPage 内部直接调用 `dispatch` 更新用户状态
- 点击"开始体验"或"跳过"时，将 `isNewUser` 设置为 `false`
- 这会触发重新渲染，进入问卷页面

### 2. 手机号登录没有真实验证码
**原因**: LoginPage 中的验证码发送是模拟的，没有真正调用 Firebase。

**修复**:
- 集成 Firebase Phone Auth
- 使用 `signInWithPhoneNumber` 发送真实验证码
- 添加 reCAPTCHA 验证器
- 添加"演示模式"按钮，方便测试

### 3. 问卷页面不显示
**原因**: App.tsx 中的流程控制逻辑有问题。

**修复**:
- 简化流程控制逻辑
- 引导页直接更新用户状态
- 问卷完成后调用 `generatePlan()` 生成计划

## 当前应用流程

```
1. 启动应用
   ↓
2. 登录页面（手机号/演示模式）
   ↓
3. 引导页（3页介绍）
   ↓ 点击"开始体验"或"跳过"
4. 问卷页（10题用户画像）
   ↓ 点击"完成"
5. 首页（能量评估 + 今日任务）
```

## 测试说明

### 演示模式
在登录页面点击"演示模式（跳过登录）"可以直接进入应用，无需验证码。

### 正常流程
1. 输入手机号
2. 点击"获取验证码"
3. 输入收到的验证码
4. 完成引导页
5. 完成问卷
6. 进入主应用

## 待配置项

### Firebase 配置
需要在 `src/lib/firebase.ts` 中配置真实的 Firebase 项目：
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 启用手机号登录
在 Firebase Console 中：
1. 进入 Authentication
2. 点击"开始使用"
3. 启用"手机号"登录方式

## Web 测试地址
https://fup7wlpxsqmr4.ok.kimi.link

## 构建 APK
```bash
# 同步 Capacitor
npx cap sync

# 构建 APK
cd android && ./gradlew assembleRelease
```
