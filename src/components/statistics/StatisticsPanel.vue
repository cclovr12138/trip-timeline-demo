<script setup lang="ts">
import { computed } from 'vue'
import type { Statistics } from '@/types'

interface Props {
  statistics: Statistics
}

const props = defineProps<Props>()

const stats = computed(() => [
  { key: 'today', label: '今日出差', value: props.statistics.todayTripCount, color: '#1677FF' },
  { key: 'week', label: '本周出差', value: props.statistics.weekTripCount, color: '#52C41A' },
  { key: 'returning', label: '即将返程', value: props.statistics.returningCount, color: '#FAAD14' },
  { key: 'overseas', label: '海外出差', value: props.statistics.overseasCount, color: '#722ED1' },
  { key: 'conflict', label: '行程冲突', value: props.statistics.conflictCount, color: '#FF4D4F' },
])
</script>

<template>
  <div class="statistics-panel">
    <div
      v-for="stat in stats"
      :key="stat.key"
      class="stat-item"
    >
      <div
        class="stat-icon"
        :style="{ backgroundColor: stat.color + '15', color: stat.color }"
      >
        <svg v-if="stat.key === 'today'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>
        </svg>
        <svg v-else-if="stat.key === 'week'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <svg v-else-if="stat.key === 'returning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <svg v-else-if="stat.key === 'overseas'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <path d="M12 9v4M12 17h.01"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-panel {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: default;
}

.stat-item:hover {
  background: var(--color-bg-hover);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>