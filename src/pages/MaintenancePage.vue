<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRepairStore } from '@/stores/repair'
import { useWorkerStore } from '@/stores/worker'
import { usePaymentStore } from '@/stores/payment'
import StatusBadge from '@/components/common/StatusBadge.vue'
import {
  Search,
  RotateCcw,
  Wrench,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-vue-next'
import type { RepairStatus, RepairPriority } from '@/types'

const repairStore = useRepairStore()
const workerStore = useWorkerStore()
const paymentStore = usePaymentStore()

const statusOptions: { value: RepairStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待受理' },
  { value: 'assigned', label: '已分配' },
  { value: 'in_progress', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
]

const priorityOptions: { value: RepairPriority | ''; label: string }[] = [
  { value: '', label: '全部优先级' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

const assignWorkerId = ref<Record<string, string>>({})

const handleAssign = (orderId: string) => {
  const workerId = assignWorkerId.value[orderId]
  if (!workerId) return
  repairStore.assignWorker(orderId, workerId)
  assignWorkerId.value[orderId] = ''
}

const handleStartProgress = (orderId: string) => {
  repairStore.updateStatus(orderId, 'in_progress', '维修人员已到达现场开始处理')
}

const handleComplete = (orderId: string) => {
  repairStore.updateStatus(orderId, 'completed', '维修完成')
}

const stageLabels: Record<string, string> = {
  pending: '提交',
  assigned: '分配',
  in_progress: '处理',
  completed: '完成',
  closed: '关闭',
}

const statsValueMap = computed(() => ({
  pendingCount: repairStore.pendingCount,
  inProgressCount: repairStore.inProgressCount,
  completedCount: repairStore.completedCount,
  timelyRate: repairStore.timelyRate,
}))

const statsCards = [
  { title: '待受理', key: 'pendingCount', icon: AlertCircle, gradient: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-400', valueColor: 'text-amber-400' },
  { title: '处理中', key: 'inProgressCount', icon: Clock, gradient: 'from-cyan-500/10 to-cyan-600/5', iconColor: 'text-cyan-400', valueColor: 'text-cyan-400' },
  { title: '已完成', key: 'completedCount', icon: CheckCircle, gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-400', valueColor: 'text-emerald-400' },
  { title: '及时率', key: 'timelyRate', icon: Wrench, gradient: 'from-cyan-500/10 to-cyan-600/5', iconColor: 'text-cyan-400', valueColor: 'text-cyan-400', suffix: '%' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="(card, i) in statsCards"
        :key="card.key"
        class="animate-slide-in"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <div class="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg group">
          <div :class="['absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', card.gradient]" />
          <div class="relative z-10">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">{{ card.title }}</p>
                <p :class="['text-2xl font-bold font-mono', card.valueColor]">
                  {{ (statsValueMap as Record<string, number>)[card.key] }}{{ card.suffix ?? '' }}
                </p>
              </div>
              <div :class="['p-2.5 rounded-lg bg-slate-800/80', card.iconColor]">
                <component :is="card.icon" class="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 animate-slide-in" style="animation-delay: 350ms">
      <div class="flex flex-wrap items-center gap-3">
        <select
          :value="repairStore.filter.status"
          class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          @change="repairStore.setFilter({ status: ($event.target as HTMLSelectElement).value as RepairStatus | '' })"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <select
          :value="repairStore.filter.priority"
          class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          @change="repairStore.setFilter({ priority: ($event.target as HTMLSelectElement).value as RepairPriority | '' })"
        >
          <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            :value="repairStore.filter.keyword"
            type="text"
            placeholder="搜索报修标题或描述..."
            class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            @input="repairStore.setFilter({ keyword: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          @click="repairStore.resetFilter()"
        >
          <RotateCcw class="w-4 h-4" />
          重置
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="(repair, idx) in repairStore.filteredRepairs"
          :key="repair.id"
          class="animate-slide-in rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 hover:border-slate-600/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
          :style="{ animationDelay: `${400 + idx * 60}ms` }"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <h3 class="text-sm font-semibold text-white truncate">{{ repair.title }}</h3>
              <StatusBadge type="repair-priority" :value="repair.priority" />
            </div>
            <StatusBadge type="repair-status" :value="repair.status" />
          </div>

          <p class="text-xs text-slate-400 mb-4 line-clamp-2">{{ repair.description }}</p>

          <div class="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs">
            <div class="flex items-center gap-1.5 text-slate-400">
              <User class="w-3.5 h-3.5" />
              <span>{{ paymentStore.getResidentById(repair.residentId)?.name ?? '未知住户' }}</span>
            </div>
            <div v-if="repair.assignedWorkerId" class="flex items-center gap-1.5 text-slate-400">
              <Phone class="w-3.5 h-3.5" />
              <span>{{ workerStore.getWorkerById(repair.assignedWorkerId)?.name ?? '未知人员' }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-slate-400">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ repair.createdAt }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3 mb-4 pl-1">
            <div class="flex flex-col items-center">
              <template v-for="(step, si) in repair.progress" :key="si">
                <div
                  :class="[
                    'w-2.5 h-2.5 rounded-full border-2',
                    si === repair.progress.length - 1
                      ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      : 'bg-slate-700 border-slate-600'
                  ]"
                />
                <div
                  v-if="si < repair.progress.length - 1"
                  class="w-0.5 h-5 bg-slate-700"
                />
              </template>
            </div>
            <div class="flex flex-col gap-0">
              <template v-for="(step, si) in repair.progress" :key="si">
                <div :class="['flex items-center gap-2', si < repair.progress.length - 1 ? 'h-5 mb-5' : 'h-5']">
                  <span :class="['text-xs', si === repair.progress.length - 1 ? 'text-cyan-400 font-medium' : 'text-slate-500']">
                    {{ stageLabels[step.stage] || step.stage }}
                  </span>
                  <span class="text-[10px] text-slate-600">{{ step.timestamp.slice(5, 16) }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-700/50">
            <template v-if="repair.status === 'pending'">
              <select
                v-model="assignWorkerId[repair.id]"
                class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">选择维修人员</option>
                <option v-for="w in workerStore.getAvailableWorkers()" :key="w.id" :value="w.id">
                  {{ w.name }} - {{ w.specialty }}
                </option>
              </select>
              <button
                :disabled="!assignWorkerId[repair.id]"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  assignWorkerId[repair.id]
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                ]"
                @click="handleAssign(repair.id)"
              >
                分配人员
              </button>
            </template>

            <template v-if="repair.status === 'assigned'">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                @click="handleStartProgress(repair.id)"
              >
                <ChevronRight class="w-3.5 h-3.5" />
                开始处理
              </button>
            </template>

            <template v-if="repair.status === 'in_progress'">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                @click="handleComplete(repair.id)"
              >
                <CheckCircle class="w-3.5 h-3.5" />
                完成维修
              </button>
            </template>

            <template v-if="repair.status === 'completed' || repair.status === 'closed'">
              <span class="text-xs text-slate-600 flex items-center gap-1">
                <CheckCircle class="w-3.5 h-3.5" />
                已结单
              </span>
            </template>
          </div>
        </div>

        <div
          v-if="repairStore.filteredRepairs.length === 0"
          class="text-center py-16 text-slate-500 text-sm animate-slide-in"
          style="animation-delay: 400ms"
        >
          暂无匹配的报修工单
        </div>
      </div>

      <div class="space-y-4">
        <div class="animate-slide-in rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden" style="animation-delay: 500ms">
          <div class="px-5 py-4 border-b border-slate-700/50">
            <h3 class="text-sm font-medium text-slate-300">维修人员追踪</h3>
          </div>

          <div class="relative h-56 bg-slate-950 m-4 rounded-lg overflow-hidden border border-slate-800/50">
            <div class="absolute inset-0 opacity-30">
              <div class="absolute top-0 left-0 w-full h-full" style="background: radial-gradient(circle at 30% 40%, rgba(34,211,238,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(52,211,153,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(251,191,36,0.1) 0%, transparent 40%)" />
            </div>
            <div class="absolute inset-0 opacity-15">
              <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" stroke-width="0.5" class="text-slate-600" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div class="absolute top-3 left-3 z-20 flex items-center gap-4 text-[10px]">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-emerald-400" />
                <span class="text-slate-400">空闲</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-amber-400" />
                <span class="text-slate-400">忙碌</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-slate-600" />
                <span class="text-slate-400">下班</span>
              </div>
            </div>

            <div
              v-for="worker in workerStore.workers"
              :key="worker.id"
              class="absolute group worker-marker"
              :style="{
                left: `${((worker.longitude - 116.404) / 0.007) * 100}%`,
                top: `${((worker.latitude - 39.912) / 0.006) * 100}%`,
              }"
            >
              <div
                :class="[
                  'relative w-4 h-4 rounded-full cursor-pointer transition-all duration-700 ease-out group-hover:scale-[2] -translate-x-1/2 -translate-y-1/2',
                  worker.status === 'available' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : worker.status === 'busy' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-600'
                ]"
              >
                <div
                  v-if="worker.status === 'busy'"
                  :class="['absolute inset-0 w-4 h-4 rounded-full bg-amber-400 animate-ping-slow -translate-x-0 -translate-y-0']"
                />
                <div
                  v-if="worker.status === 'available'"
                  :class="['absolute inset-0 w-4 h-4 rounded-full bg-emerald-400 animate-ping-slow -translate-x-0 -translate-y-0']"
                />
              </div>
              <div class="absolute left-6 top-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 -translate-y-1/2">
                <div class="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                  <p class="text-xs font-semibold text-white">{{ worker.name }}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">{{ worker.specialty }}</p>
                  <div v-if="worker.status === 'busy' && worker.eta" class="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <MapPin class="w-3 h-3" />
                    {{ worker.eta }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 pb-4 space-y-2">
            <div
              v-for="worker in workerStore.workers"
              :key="worker.id"
              class="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  :class="[
                    'w-2 h-2 rounded-full flex-shrink-0',
                    worker.status === 'available' ? 'bg-emerald-400' : worker.status === 'busy' ? 'bg-amber-400' : 'bg-slate-600'
                  ]"
                />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-white truncate">{{ worker.name }}</p>
                  <p class="text-[10px] text-slate-500">{{ worker.specialty }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <StatusBadge type="worker" :value="worker.status" />
                <div v-if="worker.status === 'busy' && worker.eta" class="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <MapPin class="w-3 h-3" />
                  {{ worker.eta }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  opacity: 0;
  animation: slide-in 0.5s ease-out forwards;
}

@keyframes ping-once {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.animate-ping-once {
  animation: ping-once 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.worker-marker {
  will-change: left, top;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
