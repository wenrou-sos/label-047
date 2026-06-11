<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import AppHeader from './AppHeader.vue'

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-slate-950">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />
      <main class="flex-1 p-6 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
