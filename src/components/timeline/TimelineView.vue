<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import type { ViewMode, TripItem } from '@/types'
import { useTripStore } from '@/stores/trip'
import { TRIP_STATUS_LABELS } from '@/types'
import TimelineRow from './TimelineRow.vue'

const store = useTripStore()

// 选中员工相关
const selectedEmpId = ref<string | null>(null)
const drawerVisible = ref(false)
const hoveredEmpId = ref<string | null>(null)

// 当前选中员工的完整数据
const selectedEmployee = computed(() => {
  if (!selectedEmpId.value) return null
  return store.allTimelineData.find(row => row.empId === selectedEmpId.value) ?? null
})

// 计算员工当前所在地（今日行程目的地）
const employeeCurrentLocation = computed(() => {
  const map = new Map<string, string>()
  const today = dayjs().format('YYYY-MM-DD')
  const todayObj = dayjs(today)
  for (const row of store.allTimelineData) {
    const activeTrip = row.trips.find(trip => {
      return !todayObj.isBefore(dayjs(trip.startTime), 'day') && !todayObj.isAfter(dayjs(trip.endTime), 'day')
    })
    map.set(row.empId, activeTrip ? activeTrip.city : '-')
  }
  return map
})

function handleEmployeeClick(empId: string) {
  selectedEmpId.value = empId
  drawerVisible.value = true
}

function handleDrawerClose() {
  drawerVisible.value = false
}

// 从mock数据中获取最早和最晚的日期范围
const dataDateRange = computed(() => {
  let earliest = ''
  let latest = ''
  
  for (const row of store.allTimelineData) {
    for (const trip of row.trips) {
      if (!earliest || trip.startTime < earliest) {
        earliest = trip.startTime
      }
      if (!latest || trip.endTime > latest) {
        latest = trip.endTime
      }
    }
  }
  
  if (!earliest || !latest) {
    const now = dayjs()
    earliest = now.startOf('week').format('YYYY-MM-DD')
    latest = now.endOf('week').format('YYYY-MM-DD')
  }
  
  return { start: earliest, end: latest }
})

// 根据视图模式计算日期范围和第一层分组
const dateRangeInfo = computed(() => {
  // 优先使用筛选器的时间范围，否则用数据的时间范围
  let rangeStart: dayjs.Dayjs
  let rangeEnd: dayjs.Dayjs
  
  if (filterParams.value.dateRange && filterParams.value.dateRange.length === 2) {
    rangeStart = dayjs(filterParams.value.dateRange[0])
    rangeEnd = dayjs(filterParams.value.dateRange[1])
  } else {
    const { start, end } = dataDateRange.value
    rangeStart = dayjs(start)
    rangeEnd = dayjs(end)
  }
  
  // 扩展边界以对齐周/月视图
  switch (store.viewMode) {
    case 'day':
      // 日视图不扩展
      break
    case 'week':
      // 周视图对齐到周开始/结束
      rangeStart = rangeStart.startOf('week')
      rangeEnd = rangeEnd.endOf('week')
      break
    case 'month':
      // 月视图对齐到月开始/结束
      rangeStart = rangeStart.startOf('month')
      rangeEnd = rangeEnd.endOf('month')
      break
  }
  
  // 生成日期数组
  const days = rangeEnd.diff(rangeStart, 'day') + 1
  const result: string[] = []
  for (let i = 0; i < days; i++) {
    result.push(rangeStart.add(i, 'day').format('YYYY-MM-DD'))
  }
  
  // 计算第一层分组（周/月视图）
  let firstLayerGroups: { title: string; spanDays: number }[] = []
  
  if (store.viewMode === 'week') {
    let cur = rangeStart.clone()
    while (cur.isBefore(rangeEnd) || cur.isSame(rangeEnd, 'day')) {
      const weekEnd = cur.endOf('week')
      const clampedEnd = weekEnd.isAfter(rangeEnd) ? rangeEnd : weekEnd
      const spanDays = clampedEnd.diff(cur, 'day') + 1
      
      firstLayerGroups.push({
        title: `${cur.format('M月D日')} - ${clampedEnd.format('M月D日')}`,
        spanDays
      })
      
      cur = cur.add(1, 'week')
    }
  } else if (store.viewMode === 'month') {
    let curMonth = rangeStart.clone()
    while (curMonth.isBefore(rangeEnd) || curMonth.isSame(rangeEnd, 'month')) {
      const monthEnd = curMonth.endOf('month')
      const clampedEnd = monthEnd.isAfter(rangeEnd) ? rangeEnd : monthEnd
      const spanDays = clampedEnd.diff(curMonth, 'day') + 1
      
      firstLayerGroups.push({
        title: `${curMonth.format('M月 YYYY年')}`,
        spanDays
      })
      
      curMonth = curMonth.add(1, 'month')
    }
  }
  
  return { dates: result, firstLayerGroups }
})

