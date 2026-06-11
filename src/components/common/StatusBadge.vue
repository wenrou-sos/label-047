<script setup lang="ts">
import type { PaymentStatus, RepairPriority, RepairStatus, WorkerStatus } from '@/types'

const props = defineProps<{
  type: 'payment' | 'repair-priority' | 'repair-status' | 'worker'
  value: PaymentStatus | RepairPriority | RepairStatus | WorkerStatus
}>()

const paymentConfig: Record<PaymentStatus, { label: string; class: string }> = {
  paid: { label: '已缴', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  unpaid: { label: '未缴', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  partial: { label: '部分缴纳', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

const repairPriorityConfig: Record<RepairPriority, { label: string; class: string }> = {
  low: { label: '低', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  medium: { label: '中', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  high: { label: '高', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  urgent: { label: '紧急', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
}

const repairStatusConfig: Record<RepairStatus, { label: string; class: string }> = {
  pending: { label: '待受理', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  assigned: { label: '已分配', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_progress: { label: '处理中', class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  completed: { label: '已完成', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  closed: { label: '已关闭', class: 'bg-slate-600/20 text-slate-500 border-slate-600/30' },
}

const workerConfig: Record<WorkerStatus, { label: string; class: string }> = {
  available: { label: '空闲', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  busy: { label: '忙碌', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  off_duty: { label: '下班', class: 'bg-slate-600/20 text-slate-500 border-slate-600/30' },
}

const config = (() => {
  switch (props.type) {
    case 'payment': return paymentConfig[props.value as PaymentStatus]
    case 'repair-priority': return repairPriorityConfig[props.value as RepairPriority]
    case 'repair-status': return repairStatusConfig[props.value as RepairStatus]
    case 'worker': return workerConfig[props.value as WorkerStatus]
  }
})()
</script>

<template>
  <span
    v-if="config"
    :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', config.class]"
  >
    {{ config.label }}
  </span>
</template>
