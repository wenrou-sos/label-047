export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'closed'
export type WorkerStatus = 'available' | 'busy' | 'off_duty'

export interface Resident {
  id: string
  name: string
  building: string
  unit: string
  room: string
  phone: string
}

export interface Payment {
  id: string
  residentId: string
  period: string
  amount: number
  paidAmount: number
  status: PaymentStatus
  dueDate: string
  paidDate: string | null
}

export interface RepairProgress {
  stage: RepairStatus
  timestamp: string
  description: string
}

export interface RepairOrder {
  id: string
  residentId: string
  title: string
  description: string
  priority: RepairPriority
  status: RepairStatus
  createdAt: string
  assignedWorkerId: string | null
  images: string[]
  progress: RepairProgress[]
}

export interface MaintenanceWorker {
  id: string
  name: string
  phone: string
  specialty: string
  latitude: number
  longitude: number
  status: WorkerStatus
  eta: string | null
  currentOrderId: string | null
}

export interface DashboardStats {
  collectionRate: number
  repairTimelyRate: number
  overdueCount: number
  monthlyRepairCount: number
  totalResidents: number
  totalCollected: number
  totalOutstanding: number
}

export interface ActivityItem {
  id: string
  type: 'payment' | 'repair' | 'system'
  title: string
  description: string
  timestamp: string
}

export interface PaymentFilter {
  building: string
  unit: string
  name: string
  status: PaymentStatus | ''
}

export interface RepairFilter {
  status: RepairStatus | ''
  priority: RepairPriority | ''
  keyword: string
  workerId: string
}
