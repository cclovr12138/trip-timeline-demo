<script setup lang="ts">
import { ref } from 'vue'
import { useTripStore } from '@/stores/trip'
import { TRIP_STATUS_LABELS, TRANSPORT_ICONS, TRANSPORT_COLORS } from '@/types'
import type { DayLocationItem } from '@/types'

const store = useTripStore()

const isEditing = ref(false)

// 出差基本信息（编辑时的数据）
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

// 备份（取消时恢复）
const formBackup = ref({ ...tripForm.value })

const employees = [
  { id: '1', name: '员工A', email: 'employeA@example.com' },
  { id: '2', name: '员工B', email: 'employeB@example.com' },
  { id: '3', name: '员工C', email: 'employeC@example.com' },
]
const currentEmpIdx = ref(0)

function toggleEdit() {
  if (isEditing.value) {
    // 保存
    isEditing.value = false
  } else {
    // 开始编辑，备份当前数据
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

// 弹窗
const hotelDialogVisible = ref(false)
const tripDialogVisible = ref(false)

// 酒店信息
const hotelForm = ref({
  checkInDate: '',
  checkOutDate: '',
  city: '',
  hotelName: '',
  attachment: '',
  remark: '',
})

// 行程信息
const tripDetailForm = ref({
  startPlace: '',
  endPlace: '',
  transportType: 'train' as 'train' | 'plane' | 'car',
  transportNo: '',
  date: '',
  startTime: '',
  endTime: '',
  attachment: '',
  remark: '',
})

const timeSlots = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00',
  '12:00-14:00', '14:00-16:00', '16:00-18:00',
  '18:00-20:00', '20:00-22:00',
]

const mockDayItems: DayLocationItem[] = [
  { date: '2026-05-20', placeType: 'travel', placeName: '北京', startPlace: '北京', endPlace: '上海', category: 0, transportNo: 'G1', status: 'finished' },
  { date: '2026-05-20', placeType: 'hotel', placeName: '上海', hotelName: '如家酒店', roomType: '标准间', status: 'finished' },
  { date: '2026-05-21', placeType: 'travel', placeName: '上海', startPlace: '上海', endPlace: '广州', category: 1, transportNo: 'MU1234', status: 'finished' },
  { date: '2026-05-21', placeType: 'hotel', placeName: '广州', hotelName: '汉庭酒店', roomType: '大床房', status: 'finished' },
  { date: '2026-05-22', placeType: 'travel', placeName: '广州', startPlace: '广州', endPlace: '深圳', category: 2, transportNo: '', status: 'finished' },
]

function getItemColor(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '#67C23A'
  return TRANSPORT_COLORS[item.category] ?? '#909399'
}

function getItemIcon(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '🏨'
  return TRANSPORT_ICONS[item.category] ?? '📍'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDisplayDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function openHotelDialog() {
  hotelDialogVisible.value = true
}

function openTripDialog() {
  tripDialogVisible.value = true
}

function saveHotel() {
  console.log('保存酒店:', hotelForm.value)
  hotelDialogVisible.value = false
  hotelForm.value = { checkInDate: '', checkOutDate: '', city: '', hotelName: '', attachment: '', remark: '' }
}

function saveTrip() {
  console.log('保存行程:', tripDetailForm.value)
  tripDialogVisible.value = false
  tripDetailForm.value = { startPlace: '', endPlace: '', transportType: 'train', transportNo: '', date: '', startTime: '', endTime: '', attachment: '', remark: '' }
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

          <!-- 查看模式：纯文本展示 -->
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

          <!-- 编辑模式：表单输入 -->
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
          <el-button type="primary" class="action-btn" @click="openHotelDialog">
            <span class="btn-icon">🏨</span>
            <span class="btn-text">添加酒店信息</span>
          </el-button>
          <el-button type="primary" class="action-btn" @click="openTripDialog">
            <span class="btn-icon">✈</span>
            <span class="btn-text">添加行程信息</span>
          </el-button>
        </div>
      </div>

      <!-- 右侧：Timeline行程明细 -->
      <div class="right-section">
        <el-card class="timeline-card" shadow="never">
          <template #header>
            <div class="card-header">🗓 行程安排明细</div>
          </template>

          <div class="trip-timeline">
            <div
              v-for="(item, idx) in mockDayItems"
              :key="idx"
              class="timeline-item"
              :class="[item.placeType, 'item-' + item.status]"
            >
              <div v-if="idx < mockDayItems.length - 1" class="timeline-line" />
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

    <!-- 酒店弹窗 -->
    <el-dialog v-model="hotelDialogVisible" title="添加酒店信息" width="500px" :close-on-click-modal="false">
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
        <el-button type="primary" @click="saveHotel">保存</el-button>
      </template>
    </el-dialog>

    <!-- 行程弹窗 -->
    <el-dialog v-model="tripDialogVisible" title="添加行程信息" width="500px" :close-on-click-modal="false">
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
          <el-select v-model="tripDetailForm.startTime" placeholder="开始" style="width: 45%">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot.split('-')[0]" />
          </el-select>
          <span class="time-sep">至</span>
          <el-select v-model="tripDetailForm.endTime" placeholder="结束" style="width: 45%">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot.split('-')[1]" />
          </el-select>
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
        <el-button type="primary" @click="saveTrip">保存</el-button>
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
}

.iterate-icon {
  font-size: 14px;
  display: inline-block;
  transition: transform 0.2s ease;
}

.iterate-btn:hover .iterate-icon {
  transform: rotate(45deg);
}

/* 查看模式 - 纯文本展示 */
.info-display {
  display: flex;
  flex-direction: column;
  gap: 0;
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
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
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

/* 弹窗 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transport-group {
  display: flex;
  gap: 16px;
}

.time-sep {
  width: 20px;
  text-align: center;
  color: #909399;
  line-height: 32px;
}
</style>