const dates = computed(() => dateRangeInfo.value.dates)
const firstLayerGroups = computed(() => dateRangeInfo.value.firstLayerGroups)

const dateRangeStart = computed(() => dates.value[0] || '')

// 引用 filterParams
const filterParams = computed(() => store.filterParams)

// 固定天数宽度，不随视图变化
const dayWidth = 80

const totalWidth = computed(() => dates.value.length * dayWidth)

// 中文星期
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 表头标签
const headerLabels = computed(() => {
  return dates.value.map(date => {
    const d = new Date(date)
    return {
      label: weekdays[d.getDay()],
      day: d.getDate(),
      isToday: dayjs(date).isSame(dayjs(), 'day'),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    }
  })
})

// 第一层标题
const headerTitle = computed(() => {
  const first = dayjs(dates.value[0])
  const last = dayjs(dates.value[dates.value.length - 1])
  return `${first.format('M月D日')} - ${last.format('M月D日')}`
})

// 是否有第一层
const hasFirstLayer = computed(() => store.viewMode !== 'day')

// 员工列头高度 - 与表头总高度一致
const employeeHeaderHeight = computed(() => {
  return hasFirstLayer.value ? 80 : 40
})

// 表头总高度
const headerTotalHeight = computed(() => {
  return hasFirstLayer.value ? 80 : 40
})

// 每一行的高度
const rowHeight = 40

const headerScrollRef = ref<HTMLElement | null>(null)
const bodyScrollRef = ref<HTMLElement | null>(null)

// 表头和内容同步滚动
function onBodyScroll(event: Event) {
  const target = event.target as HTMLElement
  if (headerScrollRef.value) {
    headerScrollRef.value.scrollLeft = target.scrollLeft
  }
}

function onHeaderScroll(event: Event) {
  const target = event.target as HTMLElement
  if (bodyScrollRef.value) {
    bodyScrollRef.value.scrollLeft = target.scrollLeft
  }
}

watch(() => store.viewMode, () => {
  if (bodyScrollRef.value) bodyScrollRef.value.scrollLeft = 0
  if (headerScrollRef.value) headerScrollRef.value.scrollLeft = 0
})

interface TooltipState {
  visible: boolean
  x: number
  y: number
  trip: TripItem | null
}

const tooltip = ref<TooltipState>({
  visible: false,
  x: 0,
  y: 0,
  trip: null,
})

function handleTripHover(trip: TripItem, event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
    trip,
  }
}

function handleTripLeave() {
  tooltip.value.visible = false
}

function goToToday() {
  const today = dayjs().format('YYYY-MM-DD')
  const idx = dates.value.indexOf(today)
  if (idx !== -1) {
    const scrollEl = bodyScrollRef.value
    const headerEl = headerScrollRef.value
    if (!scrollEl) return
    const targetOffset = idx * dayWidth
    const startOffset = scrollEl.scrollLeft
    const delta = targetOffset - startOffset
    const duration = 400
    const startTime = performance.now()

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOut(progress)
      const currentOffset = startOffset + delta * eased
      scrollEl.scrollLeft = currentOffset
      if (headerEl) headerEl.scrollLeft = currentOffset
      if (progress < 1) requestAnimationFrame(animate)
    }


    requestAnimationFrame(animate)
  }
}
</script>

