import type { Department } from '@/types'

// ============================================
// Mock 部门数据
// ============================================
export const departments: Department[] = [
  { id: 'D001', name: '技术部' },
  { id: 'D002', name: '市场部' },
  { id: 'D003', name: '销售部' },
  { id: 'D004', name: '产品部' },
  { id: 'D005', name: '财务部' },
  { id: 'D006', name: '人力资源部' },
]

// ============================================
// Mock 员工数据
// ============================================
export interface MockEmployee {
  empId: string
  empName: string
  deptName: string
  position: string
  avatar?: string
}

export const employees: MockEmployee[] = [
  { empId: 'E001', empName: '张明远', deptName: '技术部', position: '前端工程师' },
  { empId: 'E002', empName: '李思琪', deptName: '市场部', position: '市场经理' },
  { empId: 'E003', empName: '王建国', deptName: '销售部', position: '销售总监' },
  { empId: 'E004', empName: '陈雨萱', deptName: '产品部', position: '产品经理' },
  { empId: 'E005', empName: '刘浩然', deptName: '技术部', position: '后端工程师' },
  { empId: 'E006', empName: '赵晓敏', deptName: '财务部', position: '财务主管' },
  { empId: 'E007', empName: '孙伟', deptName: '技术部', position: '架构师' },
  { empId: 'E008', empName: '周雅婷', deptName: '人力资源部', position: 'HR总监' },
  { empId: 'E009', empName: '吴志强', deptName: '销售部', position: '销售经理' },
  { empId: 'E010', empName: '郑雅琴', deptName: '市场部', position: '市场专员' },
]

// ============================================
// Mock 行程数据（基于当前日期生成）
// ============================================
export interface MockTrip {
  id: string
  empId: string
  city: string
  tripType: 'domestic' | 'overseas'
  startTime: string
  endTime: string
  status: 'ongoing' | 'upcoming' | 'finished' | 'conflict'
}

// 生成相对日期
function getRelativeDate(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

export const trips: MockTrip[] = [
  { id: 'T001', empId: 'E001', city: '北京', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(1), status: 'ongoing' },
  { id: 'T002', empId: 'E002', city: '东京', tripType: 'overseas', startTime: getRelativeDate(-5), endTime: getRelativeDate(5), status: 'ongoing' },
  { id: 'T003', empId: 'E003', city: '上海', tripType: 'domestic', startTime: getRelativeDate(-1), endTime: getRelativeDate(1), status: 'ongoing' },
  { id: 'T004', empId: 'E004', city: '深圳', tripType: 'domestic', startTime: getRelativeDate(1), endTime: getRelativeDate(4), status: 'upcoming' },
  { id: 'T005', empId: 'E005', city: '新加坡', tripType: 'overseas', startTime: getRelativeDate(-6), endTime: getRelativeDate(2), status: 'ongoing' },
  { id: 'T006', empId: 'E006', city: '广州', tripType: 'domestic', startTime: getRelativeDate(-11), endTime: getRelativeDate(-8), status: 'finished' },
  { id: 'T007', empId: 'E007', city: '旧金山', tripType: 'overseas', startTime: getRelativeDate(-4), endTime: getRelativeDate(6), status: 'ongoing' },
  { id: 'T008', empId: 'E008', city: '成都', tripType: 'domestic', startTime: getRelativeDate(-1), endTime: getRelativeDate(2), status: 'ongoing' },
  { id: 'T009', empId: 'E009', city: '香港', tripType: 'overseas', startTime: getRelativeDate(3), endTime: getRelativeDate(8), status: 'upcoming' },
  { id: 'T010', empId: 'E010', city: '杭州', tripType: 'domestic', startTime: getRelativeDate(-2), endTime: getRelativeDate(-1), status: 'ongoing' },
  { id: 'T011', empId: 'E001', city: '上海', tripType: 'domestic', startTime: getRelativeDate(10), endTime: getRelativeDate(13), status: 'upcoming' },
  { id: 'T012', empId: 'E003', city: '武汉', tripType: 'domestic', startTime: getRelativeDate(2), endTime: getRelativeDate(4), status: 'conflict' },
]