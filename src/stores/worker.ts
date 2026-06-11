import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
import type { MaintenanceWorker } from '@/types'
import { workers as mockWorkers } from '@/mock/workers'
import { useLocalStorage } from '@/composables/useLocalStorage'

export const useWorkerStore = defineStore('worker', () => {
  const workers = useLocalStorage<MaintenanceWorker[]>('property-workers', mockWorkers)
  const isSimulating = ref(false)
  let simulationInterval: ReturnType<typeof setInterval> | null = null

  function getWorkerById(id: string) {
    return workers.value.find(w => w.id === id)
  }

  function getAvailableWorkers() {
    return workers.value.filter(w => w.status === 'available')
  }

  function updateWorkerLocation(workerId: string, latitude: number, longitude: number) {
    const worker = workers.value.find(w => w.id === workerId)
    if (worker) {
      worker.latitude = latitude
      worker.longitude = longitude
    }
  }

  function simulateWorkerMovement() {
    if (isSimulating.value) return
    isSimulating.value = true

    simulationInterval = setInterval(() => {
      workers.value.forEach(worker => {
        if (worker.status === 'busy') {
          const latDelta = (Math.random() - 0.5) * 0.0004
          const lngDelta = (Math.random() - 0.5) * 0.0004

          const newLat = worker.latitude + latDelta
          const newLng = worker.longitude + lngDelta

          worker.latitude = Math.max(39.911, Math.min(39.918, newLat))
          worker.longitude = Math.max(116.404, Math.min(116.411, newLng))

          if (worker.currentOrderId) {
            const etaMinutes = Math.max(1, Math.floor(Math.random() * 25) + 1)
            worker.eta = `约${etaMinutes}分钟`
          }
        }
      })
    }, 2000)
  }

  function stopSimulation() {
    isSimulating.value = false
    if (simulationInterval) {
      clearInterval(simulationInterval)
      simulationInterval = null
    }
  }

  onMounted(() => {
    simulateWorkerMovement()
  })

  onUnmounted(() => {
    stopSimulation()
  })

  return {
    workers,
    isSimulating,
    getWorkerById,
    getAvailableWorkers,
    updateWorkerLocation,
    simulateWorkerMovement,
    stopSimulation,
  }
})
