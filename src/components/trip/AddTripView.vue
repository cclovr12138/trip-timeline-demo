<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useTripStore } from '@/stores/trip'
import {
  TRIP_STATUS_LABELS,
  TRANSPORT_ICONS,
  TRANSPORT_COLORS,
  TRANSPORT_LABELS,
  type DayLocationItem,
  type AttachmentInfo,
} from '@/types'

const store = useTripStore()

// ========================
// 出差基本信息
// ========================
const isEditing = ref(false)
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
// 行程数据
// ========================
const tripList = ref<DayLocationItem[]>([])
const editMode = ref(false)
function editAllTrips() {
  editMode.value = !editMode.value
}
function deleteItem(idx: number) {
  tripList.value.splice(idx, 1)
  ElMessage.success('已删除')
}

// ========================
// 合并弹窗
// ========================
const dialogVisible = ref(false)
const dialogStep = ref<'choice' | 'hotel' | 'trip'>('choice')
const dialogTitle = ref('选择添加类型')
const editingIndex = ref<number | null>(null)
const defaultDate = ref('')  // 快速添加时预填的日期

const hotelForm = ref({
  checkInDate: '',
  checkOutDate: '',
  city: '',
  hotelName: '',
  roomType: '',
  managers: [] as string[],
  attachments: [] as AttachmentInfo[],
  remark: '',        // 出差备注
  managerRemark: '', // 负责人备注
})

const tripDetailForm = ref({
  startPlace: '',
  endPlace: '',
  transportType: 'train' as 'train' | 'plane' | 'car',
  transportNo: '',
  date: '',
  startTime: '',
  endTime: '',
  managers: [] as string[],
  attachments: [] as AttachmentInfo[],
  remark: '',
  managerRemark: '',
})

const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const h = String(i + 6).padStart(2, '0')
  return { label: `${h}:00`, value: `${h}:00` }
})

// ========================
// 工具函数
// ========================
function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️'
  if (['pdf'].includes(ext)) return '📕'
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📗'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
  if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬'
  if (['mp3', 'wav', 'm4a'].includes(ext)) return '🎵'
  return '📄'
}

function getManagerName(id: string): string {
  const emp = store.allTimelineData.find((r) => r.empId === id)
  return emp?.empName || id
}

function formatDateShort(date: string): string {
  if (!date) return ''
  return dayjs(date).format('M/D')
}

function formatWeekday(date: string): string {
  if (!date) return ''
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `周${weekdays[dayjs(date).day()]}`
}

function getItemColor(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '#67C23A'
  return TRANSPORT_COLORS[item.category ?? 0]
}

function getItemIcon(item: DayLocationItem): string {
  if (item.placeType === 'hotel') return '🏨'
  return TRANSPORT_ICONS[item.category ?? 0]
}

function getTransportLabel(category?: number): string {
  if (category === undefined) return ''
  return TRANSPORT_LABELS[category as 0 | 1 | 2]
}

// ========================
// 按天分组
// ========================
const dayList = computed(() => {
  // 归一化:Date 对象或字符串都转成 'YYYY-MM-DD' 字符串,避免 6/4 被当成两个不同日期
  const toDateStr = (d: string | Date | undefined | null): string => {
    if (!d) return ''
    if (typeof d === 'string') return d
    return dayjs(d).format('YYYY-MM-DD')
  }

  // 优先按出差日期范围生成每一天;无范围则按 item 日期
  let dates: string[] = []
  const startStr = toDateStr(tripForm.value.startDate)
  const endStr = toDateStr(tripForm.value.endDate)
  if (startStr && endStr) {
    const start = dayjs(startStr)
    const end = dayjs(endStr)
    if (start.isValid() && end.isValid() && !start.isAfter(end)) {
      let cur = start
      while (cur.isBefore(end) || cur.isSame(end, 'day')) {
        dates.push(cur.format('YYYY-MM-DD'))
        cur = cur.add(1, 'day')
      }
    }
  }
  // 用 item 日期补全
  for (const item of tripList.value) {
    const d = toDateStr(item.date)
    if (d && !dates.includes(d)) dates.push(d)
  }
  dates.sort()

  return dates.map((date) => {
    const items = tripList.value.filter((i) => toDateStr(i.date) === date)
    return {
      date,
      hotels: items.filter((i) => i.placeType === 'hotel'),
      trips: items.filter((i) => i.placeType === 'travel'),
    }
  })
})

