import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Payment, PaymentFilter, Resident } from '@/types'
import { payments as mockPayments } from '@/mock/payments'
import { residents as mockResidents } from '@/mock/residents'
import { useLocalStorage } from '@/composables/useLocalStorage'

export const usePaymentStore = defineStore('payment', () => {
  const payments = useLocalStorage<Payment[]>('property-payments', mockPayments)
  const residents = ref<Resident[]>(mockResidents)
  const filter = ref<PaymentFilter>({
    building: '',
    unit: '',
    name: '',
    status: '',
  })

  const buildings = computed(() => [...new Set(residents.value.map(r => r.building))])
  const units = computed(() => {
    if (!filter.value.building) return [...new Set(residents.value.map(r => r.unit))]
    const buildingResidents = residents.value.filter(r => r.building === filter.value.building)
    return [...new Set(buildingResidents.map(r => r.unit))]
  })

  const getResidentById = (id: string) => residents.value.find(r => r.id === id)

  const filteredPayments = computed(() => {
    return payments.value.filter(p => {
      const resident = getResidentById(p.residentId)
      if (!resident) return false
      if (filter.value.building && resident.building !== filter.value.building) return false
      if (filter.value.unit && resident.unit !== filter.value.unit) return false
      if (filter.value.name && !resident.name.includes(filter.value.name)) return false
      if (filter.value.status && p.status !== filter.value.status) return false
      return true
    })
  })

  const overduePayments = computed(() =>
    payments.value.filter(p => p.status === 'unpaid' || p.status === 'partial')
  )

  const totalCollected = computed(() =>
    payments.value.reduce((sum, p) => sum + p.paidAmount, 0)
  )

  const totalOutstanding = computed(() =>
    payments.value.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0)
  )

  const collectionRate = computed(() => {
    const total = payments.value.reduce((sum, p) => sum + p.amount, 0)
    if (total === 0) return 0
    return Math.round((totalCollected.value / total) * 100)
  })

  const statusCounts = computed(() => {
    const counts = { paid: 0, unpaid: 0, partial: 0 }
    payments.value.forEach(p => { counts[p.status]++ })
    return counts
  })

  const overdueCount = computed(() => overduePayments.value.length)

  function updatePaymentStatus(id: string, status: Payment['status'], paidAmount?: number) {
    const payment = payments.value.find(p => p.id === id)
    if (payment) {
      payment.status = status
      if (paidAmount !== undefined) payment.paidAmount = paidAmount
      if (status === 'paid') {
        payment.paidAmount = payment.amount
        payment.paidDate = new Date().toISOString().split('T')[0]
      }
    }
  }

  function setFilter(newFilter: Partial<PaymentFilter>) {
    Object.assign(filter.value, newFilter)
  }

  function resetFilter() {
    filter.value = { building: '', unit: '', name: '', status: '' }
  }

  return {
    payments,
    residents,
    filter,
    buildings,
    units,
    getResidentById,
    filteredPayments,
    overduePayments,
    totalCollected,
    totalOutstanding,
    collectionRate,
    statusCounts,
    overdueCount,
    updatePaymentStatus,
    setFilter,
    resetFilter,
  }
})
