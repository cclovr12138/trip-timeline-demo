<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '@/stores/trip'
import { TRIP_STATUS_LABELS, TRANSPORT_ICONS, TRANSPORT_COLORS } from '@/types'
import type { DayLocationItem } from '@/types'

const store = useTripStore()

const isEditing = ref(false)

// 出差基本信息
const tripForm = ref({
  empName: '员工A',
  email: 'employeA@example.com',
  startDate: '',
  endDate: '',
  startPlace: '',
  endPlace: '',
  purpose: '',
  managers: [] as string[],
})
const formBackup = ref({ ...tripForm.value })

const employees = [
  { id: '1', name: '员工A', email: 'employeA@example.com' },
  { id: '2', name: '员工B', email: 'employeB@example.com' },
  { id: '3', name: '员工C', email: 'employeC@example.com' },
]
const currentEmpIdx = ref(0)

// ========================
// 行程数据（从弹窗填写）
// ========================
const tripList = ref<DayLocationItem[]>([])
const editMode = ref(false)

function editAllTrips() {
  editMode.value = !editMode.value
}

function toggleEdit() {
  if (isEditing.value) {
    isEditing.value = false
  } else {
    formBackup.value = { ...tripForm.value }
    isEditing.value = true
  }
}

function cancelEdit() {
  tripForm.value = { ...formBackup.value }
  isEditing.value = false
}

function saveEdit() {
  isEditing.value = false
}

function iterateEmployee() {
  currentEmpIdx.value = (currentEmpIdx.value + 1) % employees.length
  const emp = employees[currentEmpIdx.value]
  tripForm.value.empName = emp.name
  tripForm.value.email = emp.email
}

// ========================
// 弹窗
// ========================
const hotelDialogVisible = ref(false)
const tripDialogVisible = ref(false)
const editingIndex = ref<number | null>(null)

const hotelForm = ref({
  checkInDate: '',
  checkOutDate: '',
  city: '',
  hotelName: '',
  attachment: '',
  remark: '',
})

const tripDetailForm = ref({
  startPlace: '',
  endPlace: '',
  transportType: 'train' as 'train' | 'plane' | 'car',
  transportNo: '',
  date: '',
  timeRange: null as string[] | null,
  attachment: '',
  remark: '',
})

const timeSlots = [
  { label: '06:00', value: '06:00' },
  { label: '07:00', value: '07:00' },
  { label: '08:00', value: '08:00' },
  { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' },
  { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' },
  { label: '15:00', value: '15:00' },
  { label: '16:00', value: '16:00' },
  { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' },
  { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' },
  { label: '21:00', value: '21:00' },
  { label: '22:00', value: '22:00' },
]

// 打开弹窗（新增 or 编辑）
function openHotelDialog(index?: number) {
  editingIndex.value = index !== undefined ? index : null
  if (index !== undefined && index < tripList.value.length) {
    const item = tripList.value[index]
    if (item.placeType === 'hotel') {
      hotelForm.value = {
        checkInDate: item.date,
        checkOutDate: item.endDate || item.date,
        city: item.placeName,
        hotelName: item.hotelName || '',
        attachment: '',
        remark: item.remark || '',
      }
    }
  } else {
    hotelForm.value = { checkInDate: '', checkOutDate: '', city: '', hotelName: '', attachment: '', remark: '' }
  }
  hotelDialogVisible.value = true
}

function openTripDialog(index?: number) {
  editingIndex.value = index !== undefined ? index : null
  if (index !== undefined && index < tripList.value.length) {
    const item = tripList.value[index]
    if (item.placeType === 'travel') {
      const startTime = item.startTime || ''
      const endTime = item.endTime || ''
      tripDetailForm.value = {
        startPlace: item.startPlace,
        endPlace: item.endPlace,
        transportType: item.category === 0 ? 'train' : item.category === 1 ? 'plane' : 'car',
        transportNo: item.transportNo || '',
        date: item.date,
        timeRange: startTime && endTime ? [startTime, endTime] : null,
        attachment: '',
        remark: item.remark || '',
      }
    }
  } else {
    tripDetailForm.value = { startPlace: '', endPlace: '', transportType: 'train', transportNo: '', date: '', timeRange: null, attachment: '', remark: '' }
  }
  tripDialogVisible.value = true
}

function saveHotel() {
  const item: DayLocationItem = {
    date: hotelForm.value.checkInDate,
    endDate: hotelForm.value.checkOutDate,
    placeType: 'hotel',
    placeName: hotelForm.value.city,
    hotelName: hotelForm.value.hotelName,
    roomType: '',
    status: 'upcoming',
    remark: hotelForm.value.remark,
  }
  if (editingIndex.value !== null) {
    tripList.value[editingIndex.value] = item
  } else {
    tripList.value.push(item)
  }
  tripList.value.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return (a.startTime || '').localeCompare(b.startTime || '')
  })
  hotelDialogVisible.value = false
  editingIndex.value = null
}

function saveTrip() {
  const catMap: Record<string, 0 | 1 | 2> = { train: 0, plane: 1, car: 2 }
  const timeRange = tripDetailForm.value.timeRange
  const item: DayLocationItem = {
    date: tripDetailForm.value.date,
    placeType: 'travel',
    placeName: tripDetailForm.value.endPlace,
    startPlace: tripDetailForm.value.startPlace,
    endPlace: tripDetailForm.value.endPlace,
    category: catMap[tripDetailForm.value.transportType],
    transportNo: tripDetailForm.value.transportNo,
    status: 'upcoming',
    startTime: timeRange ? timeRange[0] : '',
    endTime: timeRange ? timeRange[1] : '',
    remark: tripDetailForm.value.remark,
  }
  if (editingIndex.value !== null) {
    tripList.value[editingIndex.value] = item
  } else {
    tripList.value.push(item)
  }
  tripList.value.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return (a.startTime || '').localeCompare(b.startTime || '')
  })
  tripDialogVisible.value = false
  editingIndex.value = null
}

