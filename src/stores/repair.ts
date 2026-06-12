import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RepairOrder, RepairFilter, RepairStatus } from '@/types'
import { repairs as mockRepairs } from '@/mock/repairs'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useWorkerStore } from './worker'

export type KanbanColumn = 'pending' | 'in_progress' | 'completed'

export const useRepairStore = defineStore('repair', () => {
  const repairs = useLocalStorage<RepairOrder[]>('property-repairs', mockRepairs)
  const filter = ref<RepairFilter>({
    status: '',
    priority: '',
    keyword: '',
    workerId: '',
  })

  const filteredRepairs = computed(() =>
    repairs.value.filter(r => {
      if (filter.value.status && r.status !== filter.value.status) return false
      if (filter.value.priority && r.priority !== filter.value.priority) return false
      if (filter.value.keyword && !r.title.includes(filter.value.keyword) && !r.description.includes(filter.value.keyword)) return false
      if (filter.value.workerId && r.assignedWorkerId !== filter.value.workerId) return false
      return true
    })
  )

  const pendingList = computed(() =>
    filteredRepairs.value.filter(r => r.status === 'pending')
  )

  const inProgressList = computed(() =>
    filteredRepairs.value.filter(r => r.status === 'in_progress' || r.status === 'assigned')
  )

  const completedList = computed(() =>
    filteredRepairs.value.filter(r => r.status === 'completed' || r.status === 'closed')
  )

  const pendingCount = computed(() => pendingList.value.length)
  const inProgressCount = computed(() => inProgressList.value.length)
  const completedCount = computed(() => completedList.value.length)

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
      const oldStatus = order.status
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

      if ((oldStatus === 'completed' || oldStatus === 'closed') && order.assignedWorkerId && status !== 'completed' && status !== 'closed') {
        const workerStore = useWorkerStore()
        const worker = workerStore.getWorkerById(order.assignedWorkerId)
        if (worker) {
          worker.status = 'busy'
          worker.currentOrderId = orderId
          worker.eta = '约15分钟'
        }
      }
    }
  }

  function moveToColumn(orderId: string, column: KanbanColumn): { success: boolean; message?: string } {
    const order = repairs.value.find(r => r.id === orderId)
    if (!order) return { success: false, message: '工单不存在' }

    const statusMap: Record<KanbanColumn, { status: RepairStatus; desc: string }> = {
      pending: { status: 'pending', desc: '工单退回待处理' },
      in_progress: { status: 'in_progress', desc: '开始处理工单' },
      completed: { status: 'completed', desc: '工单处理完成' },
    }

    const target = statusMap[column]

    if (column === 'in_progress' && !order.assignedWorkerId) {
      return { success: false, message: '请先分配维修人员，再开始处理' }
    }

    if (column === 'completed' && !order.assignedWorkerId) {
      return { success: false, message: '未分配维修人员的工单不能直接完成，请先派工' }
    }

    if (column === 'completed' && order.status !== 'in_progress' && order.status !== 'assigned') {
      return { success: false, message: '请先将工单移至处理中，再标记完成' }
    }

    if (order.status !== target.status) {
      updateStatus(orderId, target.status, target.desc)
    }
    return { success: true }
  }

  function setFilter(newFilter: Partial<RepairFilter>) {
    Object.assign(filter.value, newFilter)
  }

  function resetFilter() {
    filter.value = { status: '', priority: '', keyword: '', workerId: '' }
  }

  return {
    repairs,
    filter,
    filteredRepairs,
    pendingList,
    inProgressList,
    completedList,
    pendingCount,
    inProgressCount,
    completedCount,
    timelyRate,
    monthlyRepairCounts,
    assignWorker,
    updateStatus,
    moveToColumn,
    setFilter,
    resetFilter,
  }
})
