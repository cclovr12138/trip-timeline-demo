import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimelineRow, FilterParams, Statistics, ViewMode } from '@/types'
import { departments } from '@/mock/data'
import { generateTimelineRows } from '@/mock/generator'

/**
 * 行程管理 Store
 */
export const useTripStore = defineStore('trip', () => {
  // ==================== State ====================
  
  /** 所有时间轴数据 */
  const allTimelineData = ref<TimelineRow[]>(generateTimelineRows())
  
  /** 当前视图模式 */
  const viewMode = ref<ViewMode>('day')
  
  /** 当前日期（用于确定显示范围） */
  const currentDate = ref<string>(new Date().toISOString().split('T')[0])
  
  /** 筛选参数 */
  const filterParams = ref<FilterParams>({
    deptName: undefined,
    empName: undefined,
    city: undefined,
    tripType: 'all',
    dateRange: null,
    status: 'all',
  })
  
  /** 可用部门列表 */
  const departmentList = ref(departments)

  // ==================== Getters ====================
  
  /** 筛选后的数据 */
  const filteredData = computed(() => {
    let data = allTimelineData.value
    
    // 按部门筛选
    if (filterParams.value.deptName) {
      data = data.filter((row) => row.deptName === filterParams.value.deptName)
    }
    
    // 按员工姓名筛选
    if (filterParams.value.empName) {
      const keyword = filterParams.value.empName.toLowerCase()
      data = data.filter((row) => row.empName.toLowerCase().includes(keyword))
    }
    
    // 按城市筛选
    if (filterParams.value.city) {
      const keyword = filterParams.value.city.toLowerCase()
      data = data.filter((row) =>
        row.trips.some((trip) => trip.city.toLowerCase().includes(keyword))
      )
    }
    
    // 按出差类型筛选
    if (filterParams.value.tripType && filterParams.value.tripType !== 'all') {
      data = data.filter((row) =>
        row.trips.some((trip) => trip.tripType === filterParams.value.tripType)
      )
    }
    
    // 按状态筛选
    if (filterParams.value.status && filterParams.value.status !== 'all') {
      data = data.filter((row) =>
        row.trips.some((trip) => trip.status === filterParams.value.status)
      )
    }
    
    return data
  })
  
  /** 统计数据 */
  const statistics = computed<Statistics>(() => {
    const now = new Date()
    const today = new Date().toISOString().split('T')[0]
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    let todayTripCount = 0
    let weekTripCount = 0
    let returningCount = 0
    let overseasCount = 0
    let conflictCount = 0
    
    for (const row of allTimelineData.value) {
      for (const trip of row.trips) {
        // 今日出差（当前正在出差）
        if (trip.startTime <= today && trip.endTime >= today && trip.status !== 'finished') {
          todayTripCount++
        }
        
        // 本周出差（开始或结束在本周内）
        if (
          (trip.startTime >= today && trip.startTime <= weekEnd) ||
          (trip.endTime >= today && trip.endTime <= weekEnd) ||
          (trip.startTime <= today && trip.endTime >= today)
        ) {
          weekTripCount++
        }
        
        // 即将返程（3天内结束）
        const endDate = new Date(trip.endTime)
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilEnd >= 0 && daysUntilEnd <= 3 && trip.status === 'ongoing') {
          returningCount++
        }
        
        // 海外出差
        if (trip.tripType === 'overseas' && trip.status !== 'finished') {
          overseasCount++
        }
        
        // 冲突
        if (trip.status === 'conflict') {
          conflictCount++
        }
      }
    }
    
    return {
      todayTripCount,
      weekTripCount,
      returningCount,
      overseasCount,
      conflictCount,
    }
  })

  // ==================== Actions ====================
  
  /** 设置视图模式 */
  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }
  
  /** 设置当前日期 */
  function setCurrentDate(date: string) {
    currentDate.value = date
  }
  
  /** 更新筛选参数 */
  function updateFilter(params: Partial<FilterParams>) {
    filterParams.value = { ...filterParams.value, ...params }
  }
  
  /** 重置筛选参数 */
  function resetFilter() {
    filterParams.value = {
      deptName: undefined,
      empName: undefined,
      city: undefined,
      tripType: 'all',
      dateRange: null,
      status: 'all',
    }
  }
  
  /** 刷新数据（模拟重新请求） */
  function refreshData() {
    allTimelineData.value = generateTimelineRows()
  }

  return {
    // State
    allTimelineData,
    viewMode,
    currentDate,
    filterParams,
    departmentList,
    // Getters
    filteredData,
    statistics,
    // Actions
    setViewMode,
    setCurrentDate,
    updateFilter,
    resetFilter,
    refreshData,
  }
})