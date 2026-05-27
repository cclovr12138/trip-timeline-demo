<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)

const menuItems = [
  { key: 'dashboard', label: '仪表盘', path: '/', icon: '📊' },
  { key: 'add-trip', label: '添加行程', path: '/add-trip', icon: '✏️' },
]

function isActive(path: string) {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <span class="logo-icon">🐴</span>
        <span v-if="!collapsed" class="logo-text">出差管理</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="collapse-btn" @click="collapsed = !collapsed">
        <span>{{ collapsed ? '→' : '←' }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background: #304156;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 56px;
}

.sidebar-header {
  padding: 16px 12px;
  border-bottom: 1px solid #1f2d3d;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.logo-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  color: #bfcbd9;
  font-size: 13px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: #fff;
  background: #263445;
}

.nav-item.active {
  color: #fff;
  background: rgb(103, 194, 58);
}

.nav-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #1f2d3d;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bfcbd9;
  font-size: 12px;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  color: #fff;
  background: #263445;
}
</style>