function getDayStatus(day: { hotels: DayLocationItem[]; trips: DayLocationItem[] }): 'ongoing' | 'upcoming' | 'finished' {
  const all = [...day.hotels, ...day.trips]
  if (all.length === 0) return 'upcoming'
  if (all.some((i) => i.status === 'ongoing')) return 'ongoing'
  if (all.every((i) => i.status === 'finished')) return 'finished'
  return 'upcoming'
}

// ========================
// 弹窗流程
// ========================
function openAddDialog(date?: string) {
  defaultDate.value = date || ''
  dialogStep.value = 'choice'
  dialogTitle.value = '选择添加类型'
  editingIndex.value = null
  dialogVisible.value = true
}

function openHotelDialog(date?: string, index?: number) {
  editingIndex.value = index !== undefined ? index : null
  if (index !== undefined && index < tripList.value.length) {
    const item = tripList.value[index]
    if (item.placeType === 'hotel') {
      hotelForm.value = {
        checkInDate: item.date,
        checkOutDate: item.endDate || item.date,
        city: item.placeName,
        hotelName: item.hotelName || '',
        roomType: item.roomType || '',
        managers: item.managers || [],
        attachments: item.attachments || [],
        remark: item.remark || '',
        managerRemark: item.managerRemark || '',
      }
    }
  } else {
    hotelForm.value = {
      checkInDate: date || defaultDate.value || '',
      checkOutDate: date || defaultDate.value || '',
      city: '',
      hotelName: '',
      roomType: '',
      managers: [],
      attachments: [],
      remark: '',
      managerRemark: '',
    }
  }
  dialogStep.value = 'hotel'
  dialogTitle.value = index !== undefined ? '编辑酒店' : '添加酒店'
  dialogVisible.value = true
}

function openTripDialog(date?: string, index?: number) {
  editingIndex.value = index !== undefined ? index : null
  if (index !== undefined && index < tripList.value.length) {
    const item = tripList.value[index]
    if (item.placeType === 'travel') {
      tripDetailForm.value = {
        startPlace: item.startPlace || '',
        endPlace: item.endPlace || '',
        transportType: item.category === 1 ? 'plane' : item.category === 2 ? 'car' : 'train',
        transportNo: item.transportNo || '',
        date: item.date,
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        managers: item.managers || [],
        attachments: item.attachments || [],
        remark: item.remark || '',
        managerRemark: item.managerRemark || '',
      }
    }
  } else {
    tripDetailForm.value = {
      startPlace: '',
      endPlace: '',
      transportType: 'train',
      transportNo: '',
      date: date || defaultDate.value || '',
      startTime: '',
      endTime: '',
      managers: [],
      attachments: [],
      remark: '',
      managerRemark: '',
    }
  }
  dialogStep.value = 'trip'
  dialogTitle.value = index !== undefined ? '编辑行程' : '添加行程'
  dialogVisible.value = true
}

function chooseType(type: 'hotel' | 'trip') {
  if (type === 'hotel') openHotelDialog()
  else openTripDialog()
}
function backToChoice() {
  dialogStep.value = 'choice'
  dialogTitle.value = '选择添加类型'
}
function closeDialog() {
  dialogVisible.value = false
  defaultDate.value = ''
}

// 模拟附件"上传" - 直接弹输入文件名
function promptAttachment() {
  ElMessageBox.prompt('请输入附件文件名', '添加附件', {
    confirmButtonText: '添加',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '文件名不能为空',
  })
    .then(({ value }) => {
      const name = value.trim()
      const att: AttachmentInfo = { name, icon: getFileIcon(name) }
      if (dialogStep.value === 'hotel') hotelForm.value.attachments.push(att)
      else tripDetailForm.value.attachments.push(att)
    })
    .catch(() => {})
}