// ========================
// 时间线渲染
// ========================
function getItemColor(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '#67C23A'
  return TRANSPORT_COLORS[item.category] ?? '#909399'
}

function getItemIcon(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '🏨'
  return TRANSPORT_ICONS[item.category] ?? '📍'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDisplayDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function editItem(index: number) {
  const item = tripList.value[index]
  if (item.placeType === 'hotel') {
    openHotelDialog(index)
  } else {
    openTripDialog(index)
  }
}
</script>

<template>
  <div class="add-trip-container">
    <div class="page-header">
      <h2 class="page-title">添加行程</h2>
    </div>

    <div class="add-trip-layout">
      <!-- 左侧：出差信息 + 按钮 -->
      <div class="left-section">
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📋 出差基本信息</span>
              <div class="header-actions">
                <template v-if="isEditing">
                  <el-button size="small" @click="cancelEdit">取消</el-button>
                  <el-button size="small" type="primary" @click="saveEdit">保存</el-button>
                </template>
                <template v-else>
                  <el-button size="small" text @click="toggleEdit" class="edit-btn">编辑</el-button>
                  <el-button text @click="iterateEmployee" class="iterate-btn" title="遍历员工">
                    <span class="iterate-icon">🔄</span>
                  </el-button>
                </template>
              </div>
            </div>
          </template>

          <!-- 查看模式 -->
          <div v-if="!isEditing" class="info-display">
            <div class="info-row">
              <span class="info-label">员工姓名</span>
              <span class="info-value">{{ tripForm.empName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ tripForm.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">出发日</span>
              <span class="info-value">{{ formatDisplayDate(tripForm.startDate) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">到达日</span>
              <span class="info-value">{{ formatDisplayDate(tripForm.endDate) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">出发地</span>
              <span class="info-value">{{ tripForm.startPlace || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">目的地</span>
              <span class="info-value">{{ tripForm.endPlace || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">出差目的</span>
              <span class="info-value">{{ tripForm.purpose || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">出差负责人</span>
              <span class="info-value">{{ tripForm.managers.length > 0 ? tripForm.managers.join('、') : '-' }}</span>
            </div>
          </div>

          <!-- 编辑模式 -->
          <el-form v-else label-width="90px" label-position="left" class="trip-form">
            <el-form-item label="员工姓名">
              <el-input v-model="tripForm.empName" placeholder="请输入员工姓名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="tripForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="出发日">
              <el-date-picker v-model="tripForm.startDate" type="date" placeholder="选择出发日期" style="width: 100%" />
            </el-form-item>
            <el-form-item label="到达日">
              <el-date-picker v-model="tripForm.endDate" type="date" placeholder="选择到达日期" style="width: 100%" />
            </el-form-item>
            <el-form-item label="出发地">
              <el-input v-model="tripForm.startPlace" placeholder="请输入出发地" />
            </el-form-item>
            <el-form-item label="目的地">
              <el-input v-model="tripForm.endPlace" placeholder="请输入目的地" />
            </el-form-item>
            <el-form-item label="出差目的">
              <el-input v-model="tripForm.purpose" type="textarea" placeholder="请输入出差目的" :rows="2" />
            </el-form-item>
            <el-form-item label="出差负责人">
              <el-select v-model="tripForm.managers" multiple placeholder="请选择负责人" style="width: 100%">
                <el-option v-for="emp in store.allTimelineData" :key="emp.empId" :label="emp.empName" :value="emp.empId" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 行程安排按钮 -->
        <div class="action-buttons">
          <el-button type="primary" class="action-btn" @click="openHotelDialog()">
            <span class="btn-icon">🏨</span>
            <span class="btn-text">添加酒店信息</span>
          </el-button>
          <el-button type="primary" class="action-btn" @click="openTripDialog()">
            <span class="btn-icon">✈</span>
            <span class="btn-text">添加行程信息</span>
          </el-button>
        </div>
      </div>

      <!-- 右侧：Timeline行程明细 -->
      <div class="right-section">
        <el-card class="timeline-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>🗓 行程安排明细</span>
              <el-button
                v-if="tripList.length > 0"
                text
                size="small"
                class="timeline-edit-btn"
                @click="editAllTrips"
              >
                <span class="btn-icon">{{ editMode ? '✕' : '✏️' }}</span>
                <span>{{ editMode ? '取消' : '编辑' }}</span>
              </el-button>
            </div>
          </template>

          <el-empty v-if="tripList.length === 0" description="暂无行程明细，请点击上方按钮添加" />

          <div v-else class="trip-timeline">
            <div
              v-for="(item, idx) in tripList"
              :key="idx"
              class="timeline-item"
              :class="{ 'is-editable': editMode, 'item-finished': item.status === 'finished', 'item-upcoming': item.status === 'upcoming', 'item-ongoing': item.status === 'ongoing' }"
              @click="editMode && editItem(idx)"
            >
              <div v-if="idx < tripList.length - 1" class="timeline-line" />
              <div
                class="timeline-dot"
                :style="{
                  borderColor: getItemColor(item),
                  color: item.status !== 'finished' ? '#fff' : getItemColor(item),
                  background: item.status !== 'finished' ? getItemColor(item) : '#fff',
                }"
              >
                {{ getItemIcon(item) }}
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-date">{{ formatDate(item.date) }} {{ TRIP_STATUS_LABELS[item.status] }}</span>
                  <el-button v-if="editMode" text size="small" class="item-edit-btn" @click.stop="editItem(idx)">编辑</el-button>
                </div>
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

    <!-- 酒店弹窗 -->
    <el-dialog
      v-model="hotelDialogVisible"
      title="添加酒店信息"
      width="500px"
      :close-on-click-modal="false"
      class="sync-dialog"
    >
      <el-form label-width="90px" label-position="left" class="dialog-form">
        <el-form-item label="入住日">
          <el-date-picker v-model="hotelForm.checkInDate" type="date" placeholder="选择入住日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="离开日">
          <el-date-picker v-model="hotelForm.checkOutDate" type="date" placeholder="选择离开日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入住城市">
          <el-input v-model="hotelForm.city" placeholder="请输入入住城市" />
        </el-form-item>
        <el-form-item label="酒店名">
          <el-input v-model="hotelForm.hotelName" placeholder="请输入酒店名称" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="1">
            <el-button size="small" type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="hotelForm.remark" type="textarea" placeholder="请输入备注" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hotelDialogVisible = false">取消</el-button>
        <el-button type="primary" class="sync-btn" @click="saveHotel">保存</el-button>
      </template>
    </el-dialog>

    <!-- 行程弹窗 -->
    <el-dialog
      v-model="tripDialogVisible"
      title="添加行程信息"
      width="500px"
      :close-on-click-modal="false"
      class="sync-dialog"
    >
      <el-form label-width="90px" label-position="left" class="dialog-form">
        <el-form-item label="出发地">
          <el-input v-model="tripDetailForm.startPlace" placeholder="请输入出发地" />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="tripDetailForm.endPlace" placeholder="请输入目的地" />
        </el-form-item>
        <el-form-item label="出行方式">
          <el-radio-group v-model="tripDetailForm.transportType" class="transport-group">
            <el-radio value="train">高铁</el-radio>
            <el-radio value="plane">飞机</el-radio>
            <el-radio value="car">汽车</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班次/航班号">
          <el-input v-model="tripDetailForm.transportNo" :placeholder="tripDetailForm.transportType === 'plane' ? '请输入航班号' : '请输入班次号'" />
        </el-form-item>
        <el-form-item label="行程日期">
          <el-date-picker v-model="tripDetailForm.date" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间区间">
          <el-time-picker
            v-model="tripDetailForm.timeRange"
            is-range
            range-separator="至"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="请选择时间区间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="1">
            <el-button size="small" type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="tripDetailForm.remark" type="textarea" placeholder="请输入备注" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tripDialogVisible = false">取消</el-button>
        <el-button type="primary" class="sync-btn" @click="saveTrip">保存</el-button>
      </template>
    </el-dialog>
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

.left-section {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-section {
  flex: 1;
  min-width: 0;
}

.form-card,
.timeline-card {
  border-radius: 8px;
  border: 1px solid #E5E6EB;
  background: white;
}

.card-header {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-btn,
.iterate-btn {
  padding: 4px 8px;
  border-radius: 4px;
  color: rgb(130, 189, 164);
}

.iterate-icon {
  font-size: 14px;
  display: inline-block;
  transition: transform 0.2s ease;
}

.iterate-btn:hover .iterate-icon {
  transform: rotate(45deg);
}

.edit-btn:hover,
.iterate-btn:hover {
  color: rgb(103, 194, 58);
}

/* 查看模式 */
.info-display {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #F0F0F0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 90px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

/* 编辑模式表单 */
.trip-form {
  display: flex;
  flex-direction: column;
}

/* 按钮横向排列 */
.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  border-radius: 6px;
  background: rgb(130, 189, 164);
  border-color: rgb(130, 189, 164);
  color: #fff;
}

.action-btn:hover {
  background: rgb(150, 209, 184);
  border-color: rgb(150, 209, 184);
  color: #fff;
}

.timeline-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgb(130, 189, 164);
  font-size: 12px;
}

.timeline-edit-btn:hover {
  color: rgb(103, 194, 58);
}

.timeline-edit-btn .btn-icon {
  font-size: 12px;
}

/* 时间线 */
.trip-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  padding-bottom: 14px;
  border-radius: 6px;
  transition: background 0.15s ease;
  cursor: default;
}

.timeline-item.is-editable {
  cursor: pointer;
}

.timeline-item.is-editable:hover {
  background: rgba(130, 189, 164, 0.08);
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

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}

.timeline-date {
  font-size: 11px;
  color: #909399;
}

.item-edit-btn {
  color: rgb(130, 189, 164);
  font-size: 11px;
  padding: 0 2px;
}

.item-edit-btn:hover {
  color: rgb(103, 194, 58);
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

/* 弹窗 */
.sync-dialog .el-dialog__header {
  background: linear-gradient(135deg, rgb(130, 189, 164) 0%, rgb(150, 209, 184) 100%);
  border-radius: 8px 8px 0 0;
  padding: 16px 20px;
  margin: 0;
}

.sync-dialog .el-dialog__title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.sync-dialog .el-dialog__headerbtn {
  top: 16px;
  right: 16px;
}

.sync-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255,255,255,0.8);
  font-size: 16px;
}

.sync-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #fff;
}

.sync-dialog .el-dialog__body {
  padding: 20px;
}

/* 底部按钮 */
.sync-dialog .el-dialog__footer {
  padding: 12px 20px;
  border-top: 1px solid #F0F0F0;
}

.sync-btn {
  background: rgb(130, 189, 164) !important;
  border-color: rgb(130, 189, 164) !important;
  color: #fff !important;
}

.sync-btn:hover {
  background: rgb(150, 209, 184) !important;
  border-color: rgb(150, 209, 184) !important;
}
</style>