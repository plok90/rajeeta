export interface SessionUser {
  id: string
  username: string
  role: 'admin' | 'dentist'
  name: string
  dentistId?: string
}

export interface PatientData {
  id: string
  dentistId: string
  patientId: string
  fullName: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
  age: number
  firstVisitDate: string
  medicalNotes?: string
  allergies?: string
  generalNotes?: string
  isArchived: boolean
  createdAt: string
}

export interface VisitData {
  id: string
  patientId: string
  visitDate: string
  notes?: string
  treatments: TreatmentData[]
}

export interface TreatmentData {
  id: string
  visitId: string
  dentalChartId?: string
  toothNumber?: string
  treatmentType: string
  status: string
  details?: string
  notes?: string
}

export interface DentalChartData {
  id: string
  patientId: string
  toothNumber: string
  toothPosition: string
  dentitionType: string
  status: string
  notes?: string
}

export interface AppointmentData {
  id: string
  dentistId: string
  patientId?: string
  patientName?: string
  patientPhone?: string
  date: string
  time: string
  duration: number
  status: string
  notes?: string
}

export type ToothStatus =
  | 'healthy'
  | 'caries'
  | 'fractured'
  | 'missing'
  | 'requires_treatment'
  | 'treatment_in_progress'
  | 'treated'
  | 'root_canal_treated'
  | 'crown'
  | 'implant'

export type TreatmentType =
  | 'composite_filling'
  | 'amalgam_filling'
  | 'gic_filling'
  | 'root_canal'
  | 'extraction'
  | 'implant'
  | 'crown'
  | 'bridge'
  | 'veneer'
  | 'scaling'
  | 'whitening'
  | 'periodontal'
  | 'fissure_sealant'
  | 'temporary_filling'
  | 'other'

export type Quadrant = 'UR' | 'UL' | 'LL' | 'LR'
export type DentitionType = 'permanent' | 'primary'
