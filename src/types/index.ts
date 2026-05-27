// ============================================
// 核心类型定义 - 企业级出差行程管理系统
// ============================================

// 行程状态（仅有3个）
export type TripStatus = 'ongoing' | 'upcoming' | 'finished'

// 出差类型（仅有国内）
export type TripType = 'domestic'

// 视图模式
export type ViewMode = 'day' | 'week' | 'month'

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