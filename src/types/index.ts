// ============================================
// 核心类型定义 - 企业级出差行程管理系统
// ============================================

// 出行方式
export type TransportCategory = 0 | 1 | 2  // 0高铁 1飞机 2汽车

// 地点类型
export type PlaceType = 'hotel' | 'travel'

// 行程状态（仅有3个）
export type TripStatus = 'ongoing' | 'upcoming' | 'finished'

// 出差类型（仅有国内）
export type TripType = 'domestic'

// 视图模式
export type ViewMode = 'day' | 'week' | 'month'

// 当天行程/酒店明细项（用于当前所在地单元格 + 抽屉时间线）
export interface DayLocationItem {
  placeType: PlaceType       // 'hotel' | 'travel'
  placeName: string            // 城市名
  date: string                 // YYYY-MM-DD 归属日期
  // travel 专有
  category?: TransportCategory // 0高铁 1飞机 2汽车
  startPlace?: string          // 出发地
  endPlace?: string            // 目的地
  transportNo?: string         // 车次/航班号
  // hotel 专有
  hotelName?: string           // 酒店名称
  roomType?: string            // 房型
  status: 'ongoing' | 'upcoming' | 'finished'
}

// 行程项
export interface TripItem {
  id: string
  empId: string
  empName: string
  avatar?: string
  deptName: string
  position: string
  startTime: string // YYYY-MM-DD
  endTime: string   // YYYY-MM-DD
  city: string
  tripType: TripType
  status: TripStatus
  // 每天的明细（从接口获取）
  dayItems?: DayLocationItem[]
}


// 时间轴行（每个员工一行）
export interface TimelineRow {
  empId: string
  empName: string
  avatar?: string
  deptName: string
  position: string
  trips: TripItem[]
  currentStatus: 'on_trip' | 'idle'
}

// 员工当日所在地（用于单元格展示）
export interface EmployeeDailyLocation {
  empId: string
  date: string
  items: DayLocationItem[]
}

// 筛选参数
export interface FilterParams {
  deptName?: string
  empName?: string
  city?: string
  tripType?: 'all' | TripType
  dateRange?: [string, string] | null
  status?: 'all' | TripStatus
}

// 统计数据
export interface Statistics {
  todayTripCount: number
  weekTripCount: number
  returningCount: number
  overseasCount: number
  conflictCount: number
}

// 部门
export interface Department {
  id: string
  name: string
}

// 状态颜色映射
export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  ongoing: '#67C23A',   // 进行中-绿
  upcoming: '#E6A23C',  // 即将开始-橙
  finished: '#909399',  // 已结束-灰
} as const

// 出行方式颜色
export const TRANSPORT_COLORS: Record<TransportCategory, string> = {
  0: '#409EFF',  // 高铁-蓝色
  1: '#9C27B0',  // 飞机-紫色
  2: '#FF9800',  // 汽车-橙色
} as const

// 出行方式图标
export const TRANSPORT_ICONS: Record<TransportCategory, string> = {
  0: '🚄',
  1: '✈',
  2: '🚗',
} as const

// 出行方式标签
export const TRANSPORT_LABELS: Record<TransportCategory, string> = {
  0: '高铁',
  1: '飞机',
  2: '汽车',
} as const

// 类型颜色映射
export const TRIP_TYPE_COLORS: Record<TripType, string> = {
  domestic: 'rgb(130, 189, 164)',  // 国内-主题色
} as const

// 状态标签
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  ongoing: '进行中',
  upcoming: '即将开始',
  finished: '已结束',
} as const