import dayjs from 'dayjs'

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 计算两个日期之间的天数差
 */
export function getDaysDiff(start: string | Date, end: string | Date): number {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'day') + 1 // 包含起始日
}

/**
 * 判断日期是否在范围内
 */
export function isDateInRange(date: string | Date, start: string | Date, end: string | Date): boolean {
  const d = dayjs(date)
  return d.isAfter(dayjs(start).subtract(1, 'day')) && d.isBefore(dayjs(end).add(1, 'day'))
}

/**
 * 获取日期的偏移天数（相对于范围起点）
 */
export function getDateOffset(date: string | Date, rangeStart: string | Date): number {
  const d = dayjs(date)
  const start = dayjs(rangeStart)
  return d.diff(start, 'day')
}

/**
 * 生成日期数组
 */
export function generateDateArray(startDate: string | Date, days: number): string[] {
  const result: string[] = []
  const start = dayjs(startDate)
  for (let i = 0; i < days; i++) {
    result.push(start.add(i, 'day').format('YYYY-MM-DD'))
  }
  return result
}

/**
 * 判断是否是今天
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否是周末
 */
export function isWeekend(date: string | Date): boolean {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

/**
 * 获取星期几 (0-6)
 */
export function getDayOfWeek(date: string | Date): number {
  return dayjs(date).day()
}

/**
 * 获取中文星期
 */
export function getChineseWeekday(date: string | Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(date).day()]
}

/**
 * 获取相对日期
 */
export function getRelativeDate(daysOffset: number): string {
  return dayjs().add(daysOffset, 'day').format('YYYY-MM-DD')
}

/**
 * 计算行程块的宽度和位置
 */
export function calculateTripBlock(
  startTime: string,
  endTime: string,
  rangeStart: string,
  dayWidth: number
): { left: number; width: number } {
  const startOffset = Math.max(0, getDateOffset(startTime, rangeStart))
  const endOffset = getDateOffset(endTime, rangeStart)
  const duration = endOffset - startOffset + 1
  
  return {
    left: startOffset * dayWidth,
    width: duration * dayWidth,
  }
}