<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineRow as TimelineRowType, TripItem } from '@/types'
import { getDateOffset } from '@/utils/date'

interface Props {
  row: TimelineRowType
  dates: string[]
  rangeStart: string
  dayWidth: number
  rowHeight: number
  hoveredEmpId: string | null
}

const props = defineProps<Props>()

const visibleTrips = computed(() => {
  const rangeStartDate = new Date(props.rangeStart)
  const rangeEndDate = new Date(props.dates[props.dates.length - 1])
  
  return props.row.trips
    .filter(trip => {
      const tripStart = new Date(trip.startTime)
      const tripEnd = new Date(trip.endTime)
      return tripEnd >= rangeStartDate && tripStart <= rangeEndDate
    })
    .map(trip => {
      const tripStart = new Date(trip.startTime)
      const tripEnd = new Date(trip.endTime)
      const rangeStartDate = new Date(props.rangeStart)
      
      const startOffset = Math.max(0, getDateOffset(tripStart, rangeStartDate))
      const endOffset = Math.min(props.dates.length - 1, getDateOffset(tripEnd, rangeStartDate))
      const duration = endOffset - startOffset + 1
      
      return {
        trip,
        left: startOffset * props.dayWidth,
        width: Math.max(duration * props.dayWidth - 4, props.dayWidth),
      }
    })
})

function getTripColor(trip: TripItem): string {
  if (trip.status === 'ongoing') return '#67C23A'
  if (trip.status === 'upcoming') return '#E6A23C'
  return '#909399'
}

function getTripBgColor(trip: TripItem): string {
  return getTripColor(trip) + '15'
}

const emit = defineEmits<{
  (e: 'trip-hover', trip: TripItem, event: MouseEvent): void
  (e: 'trip-leave'): void
}>()

function handleMouseEnter(trip: TripItem, event: MouseEvent) {
  emit('trip-hover', trip, event)
}

function handleMouseLeave() {
  emit('trip-leave')
}
</script>

<template>
  <div class="timeline-row" :class="{ 'is-hovered': row.empId === hoveredEmpId }" :style="{ height: rowHeight + 'px' }">
    <div
      v-for="item in visibleTrips"
      :key="item.trip.id"
      class="trip-block"
      :style="{
        left: item.left + 'px',
        width: item.width + 'px',
        backgroundColor: getTripBgColor(item.trip),
        borderColor: getTripColor(item.trip),
      }"
      @mouseenter="(e) => handleMouseEnter(item.trip, e)"
      @mouseleave="handleMouseLeave"
    >
      <span class="city" :style="{ color: getTripColor(item.trip) }">{{ item.trip.city }}</span>
    </div>
  </div>
</template>

<style scoped>
.timeline-row {
  display: flex;
  height: 40px;
  border-bottom: 1px solid #EBEEF5;
  position: relative;
  transition: background 0.15s ease;
  box-sizing: border-box;
}

.timeline-row:hover {
  background: #FAFCFF;
}

.trip-block {
  position: absolute;
  top: 50%;
  height: 28px;
  border-radius: 4px;
  border: 1px solid;
  display: flex;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  z-index: 1;
  transform: translateY(-50%);
  box-sizing: border-box;
}

.trip-block:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.city {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>