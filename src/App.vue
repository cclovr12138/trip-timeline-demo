<script setup lang="ts">
import { useTripStore } from '@/stores/trip'
import TimelineView from '@/components/timeline/TimelineView.vue'
import FilterPanel from '@/components/filters/FilterPanel.vue'

const store = useTripStore()
</script>

<template>
  <div class="app-container">
    <main class="app-main">
      <!-- 统计卡片 -->
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

      <!-- 筛选面板 -->
      <FilterPanel :departments="store.departmentList" />

      <!-- 时间轴视图 -->
      <TimelineView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background: rgb(243, 243, 253);
  color: #303133;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 24px;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
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
</style>