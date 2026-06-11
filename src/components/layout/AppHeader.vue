<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell, User } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payment'
import { useRepairStore } from '@/stores/repair'

const route = useRoute()
const paymentStore = usePaymentStore()
const repairStore = useRepairStore()

defineEmits<{
  toggleSidebar: []
}>()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': '仪表盘',
    '/property-fees': '物业费管理',
    '/maintenance': '报修管理',
    '/analytics': '数据分析',
  }
  return map[route.path] || '仪表盘'
})

const totalNotifications = computed(() =>
  paymentStore.overdueCount + repairStore.pendingCount
)
</script>

<template>
  <header class="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-20">
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden text-slate-400 hover:text-white transition-colors"
        @click="$emit('toggleSidebar')"
      >
        <Menu class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold text-white">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-4">
      <button class="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
        <Bell class="w-5 h-5" />
        <span
          v-if="totalNotifications > 0"
          class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse"
        >
          {{ totalNotifications > 9 ? '9+' : totalNotifications }}
        </span>
      </button>
      <div class="flex items-center gap-2 pl-4 border-l border-slate-700/50">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
          <User class="w-4 h-4 text-white" />
        </div>
        <span class="text-sm text-slate-300 hidden sm:inline">管理员</span>
      </div>
    </div>
  </header>
</template>
