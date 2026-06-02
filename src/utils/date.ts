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

// ============================================
// 周始日相关工具（支持周日/周一自由切换）
// ============================================

/** 周始日类型：0=周日, 1=周一 */
export type WeekStartDay = 0 | 1

/**
 * 将日期向前递补到周始日（包含自身若是周始日）
 * @param date YYYY-MM-DD 或 Date 或 Dayjs
 * @param weekStartDay 0=周日 1=周一
 */
export function getWeekStart(
  date: string | Date | dayjs.Dayjs,
  weekStartDay: WeekStartDay = 0
): dayjs.Dayjs {
  const d = dayjs(date)
  const dow = d.day() // 0=Sun..6=Sat
  const diff = (dow - weekStartDay + 7) % 7
  return d.subtract(diff, 'day')
}

/**
 * 将日期向后递补到一周最后一天（包含自身若是周末）
 */
export function getWeekEnd(
  date: string | Date | dayjs.Dayjs,
  weekStartDay: WeekStartDay = 0
): dayjs.Dayjs {
  return getWeekStart(date, weekStartDay).add(6, 'day')
}

/**
 * 计算从 start 到 end 之间（按周对齐）共有多少个周始日
 * 即把两端都对齐到周后，总天数 / 7
 */
export function getAlignedWeekCount(
  start: string | Date | dayjs.Dayjs,
  end: string | Date | dayjs.Dayjs,
  weekStartDay: WeekStartDay = 0
): number {
  const alignedStart = getWeekStart(start, weekStartDay)
  const alignedEnd = getWeekEnd(end, weekStartDay)
  return Math.floor(alignedEnd.diff(alignedStart, 'day') / 7) + 1
}

/**
 * 生成 [start, end] 区间内所有周一的日期列表（仅周始日）
 */
export function listWeekStartDays(
  start: string | Date | dayjs.Dayjs,
  end: string | Date | dayjs.Dayjs,
  weekStartDay: WeekStartDay = 0
): string[] {
  const alignedStart = getWeekStart(start, weekStartDay)
  const alignedEnd = getWeekEnd(end, weekStartDay)
  const result: string[] = []
  let cur = alignedStart.clone()
  while (cur.isBefore(alignedEnd) || cur.isSame(alignedEnd, 'day')) {
    result.push(cur.format('YYYY-MM-DD'))
    cur = cur.add(7, 'day')
  }
  return result
}