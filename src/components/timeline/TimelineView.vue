<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import type { ViewMode, TripItem, DayLocationItem } from '@/types'
import { useTripStore } from '@/stores/trip'
import { TRIP_STATUS_LABELS, TRANSPORT_ICONS, TRANSPORT_COLORS } from '@/types'
import { getEmployeeDailyLocation, enrichTripsWithDayItems } from '@/mock/locations'
import TimelineRow from './TimelineRow.vue'

const store = useTripStore()

// 选中员工相关
const selectedEmpId = ref<string | null>(null)
const drawerVisible = ref(false)
const hoveredEmpId = ref<string | null>(null)

// 当前选中员工的完整数据（含每日明细）
const selectedEmployee = computed(() => {
  if (!selectedEmpId.value) return null
  const row = store.allTimelineData.find(r => r.empId === selectedEmpId.value)
  if (!row) return null
  return {
    ...row,
    trips: enrichTripsWithDayItems(row.trips, row.empId),
  }
})

// 计算员工当前所在地（今日行程目的地）
const employeeCurrentLocation = computed(() => {
  const map = new Map<string, DayLocationItem[]>()
  const today = dayjs().format('YYYY-MM-DD')
  const todayObj = dayjs(today)
  for (const row of store.allTimelineData) {
    const dailyItems = getEmployeeDailyLocation(row.empId, today)
    map.set(row.empId, dailyItems)
  }
  return map
})

// 单元格显示文本（120px内显示的内容）
function getLocationDisplayText(items: DayLocationItem[]): string {
  if (!items || items.length === 0) return '-'
  // 优先显示 ongoing 的 travel
  const ongoingTravel = items.find(i => i.placeType === 'travel' && i.status === 'ongoing')
  const upcomingTravel = items.find(i => i.placeType === 'travel' && i.status === 'upcoming')
  const travel = ongoingTravel ?? upcomingTravel
  if (travel) {
    const icon = travel.category !== undefined ? TRANSPORT_ICONS[travel.category] : ''
    const dest = travel.endPlace ?? travel.placeName
    const travelCount = items.filter(i => i.placeType === 'travel').length
    const hotelCount = items.filter(i => i.placeType === 'hotel').length
    let text = `${icon} ${dest}`
    if (hotelCount > 0) text += ` 🏠×${hotelCount}`
    if (travelCount > 1) text += ` +${travelCount - 1}`
    return text
  }
  // 只有酒店
  const hotelCount = items.filter(i => i.placeType === 'hotel').length
  const hotel = items.find(i => i.placeType === 'hotel')
  if (hotel) {
    const name = hotel.hotelName ?? hotel.placeName
    return hotelCount > 1 ? `🏠 ${name} ×${hotelCount}` : `🏠 ${name}`
  }
  return '-'
}

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
  <div class="dashboard-view">
    <div class="statistics-row">
      <div class="stat-card stat-blue">
        <div class="stat-label">今日出差</div>
        <div class="stat-value">{{ store.statistics.todayTripCount }}</div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-label">本周出差</div>
        <div class="stat-value">{{ store.statistics.weekTripCount }}</div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-label">即将返程</div>
        <div class="stat-value">{{ store.statistics.returningCount }}</div>
      </div>
      <div class="stat-card stat-violet">
        <div class="stat-label">海外出差</div>
        <div class="stat-value">{{ store.statistics.overseasCount }}</div>
      </div>
      <div class="stat-card stat-red">
        <div class="stat-label">行程冲突</div>
        <div class="stat-value">{{ store.statistics.conflictCount }}</div>
      </div>
    </div>

    <FilterPanel :departments="store.departmentList" />

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
        <div class="employee-header" :style="{ height: headerTotalHeight + 'px' }">
          <div class="employee-header-cell">员工</div>
          <div class="employee-header-cell location-header">当前所在地</div>
        </div>
        <div class="employee-list">
          <div
            v-for="row in store.filteredData"
            :key="row.empId + '-emp'"
            class="employee-row"
            :class="{ 'is-hovered': hoveredEmpId === row.empId, 'is-selected': selectedEmpId === row.empId }"
            :style="{ height: rowHeight + 'px' }"
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
              <el-tooltip
                v-if="(employeeCurrentLocation.get(row.empId) ?? []).length > 1"
                :content="getLocationDisplayText(employeeCurrentLocation.get(row.empId) ?? [])"
                placement="top"
                effect="light"
              >
                <span class="location-text">{{ getLocationDisplayText(employeeCurrentLocation.get(row.empId) ?? []) }}</span>
              </el-tooltip>
              <span v-else class="location-text">{{ getLocationDisplayText(employeeCurrentLocation.get(row.empId) ?? []) }}</span>
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
              class="drawer-trip-card"
              :class="'status-' + trip.status"
            >
              <!-- 行程头 -->
              <div class="trip-card-header">
                <div class="trip-card-title">
                  <span class="trip-city-name">{{ trip.city }}</span>
                  <span class="trip-card-range">{{ trip.startTime }} ~ {{ trip.endTime }}</span>
                </div>
                <el-tag size="small" :type="trip.status === 'ongoing' ? 'success' : trip.status === 'upcoming' ? 'warning' : 'info'" disable-transitions>
                  {{ TRIP_STATUS_LABELS[trip.status] }}
                </el-tag>
              </div>

              <!-- 每日时间线 -->
              <div v-if="trip.dayItems && trip.dayItems.length > 0" class="trip-timeline">
                <div
                  v-for="(item, idx) in trip.dayItems"
                  :key="idx"
                  class="timeline-item"
                  :class="[item.placeType, 'item-' + item.status]"
                >
                  <!-- 连接线（除最后一个） -->
                  <div v-if="idx < trip.dayItems.length - 1" class="timeline-line" />

                  <!-- 图标点 -->
                  <div class="timeline-dot" :class="item.placeType">
                    <span v-if="item.placeType === 'hotel'">🏠</span>
                    <span v-else-if="item.category !== undefined">{{ TRANSPORT_ICONS[item.category] }}</span>
                    <span v-else>📍</span>
                  </div>

                  <!-- 内容 -->
                  <div class="timeline-content">
                    <div class="timeline-date">{{ item.date }}</div>

                    <div v-if="item.placeType === 'travel'" class="travel-detail">
                      <span class="travel-route">
                        {{ item.startPlace }} → {{ item.endPlace }}
                      </span>
                      <span v-if="item.transportNo" class="travel-no" :style="{ color: item.category !== undefined ? TRANSPORT_COLORS[item.category] : '' }">
                        {{ item.category !== undefined ? (item.category === 0 ? '高铁 ' : item.category === 1 ? '飞机 ' : '汽车 ') : '' }}{{ item.transportNo }}
                      </span>
                    </div>

                    <div v-else class="hotel-detail">
                      <span class="hotel-name">{{ item.hotelName || item.placeName }}</span>
                      <span v-if="item.roomType" class="hotel-room">{{ item.roomType }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="trip-no-detail">暂无明细</div>
            </div>

            <el-empty v-if="selectedEmployee.trips.length === 0" description="暂无行程" />
          </div>
        </div>
      </template>
    </el-drawer>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-row {
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #E5E6EB;
  background: white;
}

.stat-card.stat-blue {
  border-left: 3px solid rgb(64, 158, 255);
}

.stat-card.stat-green {
  border-left: 3px solid rgb(103, 194, 58);
}

.stat-card.stat-orange {
  border-left: 3px solid rgb(230, 162, 60);
}

.stat-card.stat-violet {
  border-left: 3px solid rgb(114, 46, 209);
}

.stat-card.stat-red {
  border-left: 3px solid rgb(245, 108, 108);
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-card.stat-blue .stat-value {
  color: rgb(64, 158, 255);
}

.stat-card.stat-green .stat-value {
  color: rgb(103, 194, 58);
}

.stat-card.stat-orange .stat-value {
  color: rgb(230, 162, 60);
}

.stat-card.stat-violet .stat-value {
  color: rgb(114, 46, 209);
}

.stat-card.stat-red .stat-value {
  color: rgb(245, 108, 108);
}


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
  width: 240px;
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
}

.employee-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
  width: 120px;
  height: 100%;
  box-sizing: border-box;
}

