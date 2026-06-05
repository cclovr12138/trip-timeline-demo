# 行程安排明细 - 后端 API 规范

> 配合前端 `trip-timeline-demo` 使用
> 适用场景：时间轴主视图、员工每日所在地、添加/编辑行程、统计面板
> 最后更新：2026-06-05

---

## 数据模型总览

```
TimelineRow（时间轴一行 = 一个员工）
  ├─ empId, empName, deptName, position, avatar（员工基础信息）
  ├─ currentStatus: 'on_trip' | 'idle'（当前是否在出差）
  └─ trips: TripItem[]（该员工的所有行程）
        └─ dayItems?: DayLocationItem[]（行程内每一天的酒店/交通明细，懒加载）
```

详见 `src/types/index.ts`。

---

## 通用规范

### Base URL
```
https://api.cclovr.top      # 生产（通过 Cloudflare Tunnel 反代到后端）
http://localhost:8080       # 本地开发
```

### 通用请求头
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### 通用响应格式（成功）
```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

### 通用响应格式（失败）
```json
{
  "code": 1001,
  "message": "员工不存在",
  "data": null
}
```

| code | 含义 |
|---|---|
| 0 | 成功 |
| 1xxx | 客户端错误（参数错、未授权、资源不存在） |
| 5xxx | 服务端错误 |
| 401 | 未登录（需跳转登录） |

### 通用枚举值

```ts
// 出行方式
TransportCategory: 0 | 1 | 2   // 0高铁 1飞机 2汽车

// 地点类型
PlaceType: 'hotel' | 'travel'

// 行程状态
TripStatus: 'ongoing' | 'upcoming' | 'finished'

// 出差类型
TripType: 'domestic' | 'overseas'

// 委托状态
EntrustStatus: 'none' | 'in_progress' | 'completed'
```

---

## API 列表

### 1. 时间轴主视图

**接口**：`GET /api/trips/timeline`

**用途**：时间轴页面首屏加载，获取所有员工 + 其行程。

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `viewMode` | `'day' \| 'week' \| 'month'` | 否 | 视图模式（用于后端决定返回多少数据） |
| `dateRange` | `[YYYY-MM-DD, YYYY-MM-DD]` | 否 | 日期范围（如 `["2026-06-01","2026-06-30"]`），用于过滤行程 |
| `deptName` | `string` | 否 | 按部门筛选 |
| `empName` | `string` | 否 | 按员工姓名模糊搜索 |
| `city` | `string` | 否 | 按出差城市模糊搜索 |
| `tripType` | `'all' \| 'domestic' \| 'overseas'` | 否 | 按出差类型 |
| `status` | `'all' \| 'ongoing' \| 'upcoming' \| 'finished'` | 否 | 按行程状态 |

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "empId": "E001",
      "empName": "张明远",
      "deptName": "技术部",
      "position": "前端工程师",
      "avatar": "https://cdn.example.com/avatars/E001.jpg",
      "currentStatus": "on_trip",
      "trips": [
        {
          "id": "T001",
          "empId": "E001",
          "empName": "张明远",
          "deptName": "技术部",
          "position": "前端工程师",
          "startTime": "2026-06-03",
          "endTime": "2026-06-06",
          "city": "北京",
          "tripType": "domestic",
          "status": "ongoing",
          "assistants": [
            { "name": "李明", "email": "liming@example.com", "phone": "138-1234-5678" }
          ]
        }
      ]
    }
  ]
}
```

> 📌 **性能优化建议**：
> - `dayItems` 不要在主视图里返回，按需通过接口 3 拉取
> - `avatar` 可以返回完整 URL 或相对路径
> - 如果数据量大，建议分页（`page`、`pageSize`）或按部门分批加载

---

### 2. 员工某天的行程明细

**接口**：`GET /api/employees/{empId}/daily-location`

**用途**：时间轴单元格点击、获取员工当天所在的城市/酒店/交通工具。

**路径参数**：

