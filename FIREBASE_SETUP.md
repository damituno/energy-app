# Firebase 配置指南

本应用使用Firebase作为后端服务，包括用户认证和Firestore数据库。

## 1. 创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目"
3. 输入项目名称（如 "energy-app"）
4. 按提示完成创建

## 2. 添加Android应用

1. 在项目概览中点击 "</>" 图标添加应用
2. 选择 "Android" 平台
3. 输入包名: `com.energy.app`
4. 输入应用昵称（可选）
5. 下载 `google-services.json` 文件
6. 将文件放入 `android/app/` 目录

## 3. 启用认证服务

1. 在左侧菜单选择 "构建" → "Authentication"
2. 点击 "开始使用"
3. 启用以下登录方式:
   - **匿名登录** (用于快速体验)
   - **手机号登录** (用于正式登录)
     - 需要添加SHA-1指纹（可选，用于生产环境）

## 4. 创建Firestore数据库

1. 在左侧菜单选择 "构建" → "Firestore Database"
2. 点击 "创建数据库"
3. 选择 "以测试模式开始"（开发阶段）
4. 选择数据库位置（建议选择离用户最近的区域）

## 5. 更新Web配置

1. 在项目设置中找到 "Web应用" 配置
2. 复制配置对象
3. 更新 `src/lib/firebase.ts` 中的配置:

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

## 6. 配置安全规则（生产环境）

在Firestore Database → 规则中设置:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /plans/{planId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 7. 重新构建应用

更新配置后，重新同步Capacitor:

```bash
npm run build
npx cap sync
```

## 注意事项

- **测试模式**: 开发阶段使用，允许所有读写操作
- **生产模式**: 发布前务必配置安全规则
- **配额**: Firebase免费版有每日限额，注意监控使用量
- **SHA-1指纹**: 生产环境需要添加用于Google登录验证