<template>
  <div class="timeline-container">
    <div class="timeline-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">企业出差行程管理系统</h2>
      </div>
      
      <div class="toolbar-center" />
      
      <div class="toolbar-right">
        <button type="button" class="today-btn el-button el-button--primary el-button--small" @click.stop="goToToday">今天</button>
        
        <el-radio-group v-model="store.viewMode" size="small">
          <el-radio-button value="day">日</el-radio-button>
          <el-radio-button value="week">周</el-radio-button>
          <el-radio-button value="month">月</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 时间轴区域 -->
    <div class="timeline-main">
      <!-- 左侧员工列（固定） -->
      <div class="employee-column">
        <div class="employee-header">
          <div class="employee-header-cell">员工</div>
          <div class="employee-header-cell location-header">当前所在地</div>
        </div>
        <div class="employee-list">
          <div
            v-for="row in store.filteredData"
            :key="row.empId + '-emp'"
            class="employee-row"
            :class="{ 'is-hovered': hoveredEmpId === row.empId, 'is-selected': selectedEmpId === row.empId }"
            @click="handleEmployeeClick(row.empId)"
            @mouseenter="hoveredEmpId = row.empId"
            @mouseleave="hoveredEmpId = null"
          >
            <div class="employee-main">
              <div class="avatar">
                <span>{{ row.empName.slice(0, 1) }}</span>
              </div>
              <div class="name">{{ row.empName }}</div>
            </div>
            <div class="employee-location">
              {{ employeeCurrentLocation.get(row.empId) ?? '-' }}
            </div>
          </div>
          <div v-if="store.filteredData.length === 0" class="empty-employee">
            暂无数据
          </div>
        </div>
      </div>

      <!-- 右侧时间轴（可滚动） -->
      <div class="timeline-content">
        <!-- 表头（可滚动） -->
        <div 
          ref="headerScrollRef"
          class="timeline-header"
          :class="{ 'has-two-rows': hasFirstLayer }"
          :style="{ height: headerTotalHeight + 'px' }"
          @scroll="onHeaderScroll"
        >
          <!-- 日视图：只有一行 -->
          <template v-if="store.viewMode === 'day'">
            <div 
              class="header-row header-single"
              :style="{ width: totalWidth + 'px', height: '40px' }"
            >
              <div
                v-for="(cell, index) in headerLabels"
                :key="dates[index]"
                class="header-cell"
                :class="{
                  'is-today': cell.isToday,
                  'is-weekend': cell.isWeekend,
                }"
                :style="{ width: dayWidth + 'px', height: '40px' }"
              >
                <span class="day-label">周{{ cell.label }}</span>
                <span class="day-num">{{ cell.day }}</span>
              </div>
            </div>
          </template>
          
          <!-- 周/月视图：两行 -->
          <template v-else>
            <!-- 第一行：分组标题 -->
            <div 
              class="header-row header-title"
              :style="{ width: totalWidth + 'px', height: '40px' }"
            >
              <div
                v-for="(group, index) in firstLayerGroups"
                :key="index"
                class="header-title-cell"
                :style="{ width: (group.spanDays * dayWidth) + 'px', height: '40px' }"
              >
                {{ group.title }}
              </div>
            </div>
            
            <!-- 第二行：星期+日期 -->
            <div 
              class="header-row header-weekday"
              :style="{ width: totalWidth + 'px', height: '40px' }"
            >
              <div
                v-for="(cell, index) in headerLabels"
                :key="dates[index]"
                class="header-cell"
                :class="{
                  'is-today': cell.isToday,
                  'is-weekend': cell.isWeekend,
                }"
                :style="{ width: dayWidth + 'px', height: '40px' }"
              >
                <span class="day-label">周{{ cell.label }}</span>
                <span class="day-num">{{ cell.day }}</span>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 表体 -->
        <div ref="bodyScrollRef" class="timeline-body" @scroll="onBodyScroll">
          <div class="timeline-body-inner" :style="{ width: totalWidth + 'px' }">
            <template v-if="store.filteredData.length > 0">
              <TimelineRow
                v-for="row in store.filteredData"
                :key="row.empId"
                :row="row"
                :dates="dates"
                :range-start="dateRangeStart"
                :day-width="dayWidth"
                :row-height="rowHeight"
                :hovered-emp-id="hoveredEmpId"
                @trip-hover="handleTripHover"
                @trip-leave="handleTripLeave"
              />
            </template>
            <div v-else class="empty-state">
              暂无出差行程
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="tooltip.visible && tooltip.trip"
        class="trip-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-city">{{ tooltip.trip.city }}</div>
        <div class="tooltip-name">{{ tooltip.trip.empName }}</div>
        <div class="tooltip-date">
          {{ dayjs(tooltip.trip.startTime).format('MM/DD') }} ~ {{ dayjs(tooltip.trip.endTime).format('MM/DD') }}
        </div>
        <div class="tooltip-status" :class="tooltip.trip.status">
          {{ TRIP_STATUS_LABELS[tooltip.trip.status] }}
        </div>
      </div>
    </Teleport>

    <!-- 员工详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="selectedEmployee ? selectedEmployee.empName + ' 的行程' : '员工行程'"
      size="480px"
      direction="rtl"
      @close="handleDrawerClose"
    >
      <template v-if="selectedEmployee">
        <div class="drawer-content">
          <div class="drawer-emp-info">
            <div class="drawer-avatar">
              <span>{{ selectedEmployee.empName.slice(0, 1) }}</span>
            </div>
            <div class="drawer-info">
              <div class="drawer-name">{{ selectedEmployee.empName }}</div>
              <div class="drawer-dept">{{ selectedEmployee.deptName }} · {{ selectedEmployee.position }}</div>
            </div>
          </div>

          <el-divider />


          <div class="drawer-trips">
            <div
              v-for="trip in selectedEmployee.trips"
              :key="trip.id"
              class="drawer-trip-item"
              :class="'trip-' + trip.status"
            >
              <div class="trip-row">
                <span class="trip-city">{{ trip.city }}</span>
                <el-tag size="small" :type="trip.status === 'ongoing' ? 'success' : trip.status === 'upcoming' ? 'warning' : 'info'" disable-transitions>
                  {{ TRIP_STATUS_LABELS[trip.status] }}
                </el-tag>
              </div>
              <div class="trip-date">{{ trip.startTime }} ~ {{ trip.endTime }}</div>
              <div class="trip-type">
                {{ trip.tripType === 'domestic' ? '国内出差' : '海外出差' }}
              </div>
            </div>

            <el-empty v-if="selectedEmployee.trips.length === 0" description="暂无行程" />
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.timeline-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #E5E6EB;
  flex-shrink: 0;
}

