<script setup lang="ts">
import { computed } from 'vue'
import { DollarSign, AlertTriangle, Wrench, Clock, TrendingUp, CheckCircle } from 'lucide-vue-next'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { usePaymentStore } from '@/stores/payment'
import { useRepairStore } from '@/stores/repair'
import { useWorkerStore } from '@/stores/worker'

const paymentStore = usePaymentStore()
const repairStore = useRepairStore()
const workerStore = useWorkerStore()

const collectionRateTrend = computed(() => paymentStore.collectionRate > 80 ? 'up' as const : 'down' as const)

const daysOverdue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
}

const recentRepairs = computed(() =>
  [...repairStore.repairs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
)

const quickActions = [
  { label: '物业费管理', icon: DollarSign, to: '/property-fees' },
  { label: '报修管理', icon: Wrench, to: '/maintenance' },
  { label: '数据分析', icon: TrendingUp, to: '/analytics' },
  { label: '人员调度', icon: CheckCircle, to: '/maintenance' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="(card, i) in [
          {
            title: '物业费收缴率',
            value: paymentStore.collectionRate + '%',
            trend: collectionRateTrend,
            trendValue: collectionRateTrend === 'up' ? '达标' : '待提升',
            icon: DollarSign,
            gradient: 'from-emerald-500/10 to-emerald-600/5',
          },
          {
            title: '欠费住户',
            value: paymentStore.overdueCount + '户',
            trend: 'down' as const,
            trendValue: '需关注',
            icon: AlertTriangle,
            gradient: 'from-amber-500/10 to-amber-600/5',
          },
          {
            title: '待处理报修',
            value: repairStore.pendingCount + '件',
            icon: Wrench,
            gradient: 'from-rose-500/10 to-rose-600/5',
          },
          {
            title: '报修及时率',
            value: repairStore.timelyRate + '%',
            trend: 'up' as const,
            trendValue: '良好',
            icon: Clock,
            gradient: 'from-cyan-500/10 to-cyan-600/5',
          },
        ]"
        :key="card.title"
        class="animate-fade-in"
        :style="{ animationDelay: `${i * 100}ms` }"
      >
        <StatCard
          :title="card.title"
          :value="card.value"
          :trend="card.trend"
          :trend-value="card.trendValue"
          :icon="card.icon"
          :gradient="card.gradient"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div
        class="lg:col-span-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 400ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-4">欠费提醒</h3>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <div
            v-for="payment in paymentStore.overduePayments"
            :key="payment.id"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-white truncate">
                  {{ paymentStore.getResidentById(payment.residentId)?.name ?? '未知' }}
                </span>
                <StatusBadge type="payment" :value="payment.status" />
              </div>
              <p class="text-xs text-slate-500 mt-1">
                {{ paymentStore.getResidentById(payment.residentId)?.building }}{{ paymentStore.getResidentById(payment.residentId)?.unit }}{{ paymentStore.getResidentById(payment.residentId)?.room }}
              </p>
            </div>
            <div class="text-right ml-4">
              <p class="text-sm font-mono" :class="daysOverdue(payment.dueDate) > 30 ? 'text-rose-400' : 'text-amber-400'">
                ¥{{ Math.max(0, payment.amount - payment.paidAmount).toLocaleString() }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">逾期 {{ daysOverdue(payment.dueDate) }} 天</p>
            </div>
          </div>
          <div v-if="paymentStore.overduePayments.length === 0" class="text-center py-8 text-slate-500 text-sm">
            暂无欠费记录
          </div>
        </div>
      </div>

      <div
        class="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 500ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-4">报修动态</h3>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <div
            v-for="repair in recentRepairs"
            :key="repair.id"
            class="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-white truncate">{{ repair.title }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ repair.createdAt }}</p>
            </div>
            <StatusBadge type="repair-status" :value="repair.status" />
          </div>
          <div v-if="recentRepairs.length === 0" class="text-center py-8 text-slate-500 text-sm">
            暂无报修记录
          </div>
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
      style="animation-delay: 600ms"
    >
      <router-link
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:border-slate-600/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 group"
      >
        <div class="p-3 rounded-lg bg-slate-800/80 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition-colors">
          <component :is="action.icon" class="w-6 h-6" />
        </div>
        <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{{ action.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
  animation: fade-in 0.5s ease-out forwards;
}
</style>
