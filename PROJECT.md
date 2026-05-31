# 企业出差行程管理系统 - 项目文档

## 📋 基本信息

| 项目 | 内容 |
|------|------|
| **项目名称** | trip-timeline |
| **项目路径** | `/Users/cclovr/codeProject/trip-timeline-demo` |
| **在线地址** | https://timeline.cclovr.top |
| **技术栈** | Vue 3 + Vite + TypeScript + Element Plus + Pinia + dayjs |
| **创建日期** | 2026-04-02 |

---

## 🎯 项目概述

企业出差行程管理系统，用于可视化展示员工的出差行程时间线。

### 核心功能
- **Timeline 视图**：展示每个员工在特定日期的出差状态
- **日/周/月视图切换**：按不同维度查看行程
- **左右布局**：左侧人员列固定（220px），右侧日期列可滚动
- **滚动同步**：表头和内容区同步滚动

### 核心组件

| 组件 | 职责 |
|------|------|
| `TimelineView.vue` | 主视图容器，左右分栏布局 |
| `TimelineHeader.vue` | 表头，左侧"员工"标签 + 右侧日期行 |
| `TimelineRow.vue` | 单个员工的时间轨道（不含人员信息） |

---

## 📁 项目结构

```
trip-timeline-demo/
├── src/
│   ├── components/
│   │   ├── timeline/      # Timeline 核心组件
│   │   ├── trip/          # 添加行程页面（AddTripView）
│   │   ├── filters/       # 筛选器
│   │   ├── statistics/    # 统计卡片
│   │   └── layout/        # 布局组件
│   ├── stores/            # Pinia 状态管理
│   ├── views/             # 页面视图
│   ├── api/              # API 请求
│   └── types/             # TypeScript 类型
├── .gitignore            # 已配置（排除 dist/、node_modules/）
├── Dockerfile             # Docker 部署配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 部署信息

- **Docker 镜像**：`trip-timeline-demo:latest`
- **部署方式**：Docker 容器化部署
- **网络**：ctnet 网络别名待确认

---

## 📝 开发日志

### 2026-05-26 - UI 重构

**需求**：
1. 时间栏位（日期列）限制在内容区域，人员列（220px）固定不动
2. 日/周/月视图切换时，日期位置要对齐
3. 日期栏位可滚动

**已完成修改**：

1. **TimelineView.vue** - 重构为左右布局：
   - 左侧人员列（220px，固定）
   - 右侧日期列（可滚动）
   - 表头同步滚动：header 和 body 互相监听滚动事件

2. **TimelineRow.vue** - 简化为只包含时间轨道，不含人员信息：
   - 人员信息在 TimelineView 中单独渲染

3. **TimelineHeader.vue** - 简化：
   - 左侧显示"员工"标签
   - 右侧显示日期星期行

### 2026-05-27 - 筛选器增强 & 工具栏调整

**需求**：
1. 筛选项中加入时间范围搜索项，时间范围不能超过1年
2. 表头上显示的时间范围和左右点击的按钮去掉
3. `<今天>` 按钮放在日/月/周的左边一点

**已完成修改**：

1. **FilterPanel.vue** - 新增时间范围筛选：
   - 添加 `el-date-picker`（daterange 类型）
   - 支持快捷选项：最近7天、30天、3个月、半年
   - 自动校验：超过365天自动截断到1年
   - `dateRange` 传入 store 的 `filterParams`

2. **TimelineView.vue** - 工具栏调整：
   - 移除左右箭头按钮
   - 移除中间的时间范围文字显示
   - `<今天>` 按钮移到日月周按钮左边
   - 日期范围现在优先读取筛选器时间范围，其次用mock数据范围
   - 周/月视图自动对齐到周/月边界

**当前状态**：✅ 已构建并部署到 https://timeline.cclovr.top

**待办**：
- [x] 时间范围筛选
- [x] 周/月视图日期对齐
- [x] "今天"按钮定位

### 2026-05-31 - 添加行程页面按钮合并

**需求**：把「添加酒店信息」和「添加行程信息」两个按钮合并为一个，点击后弹窗先选择类型再切换到对应表单

**已完成修改**：

1. **AddTripView.vue** - 合并按钮：
   - 两个按钮合并为一个大按钮，文字「添加行程信息」
   - 弹窗 `dialogStep` 三步流程：`choice` → `hotel` | `trip`
   - choice 步骤显示两个大卡片（🏨 添加酒店 / ✈️ 添加行程）
   - 选择后切换到对应表单，底部有「上一步」可返回重新选择
   - 时间线编辑按钮仍可直接打开对应类型弹窗

2. **Git 操作教训**：
   - 项目初始化时必须创建 `.gitignore`
   - 不要使用 `git add .`，改用 `git add src/` 或具体文件
   - 构建产物由 CI/CD 负责，不进仓库（使用 `git filter-branch` 从历史中移除）
   - 使用 SSH Key push（ClashX HTTP 代理会导致卡死）

3. **Docker 部署修复**：
   - `timeline` 容器需连接到 `trip-network` 才能被 Cloudflare Tunnel 访问
   - 命令：`docker network connect trip-network timeline`

**当前状态**：✅ 已部署到 https://timeline.cclovr.top

---

## 📌 关联文档

| 文档 | 路径 |
|------|------|
| 项目记录 | `memory/PJ-企业出差行程管理系统.md` |
| 每日记录 | `memory/2026-05-31.md` |
| MEMORY | `MEMORY.md` |

---

*最后更新：2026-05-31*