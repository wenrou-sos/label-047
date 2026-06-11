import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { RepairOrder, RepairFilter, RepairStatus } from '@/types'
import { repairs as mockRepairs } from '@/mock/repairs'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useWorkerStore } from './worker'

export const useRepairStore = defineStore('repair', () => {
  const repairs = useLocalStorage<RepairOrder[]>('property-repairs', mockRepairs)
  const filter = ref<RepairFilter>({
    status: '',
    priority: '',
    keyword: '',
  })

  const filteredRepairs = computed(() =>
    repairs.value.filter(r => {
      if (filter.value.status && r.status !== filter.value.status) return false
      if (filter.value.priority && r.priority !== filter.value.priority) return false
      if (filter.value.keyword && !r.title.includes(filter.value.keyword) && !r.description.includes(filter.value.keyword)) return false
      return true
    })
  )

  const pendingCount = computed(() =>
    repairs.value.filter(r => r.status === 'pending').length
  )

  const inProgressCount = computed(() =>
    repairs.value.filter(r => r.status === 'in_progress' || r.status === 'assigned').length
  )

  const completedCount = computed(() =>
    repairs.value.filter(r => r.status === 'completed' || r.status === 'closed').length
  )

  const timelyRate = computed(() => {
    const completed = repairs.value.filter(r => r.status === 'completed' || r.status === 'closed')
    if (completed.length === 0) return 0
    const timely = completed.filter(r => {
      const created = new Date(r.createdAt).getTime()
      const lastProgress = r.progress[r.progress.length - 1]
      const finished = new Date(lastProgress.timestamp).getTime()
      return (finished - created) < 24 * 60 * 60 * 1000
    })
    return Math.round((timely.length / completed.length) * 100)
  })

  const monthlyRepairCounts = computed(() => {
    const months: Record<string, number> = {}
    repairs.value.forEach(r => {
      const month = r.createdAt.substring(0, 7)
      months[month] = (months[month] || 0) + 1
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))
  })

  function assignWorker(orderId: string, workerId: string) {
    const order = repairs.value.find(r => r.id === orderId)
    if (order) {
      order.assignedWorkerId = workerId
      order.status = 'assigned'
      order.progress.push({
        stage: 'assigned',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: `已分配维修人员`,
      })

      const workerStore = useWorkerStore()
      const worker = workerStore.getWorkerById(workerId)
      if (worker) {
        worker.status = 'busy'
        worker.currentOrderId = orderId
        worker.eta = '约15分钟'
      }
    }
  }

  function updateStatus(orderId: string, status: RepairStatus, description: string) {
    const order = repairs.value.find(r => r.id === orderId)
    if (order) {
      order.status = status
      order.progress.push({
        stage: status,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description,
      })

      if ((status === 'completed' || status === 'closed') && order.assignedWorkerId) {
        const workerStore = useWorkerStore()
        const worker = workerStore.getWorkerById(order.assignedWorkerId)
        if (worker && worker.currentOrderId === orderId) {
          worker.status = 'available'
          worker.currentOrderId = null
          worker.eta = null
        }
      }
    }
  }

  function setFilter(newFilter: Partial<RepairFilter>) {
    Object.assign(filter.value, newFilter)
  }

  function resetFilter() {
    filter.value = { status: '', priority: '', keyword: '' }
  }

  return {
    repairs,
    filter,
    filteredRepairs,
    pendingCount,
    inProgressCount,
    completedCount,
    timelyRate,
    monthlyRepairCounts,
    assignWorker,
    updateStatus,
    setFilter,
    resetFilter,
  }
})
