<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import { Search, RotateCcw, DollarSign, AlertTriangle, Users, Receipt } from 'lucide-vue-next'

const store = usePaymentStore()

const partialInput = ref<Record<string, string>>({})
const activePartial = ref<string | null>(null)

const formatCurrency = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`

const handleMarkPaid = (id: string) => {
  store.updatePaymentStatus(id, 'paid')
}

const handlePartialSubmit = (id: string) => {
  const amount = parseFloat(partialInput.value[id] || '')
  if (isNaN(amount) || amount <= 0) return
  store.updatePaymentStatus(id, 'partial', amount)
  activePartial.value = null
  partialInput.value[id] = ''
}

const showPartialInput = (id: string) => {
  activePartial.value = id
  partialInput.value[id] = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="已收金额"
        :value="formatCurrency(store.totalCollected)"
        :icon="DollarSign"
        gradient="from-emerald-500/10 to-emerald-600/5"
      />
      <StatCard
        title="欠费总额"
        :value="formatCurrency(store.totalOutstanding)"
        :icon="AlertTriangle"
        gradient="from-rose-500/10 to-rose-600/5"
      />
      <StatCard
        title="欠费户数"
        :value="store.overdueCount"
        :icon="Users"
        gradient="from-amber-500/10 to-amber-600/5"
      />
    </div>

    <div class="bg-slate-800/50 rounded-lg p-4">
      <div class="flex flex-wrap items-center gap-3">
        <select
          :value="store.filter.building"
          class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          @change="store.setFilter({ building: ($event.target as HTMLSelectElement).value, unit: '' })"
        >
          <option value="">全部楼栋</option>
          <option v-for="b in store.buildings" :key="b" :value="b">{{ b }}</option>
        </select>

        <select
          :value="store.filter.unit"
          class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          @change="store.setFilter({ unit: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">全部单元</option>
          <option v-for="u in store.units" :key="u" :value="u">{{ u }}</option>
        </select>

        <select
          :value="store.filter.status"
          class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          @change="store.setFilter({ status: ($event.target as HTMLSelectElement).value as any })"
        >
          <option value="">全部状态</option>
          <option value="paid">已缴</option>
          <option value="unpaid">未缴</option>
          <option value="partial">部分缴纳</option>
        </select>

        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            :value="store.filter.name"
            type="text"
            placeholder="搜索住户姓名..."
            class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            @input="store.setFilter({ name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          @click="store.resetFilter()"
        >
          <RotateCcw class="w-4 h-4" />
          重置
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-700/50">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-800/80 text-slate-400 text-left">
            <th class="px-4 py-3 font-medium">住户姓名</th>
            <th class="px-4 py-3 font-medium">楼栋/单元/房号</th>
            <th class="px-4 py-3 font-medium">缴费周期</th>
            <th class="px-4 py-3 font-medium text-right">应缴金额</th>
            <th class="px-4 py-3 font-medium text-right">已缴金额</th>
            <th class="px-4 py-3 font-medium text-center">状态</th>
            <th class="px-4 py-3 font-medium text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(payment, index) in store.filteredPayments"
            :key="payment.id"
            class="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200"
            :style="{ animationDelay: `${index * 40}ms` }"
          >
            <td class="px-4 py-3 text-slate-200 font-medium">{{ store.getResidentById(payment.residentId)?.name || '-' }}</td>
            <td class="px-4 py-3 text-slate-300">
              {{ store.getResidentById(payment.residentId)?.building || '-' }} /
              {{ store.getResidentById(payment.residentId)?.unit || '-' }} /
              {{ store.getResidentById(payment.residentId)?.room || '-' }}
            </td>
            <td class="px-4 py-3 text-slate-300">{{ payment.period }}</td>
            <td class="px-4 py-3 text-slate-200 text-right font-mono">{{ formatCurrency(payment.amount) }}</td>
            <td class="px-4 py-3 text-slate-200 text-right font-mono">{{ formatCurrency(payment.paidAmount) }}</td>
            <td class="px-4 py-3 text-center">
              <StatusBadge type="payment" :value="payment.status" />
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="payment.status === 'unpaid' || payment.status === 'partial'"
                  class="px-3 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  @click="handleMarkPaid(payment.id)"
                >
                  标记缴费
                </button>
                <button
                  v-if="payment.status === 'partial' && activePartial !== payment.id"
                  class="px-3 py-1 rounded-md text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                  @click="showPartialInput(payment.id)"
                >
                  部分缴费
                </button>
                <div v-if="activePartial === payment.id" class="flex items-center gap-1">
                  <input
                    v-model="partialInput[payment.id]"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="金额"
                    class="w-20 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    @keyup.enter="handlePartialSubmit(payment.id)"
                  />
                  <button
                    class="px-2 py-1 rounded-md text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    @click="handlePartialSubmit(payment.id)"
                  >
                    确认
                  </button>
                  <button
                    class="px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    @click="activePartial = null"
                  >
                    取消
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!store.filteredPayments?.length">
            <td colspan="7" class="px-4 py-12 text-center text-slate-500">
              <Receipt class="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>暂无缴费记录</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
tbody tr {
  animation: rowFadeIn 0.3s ease both;
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
