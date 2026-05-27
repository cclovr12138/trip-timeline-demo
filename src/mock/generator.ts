import type { TripItem, TimelineRow } from '@/types'
import { employees, trips } from '@/mock/data'

/**
 * 生成时间轴行数据
 * 将员工和行程数据合并
 */
export function generateTimelineRows(): TimelineRow[] {
  const now = new Date()
  
  return employees.map((emp) => {
    // 找到该员工的所有行程
    const empTrips = trips
      .filter((t) => t.empId === emp.empId)
      .map((t): TripItem => ({
        id: t.id,
        empId: t.empId,
        empName: emp.empName,
        avatar: emp.avatar,
        deptName: emp.deptName,
        position: emp.position,
        startTime: t.startTime,
        endTime: t.endTime,
        city: t.city,
        tripType: t.tripType,
        status: t.status,
      }))
    
    // 计算当前状态
    let currentStatus: TimelineRow['currentStatus'] = 'idle'
    for (const trip of empTrips) {
      const start = new Date(trip.startTime)
      const end = new Date(trip.endTime)
      if (now >= start && now <= end) {
        currentStatus = 'on_trip'
        break
      }
    }
    
    return {
      empId: emp.empId,
      empName: emp.empName,
      avatar: emp.avatar,
      deptName: emp.deptName,
      position: emp.position,
      trips: empTrips,
      currentStatus,
    }
  })
}