function removeAttachment(target: 'hotel' | 'trip', index: number) {
  if (target === 'hotel') hotelForm.value.attachments.splice(index, 1)
  else tripDetailForm.value.attachments.splice(index, 1)
}

function saveHotel() {
  if (!hotelForm.value.checkInDate || !hotelForm.value.city) {
    ElMessage.warning('请填写入住日期和城市')
    return
  }
  const item: DayLocationItem = {
    date: hotelForm.value.checkInDate,
    endDate: hotelForm.value.checkOutDate || hotelForm.value.checkInDate,
    placeType: 'hotel',
    placeName: hotelForm.value.city,
    hotelName: hotelForm.value.hotelName,
    roomType: hotelForm.value.roomType,
    status: 'upcoming',
    startTime: '14:00',
    endTime: '12:00',
    managers: hotelForm.value.managers,
    attachments: hotelForm.value.attachments,
    remark: hotelForm.value.remark,
    managerRemark: hotelForm.value.managerRemark,
  }
  if (editingIndex.value !== null) tripList.value[editingIndex.value] = item
  else tripList.value.push(item)
  editingIndex.value = null
  closeDialog()
  ElMessage.success('已保存')
}

function saveTrip() {
  if (!tripDetailForm.value.date || !tripDetailForm.value.endPlace) {
    ElMessage.warning('请填写出行日期和目的地')
    return
  }
  const catMap: Record<string, 0 | 1 | 2> = { train: 0, plane: 1, car: 2 }
  const item: DayLocationItem = {
    date: tripDetailForm.value.date,
    placeType: 'travel',
    placeName: tripDetailForm.value.endPlace,
    startPlace: tripDetailForm.value.startPlace,
    endPlace: tripDetailForm.value.endPlace,
    category: catMap[tripDetailForm.value.transportType],
    transportNo: tripDetailForm.value.transportNo,
    status: 'upcoming',
    startTime: tripDetailForm.value.startTime,
    endTime: tripDetailForm.value.endTime,
    managers: tripDetailForm.value.managers,
    attachments: tripDetailForm.value.attachments,
    remark: tripDetailForm.value.remark,
    managerRemark: tripDetailForm.value.managerRemark,
  }
  if (editingIndex.value !== null) tripList.value[editingIndex.value] = item
  else tripList.value.push(item)
  editingIndex.value = null
  closeDialog()
  ElMessage.success('已保存')
}

function editItem(index: number) {
  const item = tripList.value[index]
  if (item.placeType === 'hotel') openHotelDialog(undefined, index)
  else openTripDialog(undefined, index)
}

// 每日快速添加
function quickAddHotel(date: string) {
  openHotelDialog(date)
}
function quickAddTrip(date: string) {
  openTripDialog(date)
}

// 引入 ElMessageBox(避免 unused 警告,实际由 element-plus 全局注册)
import { ElMessageBox } from 'element-plus'
</script>

