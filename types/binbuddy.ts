export interface Family {
  id: string
  name: string
  email: string
  rotationOrder: number
}

export interface ScheduleAssignment {
  id: string
  weekNumber: number
  year: number
  status: 'ACTIVE' | 'SWAPPED'
  family: Family
  isCurrent: boolean
  isPast: boolean
}

export interface SwapRequest {
  id: string
  weekNumber: number
  toWeekNumber: number
  year: number
  fromFamilyId: string
  toFamilyId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  fromFamily: Family
  toFamily: Family
}

export type Snack = { msg: string; severity: 'success' | 'error' | 'info' }

export interface ConfirmState {
  title: string
  body: string
  confirmLabel: string
  confirmColor?: 'primary' | 'error' | 'success' | 'warning'
  onConfirm: () => void
}
