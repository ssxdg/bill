# Web 端运行与 Android APK 打包指南

本文档说明本项目在 Web 端运行、调试，以及通过 EAS Build 打包成可直接安装到 Android 手机的 APK 的完整流程。

项目应用目录：

```bash
e:\LLM\bill\billapp
```

---

## 1. 项目技术栈说明

本项目是基于 Expo 的 React Native 应用，主要用于记录支出账单。

关键技术：

- **Expo SDK**：`~55.0.24`
- **React Native**：`0.83.6`
- **React**：`19.2.0`
- **Expo Router**：页面路由
- **AsyncStorage**：本地离线数据存储
- **Zustand**：状态管理
- **react-native-gifted-charts**：统计图表
- **EAS Build**：Android APK / AAB 云端构建

当前关键脚本位于 `package.json`：

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:apk": "eas build --platform android --profile preview",
    "build:aab": "eas build --platform android --profile production"
  }
}
```

---

## 2. 首次安装依赖

进入应用目录：

```bash
cd e:\LLM\bill\billapp
```

安装依赖：

```bash
npm install
```

如果后续要进行 EAS 云端构建，建议确保 `package-lock.json` 与 `package.json` 同步：

```bash
npm install --package-lock-only
```

可用以下命令检查云端构建使用的 `npm ci` 是否能通过：

```bash
npm ci --include=dev --dry-run
```

如果该命令报错，通常说明 `package-lock.json` 与 `package.json` 不同步，需要重新执行：

```bash
npm install --package-lock-only
```

---

## 3. Web 端运行

### 3.1 启动 Web 开发服务

在应用目录执行：

```bash
npm run web
```

Expo/Metro 启动后，默认会在浏览器中打开 Web 页面。

常见访问地址：

```txt
http://localhost:8081
```

如果端口被占用，Expo 可能会提示使用其他端口，请以终端输出为准。

---

### 3.2 清理缓存后启动

如果出现页面白屏、旧代码未生效、依赖解析异常等问题，可以使用清缓存方式启动：

```bash
npx expo start --web -c
```

其中 `-c` 表示清理 Metro 缓存。

---

### 3.3 Web 端常见问题

#### 3.3.1 浏览器报 `index.ts.bundle` 500 或 MIME type 错误

可能表现为：

```txt
Failed to load resource: the server responded with a status of 500
Refused to execute script because its MIME type ('application/json') is not executable
```

处理方向：

1. 查看启动终端中的真实报错。
2. 确认 Web 相关依赖已安装：

```bash
npm install
```

3. 清缓存重启：

```bash
npx expo start --web -c
```

本项目已经配置并安装了 Web 运行所需依赖，例如：

- `react-dom`
- `react-native-web`
- `expo-linking`
- `react-native-worklets`
- `expo-linear-gradient`

---

#### 3.3.2 图表报 Gradient 相关错误

如果出现类似：

```txt
Gradient package was not found
```

说明图表库依赖渐变组件。当前项目已安装：

```txt
expo-linear-gradient
```

如果依赖丢失，可重新安装依赖：

```bash
npm install
```

---

#### 3.3.3 删除、清空数据按钮在 Web 端无反应

React Native 的 `Alert.alert` 在 Web 端兼容性有限。本项目已经针对 Web 端做了适配：

- Web 端使用浏览器原生 `confirm` / `alert`
- Android / iOS 端继续使用 `Alert.alert`

相关文件：

```txt
components\RecordItem.tsx
app\(tabs)\settings.tsx
```

---

## 4. Android APK 打包方式

本项目推荐使用 EAS Build 云端构建 APK。

原因：

- 本地不需要安装 Android Studio / Android SDK
- EAS 会在云端完成 Gradle、签名、构建
- 可以直接生成安卓手机可安装的 `.apk`

---

## 5. EAS 配置说明

当前项目已经包含 `eas.json`：

```json
{
  "cli": {
    "version": ">= 14.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

其中：

- **preview**：生成 `.apk`，适合直接安装到 Android 手机测试使用。
- **production**：生成 `.aab`，适合提交到 Google Play 等应用商店。

当前 APK 构建脚本：

```bash
npm run build:apk
```

实际执行：

```bash
eas build --platform android --profile preview
```

---

## 6. Expo / EAS 登录

首次使用 EAS Build 前，需要登录 Expo 账号。

执行：

```bash
npx eas login
```

按提示输入邮箱/用户名和密码。

登录成功后，可以查看当前账号：

```bash
npx eas whoami
```

如果没有 Expo 账号，需要先注册：

```txt
https://expo.dev/signup
```

---

## 7. 创建并关联 EAS 项目

第一次执行构建时，如果本地项目未关联 EAS 项目，终端会提示：

```txt
EAS project not configured.
Would you like to automatically create an EAS project?
```

选择 `yes` 即可。

成功后，`app.json` 会自动加入类似配置：

```json
{
  "extra": {
    "eas": {
      "projectId": "8db69ff9-7852-4fc3-9910-545beaf42402"
    }
  }
}
```

这表示本地项目已经和 Expo 云端项目绑定。

当前项目 Android 包名配置在 `app.json`：

```json
{
  "android": {
    "package": "com.bill.app"
  }
}
```

---

## 8. 构建 APK

确保已经完成：

1. 依赖安装完成。
2. 已登录 Expo / EAS。
3. `package-lock.json` 与 `package.json` 同步。
4. 本地项目已关联 EAS 项目。

然后执行：

```bash
npm run build:apk
```

构建过程中可能会提示：

```txt
Generate a new Android Keystore?
```

如果是第一次构建，选择 `yes`，让 EAS 自动生成 Android 签名证书。

构建成功后，终端会输出构建详情链接，例如：

```txt
https://expo.dev/accounts/你的账号/projects/billapp/builds/构建ID
```

进入该链接后，可以下载生成的 `.apk` 文件。

---

## 9. 安装 APK 到 Android 手机

APK 下载完成后，可以通过以下方式发送到手机：

- 微信 / QQ / 文件传输助手
- 数据线复制到手机
- 邮件附件
- 网盘下载

手机安装步骤：

1. 在手机上打开 `.apk` 文件。
2. 如果提示禁止安装未知来源应用，进入系统设置允许当前文件管理器或浏览器安装未知来源应用。
3. 返回后继续安装。
4. 安装完成后打开应用。

注意：

- APK 是内部测试包，不需要通过应用商店安装。
- 如果手机提示应用风险，请确认 APK 来源是你自己构建的 EAS 下载链接。

---

## 10. 构建失败排查

### 10.1 `npm ci` 失败：package-lock 不同步

EAS 云端构建安装依赖时会执行：

```bash
npm ci --include=dev
```

如果日志中出现：

```txt
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Invalid: lock file's xxx does not satisfy xxx
npm error Missing: xxx from lock file
```

说明 `package-lock.json` 与 `package.json` 不同步。

解决：

```bash
npm install --package-lock-only
npm ci --include=dev --dry-run
```

确认 dry-run 通过后重新构建：

```bash
npm run build:apk
```

---

### 10.2 Windows 本地 `npm ci` 报 EPERM

如果本地执行 `npm ci` 出现：

```txt
EPERM: operation not permitted, unlink ... lightningcss.win32-x64-msvc.node
```

通常是 Windows 文件被占用，例如：

- 开发服务器仍在运行
- 编辑器或杀毒软件占用 `node_modules`
- 某些原生模块文件未释放

处理方向：

1. 关闭正在运行的 Expo / Node 进程。
2. 关闭占用项目文件的终端或编辑器窗口后重试。
3. 必要时重启电脑。
4. 再执行：

```bash
npm install
```

该错误主要影响本地依赖清理，不一定代表 EAS 云端构建会失败。

---

### 10.3 `eas` 不是内部或外部命令

如果执行：

```bash
npm run build:apk
```

出现：

```txt
'eas' 不是内部或外部命令，也不是可运行的程序或批处理文件
```

说明本地 `node_modules` 中的 EAS CLI 可执行文件缺失。

解决：

```bash
npm install
```

或者直接使用：

```bash
npx eas build --platform android --profile preview
```

---

### 10.4 查看 EAS 构建日志

如果构建失败，终端会输出构建链接，例如：

```txt
See logs: https://expo.dev/accounts/xxx/projects/billapp/builds/xxxx
```

可以打开该链接查看详细日志。

也可以用命令查看构建信息：

```bash
npx eas build:view 构建ID
```

如果需要 JSON 输出：

```bash
npx eas build:view 构建ID --json
```

重点查看失败阶段，例如：

- `Install dependencies`
- `Run gradlew`
- `Prebuild`
- `Upload artifacts`

---

## 11. AAB 构建说明

如果需要生成应用商店上架用的 Android App Bundle，可以执行：

```bash
npm run build:aab
```

它会使用 `production` 配置，生成 `.aab` 文件。

区别：

- **APK**：可直接安装到手机，适合测试或自用。
- **AAB**：不能直接安装，主要用于 Google Play 等商店分发。

---

## 12. 推荐日常流程

### Web 开发调试

```bash
cd e:\LLM\bill\billapp
npm install
npm run web
```

如果遇到缓存问题：

```bash
npx expo start --web -c
```

### Android APK 打包

```bash
cd e:\LLM\bill\billapp
npm install
npm install --package-lock-only
npm ci --include=dev --dry-run
npx eas login
npm run build:apk
```

构建成功后，从 EAS 构建页面下载 APK 并安装到 Android 手机。

---

## 13. 当前项目已知配置状态

当前项目已经具备 APK 云端构建的基础配置：

- 已配置 `app.json` Android 包名：`com.bill.app`
- 已配置 `app.json` EAS 项目 ID：`8db69ff9-7852-4fc3-9910-545beaf42402`
- 已配置 `eas.json` 的 `preview` APK 构建模式
- 已配置 `package.json` 的 `build:apk` 脚本
- 已安装本地 `eas-cli`

如果后续构建仍失败，应优先查看 EAS 构建日志中的具体失败阶段。
