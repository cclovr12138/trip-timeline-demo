<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="app-main">
      <RouterView />
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

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-width: 0;
}
</style>