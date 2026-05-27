<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '@/stores/trip'

const store = useTripStore()

// 出差基本信息
const tripForm = ref({
  empName: '',
  email: '',
  startDate: '',
  endDate: '',
  startPlace: '',
  endPlace: '',
  purpose: '',
  managers: [] as string[],
})

// 弹窗控制
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

const transportOptions = [
  { value: 'train', label: '高铁' },
  { value: 'plane', label: '飞机' },
  { value: 'car', label: '汽车' },
]

const timeSlots = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00',
  '12:00-14:00', '14:00-16:00', '16:00-18:00',
  '18:00-20:00', '20:00-22:00',
]

function openHotelDialog() {
  hotelDialogVisible.value = true
}

function openTripDialog() {
  tripDialogVisible.value = true
}

function saveHotel() {
  console.log('保存酒店:', hotelForm.value)
  hotelDialogVisible.value = false
  // reset
  hotelForm.value = { checkInDate: '', checkOutDate: '', city: '', hotelName: '', attachment: '', remark: '' }
}

function saveTrip() {
  console.log('保存行程:', tripDetailForm.value)
  tripDialogVisible.value = false
  // reset
  tripDetailForm.value = { startPlace: '', endPlace: '', transportType: 'train', transportNo: '', date: '', startTime: '', endTime: '', attachment: '', remark: '' }
}
</script>

<template>
  <div class="add-trip-container">
    <div class="page-header">
      <h2 class="page-title">添加行程</h2>
    </div>

    <div class="add-trip-layout">
      <!-- 左侧：出差基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">📋 出差基本信息</div>
        </template>

        <el-form label-width="100px" label-position="left" class="trip-form">
          <el-form-item label="员工姓名">
            <el-input v-model="tripForm.empName" placeholder="请输入员工姓名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="tripForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="出发日">
            <el-date-picker
              v-model="tripForm.startDate"
              type="date"
              placeholder="选择出发日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="到达日">
            <el-date-picker
              v-model="tripForm.endDate"
              type="date"
              placeholder="选择到达日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="出发地">
            <el-input v-model="tripForm.startPlace" placeholder="请输入出发地" />
          </el-form-item>
          <el-form-item label="目的地">
            <el-input v-model="tripForm.endPlace" placeholder="请输入目的地" />
          </el-form-item>
          <el-form-item label="出差目的">
            <el-input v-model="tripForm.purpose" type="textarea" placeholder="请输入出差目的" :rows="3" />
          </el-form-item>
          <el-form-item label="出差负责人">
            <el-select v-model="tripForm.managers" multiple placeholder="请选择负责人" style="width: 100%">
              <el-option
                v-for="emp in store.allTimelineData"
                :key="emp.empId"
                :label="emp.empName"
                :value="emp.empId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 右侧：酒店+行程按钮 -->
      <div class="action-section">
        <el-card class="action-card" shadow="never">
          <template #header>
            <div class="card-header">🗂 信息附件</div>
          </template>

          <div class="action-buttons">
            <el-button type="primary" plain class="action-btn" @click="openHotelDialog">
              <span class="btn-icon">🏨</span>
              <span class="btn-text">添加酒店信息</span>
            </el-button>
            <el-button type="primary" plain class="action-btn" @click="openTripDialog">
              <span class="btn-icon">✈</span>
              <span class="btn-text">添加行程信息</span>
            </el-button>
          </div>

          <div class="action-hint">
            点击上方按钮，为本次出差添加酒店住宿或出行行程信息
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
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            class="upload-item"
          >
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
          <el-select v-model="tripDetailForm.startTime" placeholder="选择开始时间" style="width: 48%">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot.split('-')[0]" />
          </el-select>
          <span class="time-separator">至</span>
          <el-select v-model="tripDetailForm.endTime" placeholder="选择结束时间" style="width: 48%">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot.split('-')[1]" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="1" class="upload-item">
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

.info-card {
  flex: 1;
  border-radius: 8px;
  border: 1px solid #E5E6EB;
}

.action-section {
  width: 280px;
  flex-shrink: 0;
}

.action-card {
  border-radius: 8px;
  border: 1px solid #E5E6EB;
}

.card-header {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.trip-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 信息附件 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border-radius: 8px;
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  font-weight: 500;
}

.action-hint {
  font-size: 11px;
  color: #909399;
  text-align: center;
  line-height: 1.5;
}

/* 弹窗表单 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transport-group {
  display: flex;
  gap: 16px;
}

.time-separator {
  width: 20px;
  text-align: center;
  color: #909399;
  line-height: 32px;
}

.upload-item {
  display: inline-block;
}
</style>