.toolbar-left .page-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-date {
  font-size: 13px;
  color: #606266;
  min-width: 140px;
  text-align: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主题色 */
:deep(.el-radio-button__inner) {
  background: white;
  border-color: #E5E6EB;
  color: #606266;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: rgb(130, 189, 164);
  border-color: rgb(130, 189, 164);
  color: white;
}

:deep(.el-button--primary) {
  --el-button-bg-color: rgb(130, 189, 164);
  --el-button-border-color: rgb(130, 189, 164);
  --el-button-hover-bg-color: rgb(110, 169, 144);
  --el-button-hover-border-color: rgb(110, 169, 144);
}

.timeline-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧员工列 */
.employee-column {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #E5E6EB;
  background: white;
}

.employee-header {
  display: flex;
  align-items: center;
  background: #F5F7FA;
  border-bottom: 1px solid #E5E6EB;
  flex-shrink: 0;
  height: 40px;
}

.employee-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
  height: 100%;
}

.location-header {
  flex: 1;
}

.employee-row {
  display: flex;
  align-items: center;

  border-bottom: 1px solid #EBEEF5;
  box-sizing: border-box;
  cursor: pointer;
  transition: background 0.15s ease;
}

.employee-main {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 110px;
  flex-shrink: 0;
  padding: 0 8px;
  box-sizing: border-box;
}

.employee-location {
  flex: 1;
  font-size: 11px;
  color: #606266;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 1px solid #EBEEF5;
  box-sizing: border-box;
  min-width: 0;
}


