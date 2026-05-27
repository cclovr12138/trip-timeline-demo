<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '@/stores/trip'
import { getEmployeeDailyLocation } from '@/mock/locations'
import { TRIP_STATUS_LABELS, TRANSPORT_ICONS, TRANSPORT_COLORS } from '@/types'
import type { DayLocationItem, EmployeeDailyLocation } from '@/types'

const store = useTripStore()

const selectedEmpId = ref<string>('')
const tripForm = ref({
  city: '',
  tripType: 'domestic' as const,
  startTime: '',
  endTime: '',
})

const selectedEmployee = computed(() => {
  if (!selectedEmpId.value) return null
  return store.allTimelineData.find(r => r.empId === selectedEmpId.value) ?? null
})

const selectedEmployeeLocations = computed<EmployeeDailyLocation[]>(() => {
  if (!selectedEmpId.value) return []
  const emp = selectedEmployee.value
  if (!emp) return []
  const locations: EmployeeDailyLocation[] = []
  for (const trip of emp.trips) {
    const start = new Date(trip.startTime)
    const end = new Date(trip.endTime)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const items = getEmployeeDailyLocation(selectedEmpId.value, dateStr)
      if (items.length > 0) {
        locations.push({ empId: selectedEmpId.value, date: dateStr, items })
      }
    }
  }
  return locations
})

const allDayItems = computed<DayLocationItem[]>(() => {
  return selectedEmployeeLocations.value
    .flatMap(loc => loc.items)
    .sort((a, b) => a.date.localeCompare(b.date))
})

function getDayItemsByDate(date: string): DayLocationItem[] {
  return allDayItems.value.filter(item => item.date === date)
}

function getItemColor(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '#67C23A'
  if (item.category !== undefined) return TRANSPORT_COLORS[item.category]
  return '#909399'
}

function getItemIcon(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '🏠'
  if (item.category !== undefined) return TRANSPORT_ICONS[item.category]
  return '📍'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
</script>

<template>
  <div class="add-trip-container">
    <div class="page-header">
      <h2 class="page-title">添加行程</h2>
    </div>

    <div class="add-trip-layout">
      <!-- 左侧：表单 -->
      <div class="form-section">
        <!-- 员工选择 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">👤 选择员工</div>
          </template>
          <el-select v-model="selectedEmpId" placeholder="请选择员工" clearable style="width: 100%">
            <el-option
              v-for="emp in store.allTimelineData"
              :key="emp.empId"
              :label="emp.empName"
              :value="emp.empId"
            />
          </el-select>

          <!-- 员工基本信息 -->
          <div v-if="selectedEmployee" class="emp-info">
            <div class="emp-avatar">
              <span>{{ selectedEmployee.empName.slice(0, 1) }}</span>
            </div>
            <div class="emp-detail">
              <div class="emp-name">{{ selectedEmployee.empName }}</div>
              <div class="emp-dept">{{ selectedEmployee.deptName }} · {{ selectedEmployee.position }}</div>
            </div>
          </div>
        </el-card>

        <!-- 行程表单 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">📝 行程信息</div>
          </template>
          <el-form label-width="90px" label-position="left">
            <el-form-item label="目的地">
              <el-input v-model="tripForm.city" placeholder="请输入目的地城市" />
            </el-form-item>
            <el-form-item label="出差类型">
              <el-radio-group v-model="tripForm.tripType">
                <el-radio-button value="domestic">国内出差</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="tripForm.startTime"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="tripForm.endTime"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：历史行程明细 -->
      <div class="timeline-section">
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">🗓 历史行程明细</div>
          </template>

          <el-empty v-if="!selectedEmpId" description="请先选择员工" />
          <el-empty v-else-if="allDayItems.length === 0" description="该员工暂无行程明细" />

          <div v-else class="trip-timeline">
            <div
              v-for="(item, idx) in allDayItems"
              :key="idx"
              class="timeline-item"
              :class="[item.placeType, 'item-' + item.status]"
            >
              <div v-if="idx < allDayItems.length - 1" class="timeline-line" />
              <div class="timeline-dot" :style="{ borderColor: getItemColor(item), color: item.status !== 'finished' ? '#fff' : getItemColor(item), background: item.status !== 'finished' ? getItemColor(item) : '#fff' }">
                {{ getItemIcon(item) }}
              </div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(item.date) }} {{ TRIP_STATUS_LABELS[item.status] }}</div>
                <div v-if="item.placeType === 'travel'" class="travel-detail">
                  <div class="travel-route">{{ item.startPlace }} → {{ item.endPlace }}</div>
                  <div class="travel-no">
                    {{ item.category === 0 ? '高铁' : item.category === 1 ? '飞机' : '汽车' }}
                    {{ item.transportNo ? ` / ${item.transportNo}` : '' }}
                  </div>
                </div>
                <div v-else class="hotel-detail">
                  <div class="hotel-name">{{ item.hotelName || item.placeName }}</div>
                  <div v-if="item.roomType" class="hotel-room">{{ item.roomType }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-trip-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 16px 0;
  margin-bottom: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.add-trip-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.form-section {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-section {
  flex: 1;
  min-width: 0;
}

.form-card {
  border-radius: 8px;
  border: 1px solid #E5E6EB;
}

.card-header {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

/* 员工信息 */
.emp-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #F5F7FA;
  border-radius: 8px;
}

.emp-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(130, 189, 164) 0%, rgb(150, 209, 184) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.emp-detail {
  flex: 1;
  min-width: 0;
}

.emp-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.emp-dept {
  font-size: 12px;
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
  padding-bottom: 14px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  left: 9px;
  top: 22px;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #D0D0D0;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 1px;
  border: 1.5px solid;
  background: white;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-date {
  font-size: 11px;
  color: #909399;
  margin-bottom: 3px;
}

.travel-detail,
.hotel-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.travel-route {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.travel-no {
  font-size: 11px;
  color: #909399;
}

.hotel-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.hotel-room {
  font-size: 11px;
  color: #909399;
}
</style>