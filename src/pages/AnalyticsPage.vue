<script setup lang="ts">
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payment'
import { useRepairStore } from '@/stores/repair'
import GaugeChart from '@/components/charts/GaugeChart.vue'
import PaymentPieChart from '@/components/charts/PaymentPieChart.vue'
import RepairBarChart from '@/components/charts/RepairBarChart.vue'

const paymentStore = usePaymentStore()
const repairStore = useRepairStore()

const summaryCards = [
  {
    label: '已收缴总额',
    value: `¥${paymentStore.totalCollected.toLocaleString()}`,
    icon: TrendingUp,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
  },
  {
    label: '待收缴总额',
    value: `¥${paymentStore.totalOutstanding.toLocaleString()}`,
    icon: PieChart,
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
  },
  {
    label: '报修工单总数',
    value: `${repairStore.repairs.length}`,
    icon: BarChart3,
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
  },
  {
    label: '已完成工单',
    value: `${repairStore.completedCount}`,
    icon: Activity,
    gradient: 'from-violet-500/20 to-violet-600/5',
    iconColor: 'text-violet-400',
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="animate-fade-in">
      <h1 class="text-2xl font-bold text-white">数据分析</h1>
      <p class="text-sm text-slate-400 mt-1">物业运营核心指标与趋势概览</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 100ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-3">物业费收缴率</h3>
        <div class="h-80">
          <GaugeChart
            :value="paymentStore.collectionRate"
            title="收缴率"
            color="#34d399"
          />
        </div>
      </div>
      <div
        class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 200ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-3">报修及时率</h3>
        <div class="h-80">
          <GaugeChart
            :value="repairStore.timelyRate"
            title="及时率"
            color="#22d3ee"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 300ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-3">缴费状态分布</h3>
        <div class="h-80">
          <PaymentPieChart
            :paid="paymentStore.statusCounts.paid"
            :unpaid="paymentStore.statusCounts.unpaid"
            :partial="paymentStore.statusCounts.partial"
          />
        </div>
      </div>
      <div
        class="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 animate-fade-in"
        style="animation-delay: 400ms"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-3">月度报修趋势</h3>
        <div class="h-80">
          <RepairBarChart :data="repairStore.monthlyRepairCounts" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="(card, i) in summaryCards"
        :key="card.label"
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br p-5 animate-fade-in"
        :class="card.gradient"
        :style="{ animationDelay: `${500 + i * 100}ms` }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 rounded-lg bg-slate-800/80" :class="card.iconColor">
            <component :is="card.icon" class="w-4 h-4" />
          </div>
        </div>
        <p class="text-xl font-bold text-white font-mono">{{ card.value }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ card.label }}</p>
      </div>
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
