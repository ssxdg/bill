# Bill 记账本

一款基于 **React Native + Expo** 的手机离线记账应用，专为日常支出记录设计，数据存储于设备本地，无需联网。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 快速记账 | 金额输入、分类选择、日期、备注，一键保存 |
| 消费分类 | 8 个预设分类 + 支持新增/编辑/删除自定义分类（图标+颜色） |
| 账单列表 | 按月/自定义周期展示，支持编辑和删除每条记录 |
| 图表统计 | 分类占比饼图 · 每日趋势柱状图 · 近 6 个月对比柱状图 |
| 账单周期 | 可自定义每月起始日（如每月 25 日起至下月 24 日） |
| 货币符号 | 支持 ¥ / $ / € / £ / ₩ |
| 深色模式 | 自动跟随系统深色/浅色主题 |
| 完全离线 | 数据存储于设备 AsyncStorage，无需网络和账号 |

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React Native + Expo SDK 55 |
| 路由 | Expo Router（文件系统路由） |
| 状态管理 | Zustand |
| 本地存储 | @react-native-async-storage/async-storage |
| 图表 | react-native-gifted-charts |
| 图标 | @expo/vector-icons (MaterialCommunityIcons) |
| 日期处理 | dayjs（中文本地化） |
| 日期选择器 | @react-native-community/datetimepicker |

---

## 项目结构

```
billapp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # 账单列表页
│   │   ├── stats.tsx        # 图表统计页
│   │   ├── settings.tsx     # 设置页
│   │   └── _layout.tsx      # Tab 布局
│   ├── _layout.tsx          # 根布局（初始化数据）
│   ├── add-record.tsx       # 添加记录页（模态）
│   ├── edit-record.tsx      # 编辑记录页（模态）
│   └── categories.tsx       # 分类管理页
├── components/
│   ├── CategoryIcon.tsx     # 彩色圆形图标组件
│   ├── RecordItem.tsx       # 账单条目（含编辑/删除）
│   ├── RecordForm.tsx       # 记账表单（添加/编辑复用）
│   └── EmptyState.tsx       # 空状态占位组件
├── store/
│   └── useStore.ts          # Zustand 全局状态 + CRUD
├── utils/
│   ├── storage.ts           # AsyncStorage 读写封装
│   └── dateUtils.ts         # 账单周期计算、日期格式化
└── constants/
    ├── categories.ts        # 8 个预设分类定义
    └── theme.ts             # 颜色、间距、圆角、阴影常量
```

---

## 快速开始

### 环境要求

- Node.js 18+
- Expo Go 手机 App（[Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)）

### 运行

```bash
cd billapp
npm install
npx expo start
```

启动后用手机 **Expo Go** 扫描二维码即可预览。

### 构建 Android APK

```bash
# 本地构建（需要 Android SDK）
npx expo run:android

# 云端构建（推荐，无需本地环境）
npx eas build --platform android --profile preview
```

---

## 数据结构

数据以 JSON 格式存储在 AsyncStorage，Key 前缀为 `@bill_`：

```json
{
  "records": [
    {
      "id": "uuid-v4",
      "amount": 38.50,
      "categoryId": "food",
      "date": "2026-05-18",
      "note": "午饭"
    }
  ],
  "categories": [
    {
      "id": "food",
      "name": "餐饮",
      "icon": "food-fork-drink",
      "color": "#FF7043",
      "isPreset": true
    }
  ],
  "settings": {
    "billingStartDay": 1,
    "currency": "¥"
  }
}
```

---

## UI 设计

- **主色调**：靛蓝 `#5C6BC0` + 暖橙 Accent `#FF7043`
- **深色模式**：自动适配系统主题（`useColorScheme`）
- **圆角卡片**：柔和阴影，层次清晰
- **彩色分类图标**：圆形背景 + MaterialCommunityIcons

---

## 预设消费分类

| 名称 | 图标 | 颜色 |
|------|------|------|
| 餐饮 | food-fork-drink | #FF7043 |
| 交通 | bus | #42A5F5 |
| 购物 | shopping | #AB47BC |
| 居家 | home | #26A69A |
| 娱乐 | gamepad-variant | #EC407A |
| 医疗 | hospital-box | #EF5350 |
| 教育 | school | #5C6BC0 |
| 其他 | dots-horizontal-circle | #78909C |
