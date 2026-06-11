<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Receipt,
  Wrench,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

const route = useRoute()

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/property-fees', label: '物业费管理', icon: Receipt },
  { path: '/maintenance', label: '报修管理', icon: Wrench },
  { path: '/analytics', label: '数据分析', icon: BarChart3 },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const sidebarWidth = computed(() => props.collapsed ? 'w-16' : 'w-56')
</script>

<template>
  <aside
    :class="[sidebarWidth, 'h-screen sticky top-0 flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out z-30']"
  >
    <div class="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
        <Building2 class="w-5 h-5 text-white" />
      </div>
      <transition name="fade">
        <span v-if="!collapsed" class="text-white font-bold text-sm whitespace-nowrap">物业管理面板</span>
      </transition>
    </div>

    <nav class="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive(item.path)
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        ]"
      >
        <component
          :is="item.icon"
          :class="['w-5 h-5 flex-shrink-0 transition-colors', isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300']"
        />
        <transition name="fade">
          <span v-if="!collapsed" class="text-sm whitespace-nowrap">{{ item.label }}</span>
        </transition>
      </router-link>
    </nav>

    <button
      class="flex items-center justify-center h-10 border-t border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
      @click="emit('toggle')"
    >
      <component :is="collapsed ? ChevronRight : ChevronLeft" class="w-4 h-4" />
    </button>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