| 参数 | 类型 | 说明 |
|---|---|---|
| `empId` | `string` | 员工ID |

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `date` | `YYYY-MM-DD` | 是 | 查询日期 |

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "empId": "E001",
    "date": "2026-06-05",
    "items": [
      {
        "placeType": "travel",
        "placeName": "武汉",
        "date": "2026-06-05",
        "category": 1,
        "startPlace": "上海",
        "endPlace": "武汉",
        "transportNo": "CZ777",
        "startTime": "09:44",
        "endTime": "10:44",
        "status": "ongoing",
        "remark": "坐飞机",
        "managerRemark": "OK，已安排",
        "managers": ["E006"],
        "attachments": [
          { "name": "机票.pdf", "icon": "📕", "size": "234KB" }
        ],
        "entrustStatus": "none"
      },
      {
        "placeType": "hotel",
        "placeName": "武汉",
        "date": "2026-06-05",
        "endDate": "2026-06-07",
        "hotelName": "武汉香格里拉",
        "roomType": "大床房",
        "startTime": "14:00",
        "endTime": "12:00",
        "status": "ongoing",
        "remark": "",
        "managerRemark": "",
        "managers": [],
        "attachments": [],
        "entrustStatus": "none"
      }
    ]
  }
}
```

---

### 3. 员工某次行程的完整明细

**接口**：`GET /api/trips/{tripId}/detail`

**用途**：抽屉/详情页加载，包含每一天的 hotel + travel 明细（懒加载）。

**路径参数**：

| 参数 | 类型 | 说明 |
|---|---|---|
| `tripId` | `string` | 行程ID |

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "T001",
    "empId": "E001",
    "empName": "张明远",
    "deptName": "技术部",
    "position": "前端工程师",
    "startTime": "2026-06-03",
    "endTime": "2026-06-06",
    "city": "北京",
    "tripType": "domestic",
    "status": "ongoing",
    "dayItems": [
      {
        "placeType": "travel",
        "placeName": "北京",
        "date": "2026-06-03",
        "category": 1,
        "startPlace": "上海",
        "endPlace": "北京",
        "transportNo": "CA1234",
        "startTime": "08:00",
        "endTime": "10:30",
        "status": "finished",
        "remark": "",
        "managers": [],
        "attachments": []
      },
      {
        "placeType": "hotel",
        "placeName": "北京",
        "date": "2026-06-03",
        "endDate": "2026-06-06",
        "hotelName": "北京希尔顿",
        "roomType": "商务大床房",
        "startTime": "14:00",
        "endTime": "12:00",
        "status": "ongoing",
        "remark": "",
        "managers": ["E006"],
        "attachments": []
      },
      {
        "placeType": "travel",
        "placeName": "上海",
        "date": "2026-06-06",
        "category": 1,
        "startPlace": "北京",
        "endPlace": "上海",
        "transportNo": "CA5678",
        "startTime": "18:00",
        "endTime": "20:30",
        "status": "upcoming"
      }
    ]
  }
}
```

---

### 4. 顶部统计数据

**接口**：`GET /api/statistics`

**用途**：Dashboard 顶部统计卡片。

**Query 参数**（可选）：
- `date` `YYYY-MM-DD`（默认今天）

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "todayTripCount": 12,    // 今日在出差人数
    "weekTripCount": 38,     // 本周出差总人次
    "returningCount": 5,     // 即将返程（3天内结束）
    "overseasCount": 8,      // 海外出差人次
    "conflictCount": 0       // 冲突行程数
  }
}
```

---

### 5. 部门列表

**接口**：`GET /api/departments`

**用途**：筛选面板的部门下拉。

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    { "id": "D001", "name": "技术部" },
    { "id": "D002", "name": "市场部" },
    { "id": "D003", "name": "销售部" }
  ]
}
```

---

### 6. 员工列表

**接口**：`GET /api/employees`

**用途**：员工筛选、@提及、选择负责人。

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `deptName` | `string` | 否 | 按部门筛选 |
| `keyword` | `string` | 否 | 按姓名/工号模糊搜索 |
| `limit` | `number` | 否 | 返回数量限制（默认 50） |