.employee-row.is-hovered {
  background: #F5F7FA;
}

.employee-row.is-selected {
  background: #E8F5EE;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(130, 189, 164) 0%, rgb(150, 209, 184) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 500;
  flex-shrink: 0;
}

.name {
  font-size: 11px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-employee {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

/* 右侧时间轴 */
.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表头 */
.timeline-header {
  display: flex;
  flex-direction: column;
  background: #F5F7FA;
  border-bottom: 1px solid #E5E6EB;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.timeline-header::-webkit-scrollbar {
  display: none;
}

.header-row {
  display: flex;
}

.header-single {
  /* 日视图单行 */
}

.header-title {
  /* 周/月视图第一行 */
}

.header-title-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: #606266;
  background: #F5F7FA;
  white-space: nowrap;
  border-right: 1px solid #E5E6EB;
  flex-shrink: 0;
  box-sizing: border-box;
}

.header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-right: 1px solid #EBEEF5;
  box-sizing: border-box;
}

.header-cell.is-today {
  background: rgba(130, 189, 164, 0.15);
}

.header-cell.is-today .day-num {
  background: rgb(130, 189, 164);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.header-cell.is-weekend {
  background: #E8E8E8;
}

.header-cell.is-weekend .day-label {
  color: #909399;
}

.day-label {
  font-size: 9px;
  color: #909399;
  margin-bottom: 1px;
}

.day-num {
  font-size: 11px;
  font-weight: 600;
  color: #303133;
}

.timeline-body {
  flex: 1;
  overflow: auto;
}

.timeline-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.timeline-body::-webkit-scrollbar-track {
  background: #F5F7FA;
}

.timeline-body::-webkit-scrollbar-thumb {
  background: #DCDFE6;
  border-radius: 4px;
}

.timeline-body-inner {
  min-height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  font-size: 13px;
}

/* 悬浮卡片 */
.trip-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  min-width: 140px;
  z-index: 9999;
  pointer-events: none;
}

.trip-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
}

.tooltip-city {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.tooltip-name {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.tooltip-date {
  font-size: 11px;
  color: #909399;
  margin-bottom: 6px;
}

.tooltip-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.tooltip-status.upcoming {
  background: rgba(230, 162, 60, 0.15);
  color: #E6A23C;
}

.tooltip-status.ongoing {
  background: rgba(103, 194, 58, 0.15);
  color: #67C23A;
}

.tooltip-status.finished {
  background: rgba(144, 147, 153, 0.15);
  color: #909399;
}

/* 员工列 hover & 选中高亮 */
.employee-cell {
  cursor: pointer;
  transition: background 0.15s ease;
}

.employee-row.is-hovered {
  background: #F5F7FA;
}

.employee-row.is-selected {
  background: #E8F5EE;
}

/* 抽屉样式 */
.drawer-content {
  padding: 0 4px;
}

.drawer-emp-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0;
}

.drawer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(130, 189, 164) 0%, rgb(150, 209, 184) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.drawer-info {
  flex: 1;
  min-width: 0;
}


.drawer-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}


.drawer-dept {
  font-size: 12px;
  color: #909399;
}

.drawer-trips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-trip-item {
  border-radius: 8px;
  padding: 12px 14px;
  border-left: 3px solid;
}

.drawer-trip-item.trip-ongoing {
  background: rgba(103, 194, 58, 0.08);
  border-color: #67C23A;
}

.drawer-trip-item.trip-upcoming {
  background: rgba(230, 162, 60, 0.08);
  border-color: #E6A23C;
}

.drawer-trip-item.trip-finished {
  background: rgba(144, 147, 153, 0.06);
  border-color: #909399;
}

.drawer-trip-item.trip-conflict {
  background: rgba(245, 108, 108, 0.08);
  border-color: #F56C6C;
}

.trip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.trip-city {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}


.trip-date {
  font-size: 12px;
  color: #606266;
  margin-bottom: 3px;
}

.trip-type {
  font-size: 11px;
  color: #909399;
}
</style>