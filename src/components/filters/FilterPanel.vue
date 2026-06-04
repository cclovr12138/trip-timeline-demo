<script setup lang="ts">
import { ref } from 'vue'
import type { FilterParams, Department } from '@/types'
import { useTripStore } from '@/stores/trip'
import dayjs from 'dayjs'

interface Props {
  departments: Department[]
}

const props = defineProps<Props>()
const store = useTripStore()

const localFilters = ref<FilterParams>({
  deptName: undefined,
  empName: undefined,
  city: undefined,
  tripType: 'all',
  status: 'all',
  dateRange: null,
})

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' },
]

// 日期范围快捷选项
const shortcuts = [
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [start, end]
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [start, end]
    },
  },
  {
    text: '最近3个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    },
  },
  {
    text: '最近半年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    },
  },
]

// 日期范围校验：不能超过1年
function handleDateRangeChange(val: [Date, Date] | null) {
  if (val) {
    const [start, end] = val
    const days = dayjs(end).diff(dayjs(start), 'day')
    if (days > 365) {
      // 超过1年，自动截断到1年
      const clampedEnd = dayjs(start).add(365, 'day').toDate()
      localFilters.value.dateRange = [start, clampedEnd]
    }
  }
}

function hasActiveFilters() {
  const f = store.filterParams
  return f.empName || f.city || f.status !== 'all' || f.dateRange
}

function applyFilters() {
  store.updateFilter(localFilters.value)
}

function resetFilters() {
  localFilters.value = {
    deptName: undefined,
    empName: undefined,
    city: undefined,
    tripType: 'all',
    status: 'all',
    dateRange: null,
  }
  store.resetFilter()
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-row">
      <!-- 员工搜索 -->
      <div class="filter-item">
        <el-input
          v-model="localFilters.empName"
          placeholder="搜索员工"
          clearable
          @keyup.enter="applyFilters"
          @clear="applyFilters"
        />
      </div>

      <!-- 城市搜索 -->
      <div class="filter-item">
        <el-input
          v-model="localFilters.city"
          placeholder="目的地"
          clearable
          @keyup.enter="applyFilters"
          @clear="applyFilters"
        />
      </div>

      <!-- 状态筛选 -->
      <div class="filter-item">
        <el-select
          v-model="localFilters.status"
          placeholder="状态"
          @change="applyFilters"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 时间范围筛选 -->
      <div class="filter-item">
        <el-date-picker
          v-model="localFilters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="shortcuts"
          :clearable="true"
          value-format="YYYY-MM-DD"
          @change="handleDateRangeChange"
          @clear="applyFilters"
        />
      </div>

      <!-- 重置按钮 -->
      <div class="filter-actions">
        <el-button
          v-if="hasActiveFilters()"
          type="primary"
          size="small"
          @click="resetFilters"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 12px 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E6EB;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 120px;
  flex: 1;
}

.filter-actions {
  flex-shrink: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-input__wrapper:focus),
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgb(130, 189, 164) inset;
}

:deep(.el-select__wrapper) {
  border-radius: 4px;
}

:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgb(130, 189, 164) inset;
}

:deep(.el-button--primary) {
  --el-button-bg-color: rgb(130, 189, 164);
  --el-button-border-color: rgb(130, 189, 164);
  --el-button-hover-bg-color: rgb(110, 169, 144);
  --el-button-hover-border-color: rgb(110, 169, 144);
}
</style>