<template>
  <div class="add-trip-container">
    <!-- ========== 顶部:出差基本信息 ========== -->
    <el-card class="info-card" shadow="never">
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
          <span class="info-label">出差日期</span>
          <span class="info-value">
            <span v-if="tripForm.startDate && tripForm.endDate">
              {{ tripForm.startDate }} ~ {{ tripForm.endDate }}
            </span>
            <span v-else class="empty-hint">点击"编辑"补充</span>
          </span>
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
        <div v-if="tripForm.managers.length > 0" class="info-row">
          <span class="info-label">出差负责人</span>
          <span class="info-value">
            <div class="manager-avatars static">
              <el-avatar
                v-for="mid in tripForm.managers"
                :key="mid"
                :size="24"
                class="manager-avatar"
              >{{ getManagerName(mid).charAt(0) }}</el-avatar>
              <span class="manager-names">{{ tripForm.managers.map(getManagerName).join('、') }}</span>
            </div>
          </span>
        </div>
      </div>

      <el-form v-else label-width="90px" label-position="left" class="trip-form">
        <el-form-item label="员工姓名">
          <el-input v-model="tripForm.empName" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="tripForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="出差日期">
          <el-date-picker
            v-model="tripForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="出发日"
            style="flex: 1"
          />
          <span style="margin: 0 8px">~</span>
          <el-date-picker
            v-model="tripForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="到达日"
            style="flex: 1"
          />
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
        <el-form-item label="负责人">
          <el-select v-model="tripForm.managers" multiple placeholder="可多选" style="width: 100%">
            <el-option v-for="emp in store.allTimelineData" :key="emp.empId" :label="emp.empName" :value="emp.empId" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== 行程安排明细:三栏布局 ========== -->
    <el-card class="timeline-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>🗓 行程安排明细</span>
          <div class="actions">
            <el-button
              v-if="dayList.length > 0"
              text
              size="small"
              class="timeline-edit-btn"
              @click="editAllTrips"
            >
              <span class="btn-icon">{{ editMode ? '✕' : '✏️' }}</span>
              <span>{{ editMode ? '完成' : '编辑' }}</span>
            </el-button>
            <el-button type="primary" size="small" @click="openAddDialog()">
              + 添加行程
            </el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="dayList.length === 0" description="暂无行程明细,请先填写出差日期后添加" />

      <div v-else class="three-col-grid">
        <!-- 表头 -->
        <div class="grid-header">
          <div class="col-hotel-header">🏨 酒店</div>
          <div class="col-date-header">📅 日期</div>
          <div class="col-trip-header">✈ 行程</div>
        </div>

        <!-- 每天一行 -->
        <div v-for="(day, idx) in dayList" :key="day.date" class="day-row" :class="`row-status-${getDayStatus(day)}`">
          <!-- 左:酒店 -->
          <div class="col-hotel">
            <template v-if="day.hotels.length > 0">
              <div
                v-for="(hotel, hi) in day.hotels"
                :key="`h-${day.date}-${hi}`"
                class="card hotel-card"
                :class="{ 'is-editable': editMode }"
              >
                <div class="card-title hotel-title">
                  <span class="title-bar" style="background: #67C23A"></span>
                  <span class="title-text">{{ hotel.placeName }} · {{ hotel.hotelName }}</span>
                </div>
                <div v-if="hotel.roomType" class="card-sub">
                  <span class="sub-icon">🛏</span> {{ hotel.roomType }}
                </div>
                <div class="card-sub">
                  <span class="sub-icon">🕐</span>
                  {{ formatDateShort(hotel.date) }} 入住
                  <template v-if="hotel.endDate && hotel.endDate !== hotel.date">
                    <span class="separator">·</span>
                    {{ formatDateShort(hotel.endDate) }} 离开
                  </template>
                </div>

                <div v-if="hotel.managers && hotel.managers.length > 0" class="card-section">
                  <span class="section-label">👤 负责人</span>
                  <div class="manager-avatars">
                    <el-avatar
                      v-for="mid in hotel.managers.slice(0, 3)"
                      :key="mid"
                      :size="22"
                      class="manager-avatar"
                    >{{ getManagerName(mid).charAt(0) }}</el-avatar>
                    <el-avatar v-if="hotel.managers.length > 3" :size="22" class="manager-avatar more">
                      +{{ hotel.managers.length - 3 }}
                    </el-avatar>
                    <span class="manager-names">{{ hotel.managers.map(getManagerName).join('、') }}</span>
                  </div>
                </div>

                <div v-if="hotel.attachments && hotel.attachments.length > 0" class="card-section">
                  <span class="section-label">📎 附件</span>
                  <div class="attachment-list">
                    <div v-for="(att, ai) in hotel.attachments" :key="ai" class="attachment-item">
                      <span class="att-icon">{{ att.icon || getFileIcon(att.name) }}</span>
                      <span class="att-name">{{ att.name }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="hotel.remark" class="card-remark">
                  <span class="remark-tag trip-remark-tag">出差备注</span>
                  <span class="remark-text">{{ hotel.remark }}</span>
                </div>
                <div v-if="hotel.managerRemark" class="card-remark">
                  <span class="remark-tag manager-remark-tag">负责人备注</span>
                  <span class="remark-text">{{ hotel.managerRemark }}</span>
                </div>

                <div v-if="editMode" class="card-actions">
                  <el-button size="small" link @click.stop="editItem(tripList.indexOf(hotel))">编辑</el-button>
                  <el-button size="small" link type="danger" @click.stop="deleteItem(tripList.indexOf(hotel))">删除</el-button>
                </div>
              </div>
            </template>
            <div v-else class="empty-cell">
              <el-button v-if="editMode" size="small" plain @click="quickAddHotel(day.date)">+ 酒店</el-button>
            </div>
          </div>

          <!-- 中:日期骨架 -->
          <div class="col-date">
            <div class="date-bubble" :class="`status-${getDayStatus(day)}`">
              <div class="date-main">{{ formatDateShort(day.date) }}</div>
              <div class="date-week">{{ formatWeekday(day.date) }}</div>
              <div class="date-status">
                <span class="status-dot" :class="`dot-${getDayStatus(day)}`"></span>
                {{ TRIP_STATUS_LABELS[getDayStatus(day)] }}
              </div>
              <div class="date-progress">Day {{ idx + 1 }} / {{ dayList.length }}</div>
            </div>
            <div v-if="editMode" class="date-add-btns">
              <el-button size="small" plain @click.stop="quickAddHotel(day.date)">+ 酒店</el-button>
              <el-button size="small" plain @click.stop="quickAddTrip(day.date)">+ 行程</el-button>
            </div>
          </div>

          <!-- 右:行程 -->
          <div class="col-trip">
            <template v-if="day.trips.length > 0">
              <div
                v-for="(trip, ti) in day.trips"
                :key="`t-${day.date}-${ti}`"
                class="card trip-card"
                :class="{ 'is-editable': editMode }"
                :style="{ borderLeftColor: getItemColor(trip) }"
              >
                <div class="card-title trip-title">
                  <span class="trip-icon">{{ getItemIcon(trip) }}</span>
                  <span class="trip-time" v-if="trip.startTime || trip.endTime">
                    {{ trip.startTime || '--:--' }} <span class="arrow">→</span> {{ trip.endTime || '--:--' }}
                  </span>
                  <span v-else class="trip-time placeholder">待定</span>
                </div>
                <div class="trip-route">
                  <span class="route-from">{{ trip.startPlace || '?' }}</span>
                  <span class="route-arrow">→</span>
                  <span class="route-to">{{ trip.endPlace || '?' }}</span>
                </div>
                <div v-if="trip.category !== undefined || trip.transportNo" class="card-sub">
                  <span v-if="trip.category !== undefined" class="transport-label" :style="{ color: getItemColor(trip) }">
                    {{ getTransportLabel(trip.category) }}
                  </span>
                  <span v-if="trip.transportNo" class="transport-no">{{ trip.transportNo }}</span>
                </div>

                <div v-if="trip.managers && trip.managers.length > 0" class="card-section">
                  <span class="section-label">👤 负责人</span>
                  <div class="manager-avatars">
                    <el-avatar
                      v-for="mid in trip.managers.slice(0, 3)"
                      :key="mid"
                      :size="22"
                      class="manager-avatar"
                    >{{ getManagerName(mid).charAt(0) }}</el-avatar>
                    <el-avatar v-if="trip.managers.length > 3" :size="22" class="manager-avatar more">
                      +{{ trip.managers.length - 3 }}
                    </el-avatar>
                    <span class="manager-names">{{ trip.managers.map(getManagerName).join('、') }}</span>
                  </div>
                </div>

                <div v-if="trip.attachments && trip.attachments.length > 0" class="card-section">
                  <span class="section-label">📎 附件</span>
                  <div class="attachment-list">
                    <div v-for="(att, ai) in trip.attachments" :key="ai" class="attachment-item">
                      <span class="att-icon">{{ att.icon || getFileIcon(att.name) }}</span>
                      <span class="att-name">{{ att.name }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="trip.remark" class="card-remark">
                  <span class="remark-tag trip-remark-tag">出差备注</span>
                  <span class="remark-text">{{ trip.remark }}</span>
                </div>
                <div v-if="trip.managerRemark" class="card-remark">
                  <span class="remark-tag manager-remark-tag">负责人备注</span>
                  <span class="remark-text">{{ trip.managerRemark }}</span>
                </div>

                <div v-if="editMode" class="card-actions">
                  <el-button size="small" link @click.stop="editItem(tripList.indexOf(trip))">编辑</el-button>
                  <el-button size="small" link type="danger" @click.stop="deleteItem(tripList.indexOf(trip))">删除</el-button>
                </div>
              </div>
            </template>
            <div v-else class="empty-cell">
              <el-button v-if="editMode" size="small" plain @click="quickAddTrip(day.date)">+ 行程</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ========== 合并弹窗 ========== -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      class="sync-dialog"
      @close="defaultDate = ''"
    >
      <!-- Step 1: 选择类型 -->
      <div v-if="dialogStep === 'choice'" class="type-choice">
        <div class="type-card" @click="chooseType('hotel')">
          <span class="type-icon">🏨</span>
          <span class="type-label">添加酒店</span>
          <span class="type-desc">录入入住酒店信息</span>
        </div>
        <div class="type-card" @click="chooseType('trip')">
          <span class="type-icon">✈️</span>
          <span class="type-label">添加行程</span>
          <span class="type-desc">录入交通出行信息</span>
        </div>
      </div>

      <!-- Step 2: 酒店表单 -->
      <el-form v-else-if="dialogStep === 'hotel'" label-width="90px" label-position="left" class="dialog-form">
        <el-form-item label="入住日" required>
          <el-date-picker v-model="hotelForm.checkInDate" type="date" value-format="YYYY-MM-DD" placeholder="选择入住日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="离开日">
          <el-date-picker v-model="hotelForm.checkOutDate" type="date" value-format="YYYY-MM-DD" placeholder="选择离开日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入住城市" required>
          <el-input v-model="hotelForm.city" placeholder="请输入入住城市" />
        </el-form-item>
        <el-form-item label="酒店名">
          <el-input v-model="hotelForm.hotelName" placeholder="请输入酒店名称" />
        </el-form-item>
        <el-form-item label="房型">
          <el-input v-model="hotelForm.roomType" placeholder="如:大床房·含早" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="hotelForm.managers" multiple placeholder="可多选" style="width: 100%">
            <el-option v-for="emp in store.allTimelineData" :key="emp.empId" :label="emp.empName" :value="emp.empId" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <div class="attachment-edit">
            <div v-for="(att, i) in hotelForm.attachments" :key="i" class="att-edit-item">
              <span class="att-icon">{{ att.icon || getFileIcon(att.name) }}</span>
              <span class="att-name">{{ att.name }}</span>
              <el-button link size="small" type="danger" @click="removeAttachment('hotel', i)">×</el-button>
            </div>
            <el-button size="small" plain @click="promptAttachment">+ 添加附件</el-button>
          </div>
        </el-form-item>
        <el-form-item label="出差备注">
          <el-input v-model="hotelForm.remark" type="textarea" :rows="2" placeholder="给到出差人员的备注" />
        </el-form-item>
        <el-form-item label="负责人备注">
          <el-input v-model="hotelForm.managerRemark" type="textarea" :rows="2" placeholder="负责人特别说明" />
        </el-form-item>
      </el-form>

      <!-- Step 3: 行程表单 -->
      <el-form v-else-if="dialogStep === 'trip'" label-width="90px" label-position="left" class="dialog-form">
        <el-form-item label="出行日期" required>
          <el-date-picker v-model="tripDetailForm.date" type="date" value-format="YYYY-MM-DD" placeholder="选择出行日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出发地" required>
          <el-input v-model="tripDetailForm.startPlace" placeholder="请输入出发地" />
        </el-form-item>
        <el-form-item label="目的地" required>
          <el-input v-model="tripDetailForm.endPlace" placeholder="请输入目的地" />
        </el-form-item>
        <el-form-item label="交通方式">
          <el-radio-group v-model="tripDetailForm.transportType">
            <el-radio-button value="train">🚄 高铁</el-radio-button>
            <el-radio-button value="plane">✈ 飞机</el-radio-button>
            <el-radio-button value="car">🚗 汽车</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班次/航班">
          <el-input v-model="tripDetailForm.transportNo" placeholder="如:G7503 / CZ3567" />
        </el-form-item>
        <el-form-item label="出发时间">
          <el-time-select
            v-model="tripDetailForm.startTime"
            start="06:00"
            step="01:00"
            end="22:00"
            placeholder="出发时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="到达时间">
          <el-time-select
            v-model="tripDetailForm.endTime"
            start="06:00"
            step="01:00"
            end="23:00"
            placeholder="到达时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="tripDetailForm.managers" multiple placeholder="可多选" style="width: 100%">
            <el-option v-for="emp in store.allTimelineData" :key="emp.empId" :label="emp.empName" :value="emp.empId" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <div class="attachment-edit">
            <div v-for="(att, i) in tripDetailForm.attachments" :key="i" class="att-edit-item">
              <span class="att-icon">{{ att.icon || getFileIcon(att.name) }}</span>
              <span class="att-name">{{ att.name }}</span>
              <el-button link size="small" type="danger" @click="removeAttachment('trip', i)">×</el-button>
            </div>
            <el-button size="small" plain @click="promptAttachment">+ 添加附件</el-button>
          </div>
        </el-form-item>
        <el-form-item label="出差备注">
          <el-input v-model="tripDetailForm.remark" type="textarea" :rows="2" placeholder="给到出差人员的备注" />
        </el-form-item>
        <el-form-item label="负责人备注">
          <el-input v-model="tripDetailForm.managerRemark" type="textarea" :rows="2" placeholder="负责人特别说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="dialogStep !== 'choice'" @click="backToChoice">上一步</el-button>
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            v-if="dialogStep === 'hotel'"
            type="primary"
            @click="saveHotel"
          >保存</el-button>
          <el-button
            v-if="dialogStep === 'trip'"
            type="primary"
            @click="saveTrip"
          >保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.add-trip-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== 顶部:出差基本信息 ========== */
.info-card {
  border-radius: 8px;
}
.info-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.iterate-btn {
  padding: 4px;
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

.info-display {
  display: flex;
  flex-direction: column;
}
.info-row {
  display: flex;
  align-items: center;
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
.empty-hint {
  color: #c0c4cc;
  font-style: italic;
}
.trip-form {
  display: flex;
  flex-direction: column;
}
.trip-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

/* ========== 三栏布局 ========== */
.timeline-card {
  border-radius: 8px;
}
.timeline-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.timeline-card .actions {
  display: flex;
  gap: 8px;
}
.timeline-edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgb(130, 189, 164);
  font-size: 12px;
}

.three-col-grid {
  display: grid;
  grid-template-columns: 320px 140px 1fr;
  gap: 0;
}

.grid-header {
  display: contents;
}
.col-hotel-header,
.col-date-header,
.col-trip-header {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  background: #fafafa;
  border-bottom: 2px solid #e5e6eb;
}
.col-hotel-header {
  border-top-left-radius: 6px;
}
.col-trip-header {
  border-top-right-radius: 6px;
  text-align: left;
}

.day-row {
  display: contents;
}
.day-row .col-hotel,
.day-row .col-date,
.day-row .col-trip {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 120px;
  position: relative;
}

.col-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fafbfc;
}

/* 日期气泡 */
.date-bubble {
  width: 100%;
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e6eb;
  transition: all 0.2s;
}
.date-bubble.status-ongoing {
  border-color: #67c23a;
  background: linear-gradient(180deg, #f0f9eb 0%, #fff 100%);
}
.date-bubble.status-finished {
  border-color: #dcdfe6;
  background: #f5f7fa;
  opacity: 0.85;
}
.date-main {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}
.date-week {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
.date-status {
  font-size: 12px;
  color: #606266;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.dot-ongoing { background: #67c23a; }
.dot-upcoming { background: #e6a23c; }
.dot-finished { background: #c0c4cc; }
.date-progress {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  font-family: monospace;
}
.date-add-btns {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.date-add-btns :deep(.el-button) {
  margin-left: 0;
  width: 100%;
}

.empty-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  border: 1px dashed #e5e6eb;
  border-radius: 6px;
  background: #fafbfc;
}

/* ========== 卡片通用样式 ========== */
.card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s;
  position: relative;
}
.card:last-child {
  margin-bottom: 0;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-color: #c0c4cc;
}
.card.is-editable {
  cursor: pointer;
}
.card.is-editable:hover {
  border-color: rgb(130, 189, 164);
}

.hotel-card {
  border-left: 4px solid #67c23a;
}
.trip-card {
  border-left: 4px solid #409eff;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.title-bar {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
}
.title-text {
  flex: 1;
}
.hotel-title {
  color: #67c23a;
}
.card-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
  line-height: 1.5;
}
.sub-icon {
  flex-shrink: 0;
  opacity: 0.7;
}
.separator {
  margin: 0 4px;
  color: #c0c4cc;
}

/* 行程卡专属 */
.trip-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.trip-time {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  font-family: monospace;
}
.trip-time.placeholder {
  color: #c0c4cc;
  font-style: italic;
}
.arrow {
  color: #c0c4cc;
  margin: 0 2px;
}
.trip-route {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #303133;
  margin: 6px 0;
  font-weight: 500;
}
.route-arrow {
  color: rgb(130, 189, 164);
  font-weight: bold;
}
.route-from, .route-to {
  flex: 0 0 auto;  /* 不撑开,保持左侧自然排列 */
  white-space: nowrap;
}
.route-arrow {
  margin: 0 4px;
  flex-shrink: 0;
}
.transport-label {
  font-size: 12px;
  font-weight: 600;
}
.transport-no {
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 6px;
  color: #303133;
}

/* 段落 */
.card-section {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  font-size: 12px;
}
.section-label {
  color: #909399;
  font-size: 11px;
  flex-shrink: 0;
  padding-top: 1px;
}

/* 负责人头像组 */
.manager-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.manager-avatars.static {
  display: inline-flex;
}
.manager-avatar {
  background: rgb(130, 189, 164);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}
.manager-avatar.more {
  background: #c0c4cc;
}
.manager-names {
  font-size: 12px;
  color: #303133;
  margin-left: 4px;
}

/* 附件列表 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.attachment-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  padding: 2px 0;
}
.att-icon {
  flex-shrink: 0;
  font-size: 13px;
}
.att-name {
  flex: 1;
  word-break: break-all;
}

/* 备注 */
.card-remark {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}
.remark-tag {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1px;
}
.trip-remark-tag {
  background: #ecf5ff;
  color: #409eff;
}
.manager-remark-tag {
  background: #fdf6ec;
  color: #e6a23c;
}
.remark-text {
  color: #303133;
  flex: 1;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed #f0f0f0;
}

/* ========== 弹窗 ========== */
.sync-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}
.type-choice {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px 0;
}
.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 2px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.type-card:hover {
  border-color: rgb(130, 189, 164);
  background: #f0f9eb;
  transform: translateY(-2px);
}
.type-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.type-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.type-desc {
  font-size: 12px;
  color: #909399;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.attachment-edit {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.att-edit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}
.att-edit-item .att-name {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
