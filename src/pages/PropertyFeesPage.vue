<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import { Search, RotateCcw, DollarSign, AlertTriangle, Users, Receipt, Eye, X, Phone, MapPin, TrendingUp, FileText } from 'lucide-vue-next'
import type { Payment, PaymentMethod } from '@/types'

const store = usePaymentStore()

const partialInput = ref<Record<string, string>>({})
const activePartial = ref<string | null>(null)
const detailResidentId = ref<string | null>(null)
const selectedMethod = ref<Record<string, PaymentMethod>>({})

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'cash', label: '现金' },
  { value: 'bank_transfer', label: '银行转账' },
]

const formatCurrency = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`

const handleMarkPaid = (id: string) => {
  store.updatePaymentStatus(id, 'paid', undefined, selectedMethod.value[id] || 'wechat')
  selectedMethod.value[id] = undefined as any
}

const getRemainingAmount = (payment: any) => {
  return Math.max(0, payment.amount - payment.paidAmount)
}

const handlePartialSubmit = (id: string) => {
  const amount = parseFloat(partialInput.value[id] || '')
  if (isNaN(amount) || amount <= 0) return
  store.updatePaymentStatus(id, 'partial', amount, selectedMethod.value[id] || 'wechat')
  activePartial.value = null
  partialInput.value[id] = ''
  selectedMethod.value[id] = undefined as any
}

const showPartialInput = (id: string) => {
  activePartial.value = id
  partialInput.value[id] = ''
}

const openDetail = (residentId: string) => {
  detailResidentId.value = residentId
}

const residentStats = computed(() => {
  if (!detailResidentId.value) return null
  return store.getResidentStats(detailResidentId.value)
})

const residentInfo = computed(() => {
  if (!detailResidentId.value) return null
  return store.getResidentById(detailResidentId.value)
})

const paidPercent = computed(() => {
  if (!residentStats.value || residentStats.value.totalAmount === 0) return 0
  return Math.round((residentStats.value.totalPaid / residentStats.value.totalAmount) * 100)
})

const paymentMethodLabel = (p: Payment): string => {
  const map: Record<string, string> = {
    wechat: '微信',
    alipay: '支付宝',
    cash: '现金',
    bank_transfer: '银行转账',
  }
  if (!p.paymentMethod) return '-'
  return map[p.paymentMethod] || p.paymentMethod
}

const daysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate.replace(/-/g, '/'))
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
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
                  class="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 transition-colors flex items-center gap-1"
                  @click="openDetail(payment.residentId)"
                >
                  <Eye class="w-3.5 h-3.5" />
                  详情
                </button>
                <template v-if="payment.status === 'unpaid' || payment.status === 'partial'">
                  <select
                    v-model="selectedMethod[payment.id]"
                    class="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <button
                    class="px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                    @click="handleMarkPaid(payment.id)"
                  >
                    标记缴费
                  </button>
                </template>
                <button
                  v-if="payment.status === 'partial' && activePartial !== payment.id"
                  class="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                  @click="showPartialInput(payment.id)"
                >
                  部分缴费
                </button>
                <div v-if="activePartial === payment.id" class="flex items-center gap-1">
                  <select
                    v-model="selectedMethod[payment.id]"
                    class="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <div class="relative">
                    <input
                      v-model="partialInput[payment.id]"
                      type="number"
                      min="0"
                      :max="getRemainingAmount(payment)"
                      step="0.01"
                      :placeholder="`最多 ¥${getRemainingAmount(payment)}`"
                      class="w-28 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      @keyup.enter="handlePartialSubmit(payment.id)"
                    />
                  </div>
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

    <Transition name="modal">
      <div
        v-if="detailResidentId && residentStats && residentInfo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="detailResidentId = null"
      >
        <div class="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-sm font-bold text-white">
                {{ residentInfo.name.charAt(0) }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ residentInfo.name }} 的缴费档案</h3>
                <div class="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  <span class="flex items-center gap-1">
                    <MapPin class="w-3 h-3" />
                    {{ residentInfo.building }}栋{{ residentInfo.unit }}单元{{ residentInfo.room }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Phone class="w-3 h-3" />
                    {{ residentInfo.phone }}
                  </span>
                </div>
              </div>
            </div>
            <button
              class="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              @click="detailResidentId = null"
            >
              <X class="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-800/60 rounded-xl p-4 text-center">
                <p class="text-xs text-slate-500 mb-1">应缴总额</p>
                <p class="text-lg font-bold font-mono text-white">{{ formatCurrency(residentStats.totalAmount) }}</p>
              </div>
              <div class="bg-emerald-950/40 rounded-xl p-4 text-center border border-emerald-500/10">
                <p class="text-xs text-emerald-400/70 mb-1">已缴金额</p>
                <p class="text-lg font-bold font-mono text-emerald-400">{{ formatCurrency(residentStats.totalPaid) }}</p>
              </div>
              <div class="bg-rose-950/40 rounded-xl p-4 text-center border border-rose-500/10">
                <p class="text-xs text-rose-400/70 mb-1">欠费金额</p>
                <p class="text-lg font-bold font-mono text-rose-400">{{ formatCurrency(residentStats.totalOwed) }}</p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-400">缴费进度</span>
                <span class="text-xs font-mono" :class="paidPercent >= 80 ? 'text-emerald-400' : paidPercent >= 50 ? 'text-amber-400' : 'text-rose-400'">
                  {{ paidPercent }}%
                </span>
              </div>
              <div class="h-8 bg-slate-800 rounded-lg overflow-hidden flex relative">
                <div
                  class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out flex items-center justify-center"
                  :style="{ width: `${paidPercent}%` }"
                >
                  <span v-if="paidPercent >= 15" class="text-[11px] font-bold text-white drop-shadow-sm">
                    已缴 {{ formatCurrency(residentStats.totalPaid) }}
                  </span>
                </div>
                <div class="h-full bg-gradient-to-r from-rose-600/60 to-rose-500/40 flex items-center justify-center flex-1">
                  <span v-if="paidPercent < 85 && residentStats.totalOwed > 0" class="text-[11px] font-bold text-rose-200 drop-shadow-sm">
                    欠费 {{ formatCurrency(residentStats.totalOwed) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                <span class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  已缴 {{ residentStats.paidCount }} 期
                </span>
                <span class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  未缴 {{ residentStats.unpaidCount }} 期
                </span>
                <span v-if="residentStats.partialCount > 0" class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  部分缴纳 {{ residentStats.partialCount }} 期
                </span>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <FileText class="w-4 h-4 text-sky-400" />
                历史缴费记录
              </h4>
              <div class="space-y-2">
                <div
                  v-for="record in residentStats.records"
                  :key="record.id"
                  class="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                >
                  <div class="w-1 h-8 rounded-full flex-shrink-0"
                    :class="{
                      'bg-emerald-500': record.status === 'paid',
                      'bg-rose-500': record.status === 'unpaid',
                      'bg-amber-500': record.status === 'partial',
                    }"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-white">{{ record.period }}</span>
                      <StatusBadge type="payment" :value="record.status" />
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">
                      截止 {{ record.dueDate }}
                      <span v-if="record.paidDate"> · 缴费 {{ record.paidDate }}</span>
                      <span v-if="record.paidDate"> · {{ paymentMethodLabel(record) }}</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-sm font-mono text-white">{{ formatCurrency(record.amount) }}</p>
                    <p v-if="record.status === 'partial'" class="text-xs font-mono text-amber-400">
                      已缴 {{ formatCurrency(record.paidAmount) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="residentStats.overdueRecords.length > 0">
              <h4 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-rose-400" />
                当前欠费明细
              </h4>
              <div class="bg-rose-950/20 border border-rose-500/10 rounded-xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-rose-400/70 text-left text-xs">
                      <th class="px-4 py-2 font-medium">周期</th>
                      <th class="px-4 py-2 font-medium text-right">欠费金额</th>
                      <th class="px-4 py-2 font-medium text-right">逾期天数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in residentStats.overdueRecords"
                      :key="item.id"
                      class="border-t border-rose-500/10"
                    >
                      <td class="px-4 py-2 text-slate-300">{{ item.period }}</td>
                      <td class="px-4 py-2 text-rose-400 text-right font-mono font-medium">
                        {{ formatCurrency(item.amount - item.paidAmount) }}
                      </td>
                      <td class="px-4 py-2 text-right">
                        <span :class="daysOverdue(item.dueDate) > 90 ? 'text-rose-400' : 'text-amber-400'">
                          {{ daysOverdue(item.dueDate) }} 天
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="border-t border-rose-500/20 bg-rose-950/30">
                      <td class="px-4 py-2.5 text-sm font-medium text-rose-300">合计</td>
                      <td class="px-4 py-2.5 text-rose-300 text-right font-mono font-bold">
                        {{ formatCurrency(residentStats.totalOwed) }}
                      </td>
                      <td class="px-4 py-2.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp class="w-6 h-6 text-emerald-400" />
              </div>
              <p class="text-sm text-emerald-400 font-medium">缴费状态良好</p>
              <p class="text-xs text-slate-500 mt-1">该住户暂无欠费记录</p>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/60">
            <button
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              @click="detailResidentId = null"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
