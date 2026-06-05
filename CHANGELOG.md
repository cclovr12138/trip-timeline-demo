# 更新日志 (CHANGELOG)

所有重要变更按时间倒序记录。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

---

## [Unreleased]

### Fixed
- **SPA 子路由刷新 404 修复**：`Dockerfile` 补上 `COPY nginx.conf /etc/nginx/nginx.conf`，加上 `try_files $uri $uri/ /index.html;` 兜底；之前 Dockerfile 只 COPY 了 `dist/`，容器跑的是 nginx:alpine 默认配置，访问 `/add-trip`、`/trip/edit/xxx` 等 SPA 子路由时刷新会 404

### Changed
- **酒店卡片入住/离开日期显示格式**：在 `AddTripView.vue` 中新增 `formatDateLong`，把酒店卡片时间区间从 `M/D`（如 `6/5 入住 · 6/6 离开`）改为 `YYYY-MM-DD`（如 `2026-06-05 入住 · 2026-06-06 离开`），与出差日期保持一致；中间日期气泡仍保留紧凑 `M/D` 格式
- **行程卡片时间区间显示格式**：在 `AddTripView.vue` 的行程卡标题行（`trip-title`）中新增 `.trip-date` 元素，把出发日期 `YYYY-MM-DD` 作为独立小标签插在 `trip-icon` 和 `trip-time` 之间（如 `✈ 2026-06-05 09:44 → 10:44`），不再和时分挤在一起；对应的 `formatTripTime` 函数已删除

### Fixed
- **横向滚动同步逻辑加固**：
  - 删除 `isSyncingVertical` 同步重置的死循环隐患，改用双 rAF 异步重置（与 `isSyncingHorizontal` 一致）
  - 简化 `onTimelineContentScroll` 的横向同步路径，去除重复的 rAF 重置链（`syncHorizontalTo` 内部已统一管理）
  - 删除 `.timeline-header::-webkit-scrollbar` 重复规则，避免样式冗余
- **表头滚动架构验证**：`headerScrollRef` 放在 `.timeline-header`（`flex:1; min-width:0; overflow-x:auto`）上，内部 `.header-row { width: totalWidth }` 撑开滚动条；`scrollLeft` 可被 JS 同步设置，实现与 `.timeline-content` 的双向滚动联动

### Changed
- **Timeline 布局重组**：将 toolbar + employee-header + timeline-header 提取到独立的 `.timeline-sticky-header`（`position: sticky; top: 0`），三个元素作为整体一起吸顶；下方 `.timeline-main` 为内容滚动区，左右列（员工列表 + 时间轴）独立垂直滚动；去掉旧的 `overflow: hidden` 嵌套结构

### Added
- **员工数据扩展**：从 10 人扩展到 50 人（E001-E050），覆盖技术/市场/销售/产品/财务/人力资源各部门
- **Mock 行程数据扩展**：从 12 条扩展到 60 条，覆盖国内外多个城市和日期范围

### Changed
- **Mock 数据去重叠**：同一员工的行程时间严格错开，避免 endTime 与下一条 startTime 重叠
- **全员覆盖**：50名员工（E001-E050）每人至少1条行程，总数扩展到96条
- **行程状态动态计算**：根据当前日期实时判断（结束时间<今天→已结束灰色、结束时间>今天且开始时间<今天→进行中绿色、开始时间>今天→即将出发橙色），移除 mock 静态 status
- 今天列背景加深至 `rgba(255, 100, 100, 0.18)`

---

## [1.1.0] - 2026-06-03

### Fixed
- **表头竖线对齐**：Layer 1（周/月标题行）和 Layer 2（天日期行）的 `border-right` 颜色不统一问题，两层统一使用 `#DCDFE6`
- **周始日标记**：移除 `is-week-start` 的 `border-left` 标记，保持格宽一致

---

## [1.0.0] - 2026-05-31

### Added
- **添加行程页面按钮合并**：将「添加酒店信息」和「添加行程信息」两个按钮合并为一个，点击后弹窗先选择类型（酒店/行程）再切换到对应表单，三步流程 `choice → hotel/trip`
- **Docker 部署修复**：`timeline` 容器连接到 `trip-network` 网络别名，确保能被 Cloudflare Tunnel 访问

### Changed
- 时间线明细编辑按钮交互优化（hover 效果、点击后显示取消按钮）

### Fixed
- `saveTrip` 重复代码导致构建报错
- 行程数据保存后按日期+时间排序
- 弹窗保存按钮同时关闭弹窗逻辑
- `editingIndex` 和 dialog 关闭顺序确保同步更新
- 行程明细编辑按钮点击后显示取消按钮
- 时间区间从独立选择器改为单个 `el-date-picker` 框（宽度 100%）

---

## [0.9.0] - 2026-05-27

### Added
- **时间范围筛选**：`FilterPanel.vue` 新增 `el-date-picker`（daterange 类型），支持快捷选项（最近7天/30天/3个月/半年），自动校验超365天截断
- **周始日切换开关**：表头支持切换周首日为周日/周一

### Changed
- **TimelineView.vue 工具栏调整**：移除左右箭头按钮和中间时间范围文字显示；「今天」按钮移到日/月/周按钮左边
- 日期范围优先读取筛选器时间范围，其次用 mock 数据范围
- 周/月视图自动对齐到周/月边界

### Fixed
- 周/月视图员工列表头高度跟随 `headerTotalHeight` 动态变化

---

## [0.8.0] - 2026-05-26

### Added
- **左右布局重构**：`TimelineView.vue` 重构为左右分栏布局
  - 左侧人员列（220px，固定）
  - 右侧日期列（可滚动）
  - 表头和内容区滚动同步

### Changed
- **TimelineRow.vue** 简化为只包含时间轨道，不含人员信息
- **TimelineHeader.vue** 简化：左侧显示"员工"标签，右侧显示日期星期行

### Fixed
- 员工行高通过 `:style` 动态绑定 `rowHeight`
- 日/周/月视图切换时日期位置对齐

---

## [0.7.0] - 2026-05-xx

### Added
- **行程详情抽屉**：点击员工行展开抽屉，显示出差基本信息 + 酒店/行程明细时间线
- **编辑功能**：出差基本信息支持查看/编辑模式切换
- **侧边栏路由**：仪表盘页面 + 添加行程页面
- **行程+酒店完整详情**（mock 数据 + 抽屉时间线展示）

### Changed
- 页面整体布局（左侧表单+按钮，右侧 Timeline 明细）
- 配色同步（主色 `rgb(130,189,164)`，激活色 `rgb(103,194,58)`）
- 行程页面重新设计（出差信息 + 酒店/行程弹窗）

---

## [0.1.0] - 2026-04-02

### Added
- 项目初始化（Vue 3 + Vite + TypeScript + Element Plus + Pinia + dayjs）
- Timeline 视图基础结构（日期列可滚动）
- 日/周/月视图切换
- 模拟数据展示