**响应**：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "empId": "E001",
      "empName": "张明远",
      "deptName": "技术部",
      "position": "前端工程师",
      "avatar": "https://cdn.example.com/avatars/E001.jpg",
      "email": "zhangmingyuan@example.com"
    }
  ]
}
```

---

## 写入类 API（添加 / 编辑 / 删除行程）

### 7. 创建行程

**接口**：`POST /api/trips`

**请求体**：

```json
{
  "empId": "E001",
  "startTime": "2026-06-10",
  "endTime": "2026-06-15",
  "city": "上海",
  "tripType": "domestic",
  "purpose": "客户拜访",
  "managers": ["E006"],
  "dayItems": [
    {
      "placeType": "travel",
      "date": "2026-06-10",
      "category": 0,
      "startPlace": "北京",
      "endPlace": "上海",
      "transportNo": "G7",
      "startTime": "08:00",
      "endTime": "12:30"
    },
    {
      "placeType": "hotel",
      "date": "2026-06-10",
      "endDate": "2026-06-15",
      "placeName": "上海",
      "hotelName": "上海外滩茂悦大酒店",
      "roomType": "豪华大床房"
    }
  ]
}
```

**响应**：

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "T101"
  }
}
```

---

### 8. 更新行程

**接口**：`PUT /api/trips/{tripId}`

请求体结构同创建（全部字段，部分更新可用 PATCH）。

---

### 9. 删除行程

**接口**：`DELETE /api/trips/{tripId}`

**响应**：

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

---

## 前端对接说明

### 替换 mock 的位置

```ts
// src/stores/trip.ts
// 当前：const allTimelineData = ref<TimelineRow[]>(generateTimelineRows())
// 改为：
const allTimelineData = ref<TimelineRow[]>([])

async function loadTimeline() {
  const res = await fetch('/api/trips/timeline', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const { data } = await res.json()
  allTimelineData.value = data
}
```

### 鉴权

- 登录后保存 JWT 到 `localStorage` 或 Pinia
- 每次请求带 `Authorization: Bearer <token>`
- 401 → 跳转登录页

### 错误处理

- `code !== 0` → `ElMessage.error(message)`
- 网络错误 → `ElMessage.error('网络异常，请稍后重试')`
- 401 → 触发全局登出

### 性能建议

1. **懒加载 dayItems**：主视图不返回，详情时才拉取（接口 3）
2. **按部门分页**：员工多时用分页（`page`、`pageSize`）
3. **前端缓存**：筛选条件变化时，前端 5 分钟内复用上次结果
4. **Gzip/Brotli**：后端开启压缩
5. **CDN**：头像、附件走 CDN URL

---

## 给后端的建议

1. **数据库设计**：
   - 员工表 `employee`、`部门表 department`、`行程表 trip`、`行程明细表 trip_item`、`附件表 attachment`、`助理表 assistant`
2. **分页策略**：时间轴主视图建议 cursor-based 分页（按 `startTime` 排序）
3. **查询优化**：
   - `trip` 表按 `empId` + `startTime` 联合索引
   - `trip_item` 表按 `tripId` 索引
4. **数据权限**：
   - 部门负责人只能看本部门
   - HR/管理员看全部
5. **时区**：所有日期用 ISO `YYYY-MM-DD` 字符串，避免时区问题
6. **附件上传**：单独接口 `POST /api/attachments` 返回 URL，再把 URL 引用到 `attachments` 数组

---

## 速查

| 场景 | API |
|---|---|
| 时间轴首屏 | `GET /api/trips/timeline` |
| 单元格点击（员工+日期） | `GET /api/employees/{empId}/daily-location?date=YYYY-MM-DD` |
| 行程详情/抽屉 | `GET /api/trips/{tripId}/detail` |
| 顶部统计 | `GET /api/statistics` |
| 部门下拉 | `GET /api/departments` |
| 员工下拉 | `GET /api/employees` |
| 创建行程 | `POST /api/trips` |
| 更新行程 | `PUT /api/trips/{tripId}` |
| 删除行程 | `DELETE /api/trips/{tripId}` |
| 附件上传 | `POST /api/attachments` |