.location-header {
  width: 120px;
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
  width: 120px;
  flex-shrink: 0;
  padding: 0 8px;
  box-sizing: border-box;
}

.employee-location {
  width: 120px;
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


.location-text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
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
  gap: 14px;
}

/* 行程卡片 */
.drawer-trip-card {
  border-radius: 10px;
  padding: 14px 16px;
  border-left: 4px solid;
}

.drawer-trip-card.status-ongoing {
  background: rgba(103, 194, 58, 0.06);
  border-color: #67C23A;
}

.drawer-trip-card.status-upcoming {
  background: rgba(230, 162, 60, 0.06);
  border-color: #E6A23C;
}

.drawer-trip-card.status-finished {
  background: rgba(144, 147, 153, 0.04);
  border-color: #909399;
}

.drawer-trip-card.status-conflict {
  background: rgba(245, 108, 108, 0.06);
  border-color: #F56C6C;
}

/* 行程卡片头部 */
.trip-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.trip-card-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trip-city-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.trip-card-range {
  font-size: 11px;
  color: #909399;
}

/* 时间线 */
.trip-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  padding-bottom: 12px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}


/* 垂直连接线 */
.timeline-line {
  position: absolute;
  left: 9px;
  top: 22px;
  bottom: 0;
  width: 1px;
  background: #E0E0E0;
  border-left: 1px dashed #D0D0D0;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

/* 图标点 */
.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 1px;
  background: white;
  border: 1.5px solid;
}

.timeline-dot.hotel {
  border-color: #67C23A;
  color: #67C23A;
}

.timeline-dot.travel {
  border-color: #409EFF;
  color: #409EFF;
}


.timeline-item.item-ongoing .timeline-dot {
  background: #67C23A;
  color: white;
  border-color: #67C23A;
}

.timeline-item.item-upcoming .timeline-dot {
  background: #E6A23C;
  color: white;
  border-color: #E6A23C;
}

/* 时间线内容 */
.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-date {
  font-size: 10px;
  color: #909399;
  margin-bottom: 2px;
}

.travel-detail,
.hotel-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.travel-route {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.travel-no {
  font-size: 10px;
}

.hotel-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.hotel-room {
  font-size: 10px;
  color: #909399;
}

.trip-no-detail {
  font-size: 11px;
  color: #C0C0C0;
  text-align: center;
  padding: 6px 0;
}
</style>