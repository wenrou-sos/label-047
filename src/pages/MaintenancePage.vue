<template>
  <div class="space-y-5 animate-fadeIn">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">维修工单看板</h1>
        <p class="text-sm text-slate-400 mt-1">拖拽卡片调整状态，快速管理维修工单</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            v-model="store.filter.keyword"
            type="text"
            placeholder="搜索工单..."
            class="pl-9 pr-4 py-2 w-44 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
          />
        </div>
        <select
          v-model="store.filter.priority"
          class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="">全部优先级</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">紧急</option>
        </select>
        <select
          v-model="store.filter.workerId"
          class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="">全部维修人员</option>
          <option v-for="w in workerStore.workers" :key="w.id" :value="w.id">
            {{ w.name }}（{{ w.specialty }}）
          </option>
        </select>
        <button
          class="px-3 py-2 text-sm bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          @click="store.resetFilter()"
        >
          <FilterX class="w-4 h-4" />
          重置
        </button>
      </div>
    </div>

    <div class="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      <div
        v-for="(col, idx) in columns"
        :key="col.key"
        class="flex-shrink-0 w-80 md:w-[calc((100%-2rem)/3)] min-w-[280px]"
        @dragover.prevent="onDragOver($event, idx)"
        @dragleave="onDragLeave($event, idx)"
        @drop="onDrop($event, col.key)"
        :class="[
          'rounded-xl border-2 transition-all duration-200 h-[calc(100vh-260px)] min-h-[500px] flex flex-col',
          dragOverColumn === idx
            ? col.activeBorder + ' ' + col.activeBg + ' scale-[1.01]'
            : col.border + ' bg-slate-900/40'
        ]"
      >
        <div
          class="flex items-center justify-between px-4 py-3 rounded-t-lg border-b"
          :class="col.headerBorder"
        >
          <div class="flex items-center gap-2">
            <component :is="col.icon" class="w-4 h-4" :class="col.iconColor" />
            <h3 class="text-sm font-semibold" :class="col.titleColor">{{ col.title }}</h3>
            <span
              class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold"
              :class="col.badgeClass"
            >
              {{ getColumnCount(col.key) }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          <TransitionGroup name="list">
            <div
              v-for="order in getColumnData(col.key)"
              :key="order.id"
              draggable="true"
              @dragstart="onDragStart($event, order.id)"
              @dragend="onDragEnd"
              :class="[
                'group rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg',
                draggingId === order.id ? 'opacity-50 scale-95 rotate-1' : 'opacity-100',
                col.cardBorder,
                col.cardBg,
              ]"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <StatusBadge :value="order.priority" type="repair-priority" />
                  <span class="text-[11px] font-mono text-slate-500 truncate">{{ order.id }}</span>
                </div>
                <button
                  v-if="col.key === 'pending'"
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                  @click="openAssign(order)"
                  title="分配维修人员"
                >
                  <UserPlus class="w-3.5 h-3.5 text-slate-400 hover:text-sky-400" />
                </button>
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                  @click="selectedOrder = order"
                  title="查看详情"
                >
                  <Eye class="w-3.5 h-3.5 text-slate-400 hover:text-sky-400" />
                </button>
              </div>

              <h4 class="text-sm font-semibold text-white mb-1 leading-snug">{{ order.title }}</h4>
              <p class="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{{ order.description }}</p>

              <div class="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div class="flex items-center gap-1.5">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    :class="getWorkerBg(order.assignedWorkerId)"
                  >
                    {{ getWorkerInitial(order.assignedWorkerId) }}
                  </div>
                  <span class="text-[11px] text-slate-400">
                    {{ getWorkerName(order.assignedWorkerId) || '待分配' }}
                  </span>
                </div>
                <div class="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock class="w-3 h-3" />
                  {{ formatDate(order.createdAt) }}
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div
            v-if="getColumnData(col.key).length === 0"
            class="h-32 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg"
          >
            <Inbox class="w-8 h-8 mb-2 opacity-50" />
            <span class="text-xs">暂无工单</span>
          </div>
        </div>

        <div class="px-3 py-2 border-t border-slate-800/50 rounded-b-lg bg-slate-900/50">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>拖拽卡片到其他列</span>
            <span class="flex items-center gap-1">
              <GripVertical class="w-3 h-3" />
              共{{ getColumnCount(col.key) }}项
            </span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div
        v-if="selectedOrder"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="selectedOrder = null"
      >
        <div class="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-white">{{ selectedOrder.title }}</h3>
                <StatusBadge :value="selectedOrder.priority" type="repair-priority" />
              </div>
              <p class="text-xs text-slate-500 font-mono mt-0.5">{{ selectedOrder.id }}</p>
            </div>
            <button
              class="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              @click="selectedOrder = null"
            >
              <X class="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">问题描述</label>
              <p class="text-sm text-slate-300 mt-1.5 leading-relaxed bg-slate-800/40 rounded-lg p-3">{{ selectedOrder.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">分配人员</label>
                <div class="flex items-center gap-2 mt-1.5">
                  <div class="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold text-white">
                    {{ getWorkerInitial(selectedOrder.assignedWorkerId) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ getWorkerName(selectedOrder.assignedWorkerId) || '待分配' }}</p>
                    <p class="text-xs text-slate-500">{{ selectedOrder.assignedWorkerId ? getWorkerStore(selectedOrder.assignedWorkerId)?.specialty : '' }}</p>
                  </div>
                </div>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">报修住户</label>
                <div class="mt-1.5">
                  <p class="text-sm font-medium text-white">{{ getResident(selectedOrder.residentId)?.name || '-' }}</p>
                  <p class="text-xs text-slate-500">{{ formatAddress(selectedOrder.residentId) }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">处理进度</label>
              <div class="space-y-3">
                <div
                  v-for="(step, i) in selectedOrder.progress"
                  :key="i"
                  class="flex gap-3"
                >
                  <div class="flex flex-col items-center">
                    <div class="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle class="w-4 h-4 text-white" />
                    </div>
                    <div v-if="i < selectedOrder.progress.length - 1" class="w-0.5 flex-1 bg-sky-600/30 my-1" />
                  </div>
                  <div class="pb-3">
                    <p class="text-sm font-medium text-slate-200">{{ step.description }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ formatDate(step.timestamp) }} {{ formatTime(step.timestamp) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900/60">
            <button
              v-if="selectedOrder.status === 'pending'"
              class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              @click="openAssign(selectedOrder); selectedOrder = null;"
            >
              <UserPlus class="w-4 h-4" />
              分配维修人员
            </button>
            <button
              v-if="selectedOrder.status === 'assigned' || selectedOrder.status === 'in_progress'"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              @click="completeOrder(selectedOrder)"
            >
              <CheckCircle class="w-4 h-4" />
              标记完成
            </button>
            <button
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              @click="selectedOrder = null"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div
        v-if="assignOrder"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="assignOrder = null"
      >
        <div class="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white">分配维修人员</h3>
              <p class="text-xs text-slate-500 mt-0.5">{{ assignOrder.title }}</p>
            </div>
            <button
              class="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              @click="assignOrder = null"
            >
              <X class="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div class="p-5 space-y-2">
            <button
              v-for="worker in availableWorkers"
              :key="worker.id"
              class="w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left hover:scale-[1.01]"
              :class="[
                worker.status === 'available'
                  ? 'border-slate-700 hover:border-sky-500 hover:bg-slate-800/60'
                  : 'border-slate-800 bg-slate-800/30 opacity-70'
              ]"
              @click="assignWorker(worker.id)"
            >
              <div class="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {{ worker.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-white">{{ worker.name }}</p>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-md" :class="workerStatusColor(worker.status)">
                    {{ workerStatusText(worker.status) }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">{{ worker.specialty }} · {{ worker.phone }}</p>
                <p v-if="worker.status === 'busy'" class="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle class="w-3 h-3" />
                  当前有工单处理中
                </p>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-600" />
            </button>
            <div v-if="availableWorkers.length === 0" class="text-center py-10 text-slate-500">
              <Users class="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p class="text-sm">暂无维修人员信息</p>
            </div>
          </div>
          <div class="px-5 py-4 border-t border-slate-800 flex justify-end bg-slate-900/60">
            <button
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              @click="assignOrder = null"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useRepairStore, type KanbanColumn } from '@/stores/repair'
import { useWorkerStore } from '@/stores/worker'
import { usePaymentStore } from '@/stores/payment'
import type { RepairOrder, MaintenanceWorker } from '@/types'
import {
  Clock, Inbox, Search, UserPlus, X, GripVertical,
  AlertCircle, CheckCircle, ChevronRight, Users, FilterX, Eye,
  Loader, FolderCheck, Wrench
} from 'lucide-vue-next'
import StatusBadge from '@/components/common/StatusBadge.vue'

const store = useRepairStore()
const workerStore = useWorkerStore()
const paymentStore = usePaymentStore()

const draggingId = ref<string | null>(null)
const dragOverColumn = ref<number | null>(null)
const selectedOrder = ref<RepairOrder | null>(null)
const assignOrder = ref<RepairOrder | null>(null)

type ColumnDef = {
  key: KanbanColumn
  title: string
  icon: any
  iconColor: string
  titleColor: string
  badgeClass: string
  headerBorder: string
  border: string
  activeBorder: string
  activeBg: string
  cardBorder: string
  cardBg: string
}

const columns: ColumnDef[] = [
  {
    key: 'pending',
    title: '待处理',
    icon: markRaw(Clock),
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    badgeClass: 'bg-amber-500/20 text-amber-400',
    headerBorder: 'border-amber-500/20 bg-amber-500/5',
    border: 'border-amber-500/20',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-500/5',
    cardBorder: 'border-amber-500/10',
    cardBg: 'bg-slate-900/80 hover:bg-slate-800/80',
  },
  {
    key: 'in_progress',
    title: '处理中',
    icon: markRaw(Wrench),
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
    badgeClass: 'bg-sky-500/20 text-sky-400',
    headerBorder: 'border-sky-500/20 bg-sky-500/5',
    border: 'border-sky-500/20',
    activeBorder: 'border-sky-400',
    activeBg: 'bg-sky-500/5',
    cardBorder: 'border-sky-500/10',
    cardBg: 'bg-slate-900/80 hover:bg-slate-800/80',
  },
  {
    key: 'completed',
    title: '已完成',
    icon: markRaw(FolderCheck),
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/20 text-emerald-400',
    headerBorder: 'border-emerald-500/20 bg-emerald-500/5',
    border: 'border-emerald-500/20',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-emerald-500/5',
    cardBorder: 'border-emerald-500/10',
    cardBg: 'bg-slate-900/80 hover:bg-slate-800/80',
  },
]

const availableWorkers = computed(() => workerStore.workers)

function getColumnData(key: KanbanColumn): RepairOrder[] {
  switch (key) {
    case 'pending': return store.pendingList
    case 'in_progress': return store.inProgressList
    case 'completed': return store.completedList
  }
}

function getColumnCount(key: KanbanColumn): number {
  switch (key) {
    case 'pending': return store.pendingCount
    case 'in_progress': return store.inProgressCount
    case 'completed': return store.completedCount
  }
}

function getWorkerName(id: string | null): string {
  if (!id) return ''
  const w = workerStore.getWorkerById(id)
  return w?.name || ''
}

function getWorkerStore(id: string | null): MaintenanceWorker | undefined {
  if (!id) return undefined
  return workerStore.getWorkerById(id)
}

function getWorkerInitial(id: string | null): string {
  const name = getWorkerName(id)
  return name ? name.charAt(0) : '?'
}

function getWorkerBg(id: string | null): string {
  if (!id) return 'bg-slate-700 text-slate-400'
  return 'bg-sky-600 text-white'
}

function getResident(id: string) {
  return paymentStore.getResidentById(id)
}

function formatAddress(id: string): string {
  const r = getResident(id)
  if (!r) return '-'
  return `${r.building}栋${r.unit}单元${r.room}`
}

function formatDate(s: string): string {
  const d = new Date(s.replace(/-/g, '/'))
  const today = new Date()
  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatTime(s: string): string {
  const d = new Date(s.replace(/-/g, '/'))
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function workerStatusText(status: string): string {
  return { available: '空闲', busy: '忙碌', off_duty: '下班' }[status] || status
}

function workerStatusColor(status: string): string {
  return {
    available: 'bg-emerald-500/20 text-emerald-400',
    busy: 'bg-amber-500/20 text-amber-400',
    off_duty: 'bg-slate-500/20 text-slate-400',
  }[status] || 'bg-slate-500/20 text-slate-400'
}

function onDragStart(e: DragEvent, id: string) {
  draggingId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}

function onDragEnd() {
  draggingId.value = null
  dragOverColumn.value = null
}

function onDragOver(e: DragEvent, idx: number) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverColumn.value = idx
}

function onDragLeave(e: DragEvent, idx: number) {
  if (dragOverColumn.value === idx) {
    const target = e.currentTarget as HTMLElement
    if (!target.contains(e.relatedTarget as Node)) {
      dragOverColumn.value = null
    }
  }
}

function onDrop(e: DragEvent, columnKey: KanbanColumn) {
  e.preventDefault()
  const orderId = e.dataTransfer?.getData('text/plain') || draggingId.value
  if (orderId) {
    store.moveToColumn(orderId, columnKey)
  }
  draggingId.value = null
  dragOverColumn.value = null
}

function openAssign(order: RepairOrder) {
  assignOrder.value = order
}

function assignWorker(workerId: string) {
  if (assignOrder.value) {
    store.assignWorker(assignOrder.value.id, workerId)
    assignOrder.value = null
  }
}

function completeOrder(order: RepairOrder) {
  store.updateStatus(order.id, 'completed', '工单处理完成')
  selectedOrder.value = null
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }

.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.9);
}
.list-move {
  transition: transform 0.3s ease;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
