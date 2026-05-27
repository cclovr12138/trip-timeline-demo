<script setup lang="ts">
import { computed } from 'vue'
import { isToday, isWeekend, getChineseWeekday } from '@/utils/date'

interface Props {
  dates: string[]
  dayWidth: number
}

const props = defineProps<Props>()

// 计算月份标题
const monthTitle = computed(() => {
  if (props.dates.length === 0) return ''
  const first = new Date(props.dates[0])
  const last = new Date(props.dates[props.dates.length - 1])
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return `${first.getMonth() + 1}月 - ${months[last.getMonth()]} ${last.getFullYear()}年`
})

const headerCells = computed(() => {
  return props.dates.map((date) => {
    const d = new Date(date)
    return {
      date,
      dayLabel: getChineseWeekday(date).replace('周', ''),
      dayNum: d.getDate(),
      isToday: isToday(date),
      isWeekend: isWeekend(date),
    }
  })
})
</script>

<template>
  <div class="timeline-header">
    <!-- 左侧人员列（固定） -->
    <div class="employee-col">
      <span class="employee-title">员工</span>
    </div>
    
    <!-- 右侧日期头（滚动） -->
    <div class="header-right">
      <div
        v-for="cell in headerCells"
        :key="cell.date"
        class="header-cell"
        :class="{
          'is-today': cell.isToday,
          'is-weekend': cell.isWeekend,
        }"
        :style="{ width: `${dayWidth}px` }"
      >
        <span class="day-label">{{ cell.dayLabel }}</span>
        <span class="day-num">{{ cell.dayNum }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-header {
  display: flex;
  background: #F5F7FA;
  border-bottom: 1px solid #E5E6EB;
}

.employee-col {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: white;
  border-right: 1px solid #E5E6EB;
  position: sticky;
  left: 0;
  z-index: 20;
  box-sizing: border-box;
}

.employee-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.header-right {
  display: flex;
  flex: 1;
  overflow-x: auto;
}

.header-right::-webkit-scrollbar {
  display: none;
}

.header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-right: 1px solid #EBEEF5;
  transition: background 0.15s ease;
}

.header-cell.is-today {
  background: rgba(64, 158, 255, 0.08);
}

.header-cell.is-today .day-num {
  background: #409EFF;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.header-cell.is-weekend {
  background: #F9FAFB;
}

.header-cell.is-weekend .day-label {
  color: #909399;
}

.day-label {
  font-size: 10px;
  color: #909399;
  margin-bottom: 2px;
}

.day-num {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>