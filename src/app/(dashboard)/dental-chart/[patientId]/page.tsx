'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/app/providers'
import { ArrowLeft, Save, X } from 'lucide-react'

interface DentalChartEntry {
  id: string
  toothNumber: number
  toothPosition: string
  dentitionType: 'permanent' | 'primary'
  status: string
  notes: string
}

interface Patient {
  id: string
  fullName: string
  patientId: string
}

type ToothStatus = 'healthy' | 'caries' | 'fractured' | 'missing' | 'requires_treatment' | 'treatment_in_progress' | 'treated' | 'root_canal_treated' | 'crown' | 'implant'
type TreatmentType = 'composite_filling' | 'amalgam_filling' | 'gic_filling' | 'root_canal' | 'extraction' | 'implant' | 'crown' | 'bridge' | 'veneer' | 'scaling' | 'whitening' | 'periodontal' | 'fissure_sealant' | 'temporary_filling' | 'other'
type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'

const STATUS_COLORS: Record<ToothStatus, { bg: string; border: string; text: string }> = {
  healthy: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' },
  caries: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700' },
  fractured: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700' },
  missing: { bg: 'bg-gray-200', border: 'border-gray-400', text: 'text-gray-600' },
  requires_treatment: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-600' },
  treatment_in_progress: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
  treated: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-600' },
  root_canal_treated: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
  crown: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-700' },
  implant: { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-700' },
}

const PERMANENT_TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
}

const PRIMARY_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerLeft: [71, 72, 73, 74, 75],
  lowerRight: [85, 84, 83, 82, 81],
}

function getDisplayNumber(toothNumber: number): string {
  const pos = Math.floor(toothNumber / 10)
  const num = toothNumber % 10
  if (pos >= 5 && pos <= 8) {
    return String.fromCharCode(64 + num)
  }
  return String(num)
}

function getToothPosition(toothNumber: number): string {
  const firstDigit = Math.floor(toothNumber / 10)
  switch (firstDigit) {
    case 1: return 'upper_right'
    case 2: return 'upper_left'
    case 3: return 'lower_left'
    case 4: return 'lower_right'
    case 5: return 'upper_right'
    case 6: return 'upper_left'
    case 7: return 'lower_left'
    case 8: return 'lower_right'
    default: return 'upper_right'
  }
}

export default function DentalChartPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { t, dir } = useApp()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [chartEntries, setChartEntries] = useState<DentalChartEntry[]>([])
  const [dentitionType, setDentitionType] = useState<'permanent' | 'primary'>('permanent')
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [toothStatus, setToothStatus] = useState<ToothStatus>('healthy')
  const [toothNotes, setToothNotes] = useState('')
  const [treatmentType, setTreatmentType] = useState<TreatmentType>('composite_filling')
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentStatus>('planned')
  const [treatmentNotes, setTreatmentNotes] = useState('')

  const fetchPatient = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}`)
      if (res.ok) setPatient(await res.json())
    } catch {}
  }, [patientId])

  const fetchChart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dental-chart?patientId=${patientId}`)
      if (res.ok) {
        const data = await res.json()
        setChartEntries(data.filter((e: DentalChartEntry) => e.dentitionType === dentitionType))
      }
    } catch {
      setChartEntries([])
    } finally {
      setLoading(false)
    }
  }, [patientId, dentitionType])

  useEffect(() => { fetchPatient() }, [fetchPatient])
  useEffect(() => { fetchChart() }, [fetchChart])

  useEffect(() => {
    if (selectedTooth !== null) {
      const entry = chartEntries.find(e => e.toothNumber === selectedTooth)
      if (entry) {
        setToothStatus(entry.status as ToothStatus)
        setToothNotes(entry.notes || '')
      } else {
        setToothStatus('healthy')
        setToothNotes('')
      }
      setTreatmentType('composite_filling')
      setTreatmentStatus('planned')
      setTreatmentNotes('')
    }
  }, [selectedTooth, chartEntries])

  const handleSaveTooth = async () => {
    if (selectedTooth === null) return
    setSaving(true)
    try {
      const existingEntry = chartEntries.find(e => e.toothNumber === selectedTooth)

      const chartRes = await fetch('/api/dental-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(existingEntry ? { id: existingEntry.id } : {}),
          patientId,
          toothNumber: selectedTooth,
          toothPosition: getToothPosition(selectedTooth),
          dentitionType,
          status: toothStatus,
          notes: toothNotes,
        }),
      })

      if (chartRes.ok) {
        const savedEntry = await chartRes.json()

        if (toothStatus !== 'healthy') {
          await fetch('/api/treatments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId,
              toothNumber: selectedTooth,
              treatmentType,
              status: treatmentStatus,
              details: '',
              notes: treatmentNotes,
              dentalChartId: savedEntry.id,
            }),
          })
        }

        await fetchChart()
        setSelectedTooth(null)
      }
    } catch {}
    finally { setSaving(false) }
  }

  const getEntryForTooth = (toothNumber: number) => chartEntries.find(e => e.toothNumber === toothNumber)

  const quadrants = dentitionType === 'permanent' ? PERMANENT_TEETH : PRIMARY_TEETH

  const renderTooth = (toothNumber: number) => {
    const entry = getEntryForTooth(toothNumber)
    const status = (entry?.status || 'healthy') as ToothStatus
    const colors = STATUS_COLORS[status]
    const isSelected = selectedTooth === toothNumber
    const display = getDisplayNumber(toothNumber)

    return (
      <button
        key={toothNumber}
        onClick={() => setSelectedTooth(isSelected ? null : toothNumber)}
        className={`
          relative w-10 h-14 rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer
          ${colors.bg} ${colors.border} ${colors.text}
          ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}
        `}
      >
        <span className="text-sm font-bold">{display}</span>
        {entry && (
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border border-white" />
        )}
      </button>
    )
  }

  const renderQuadrant = (teeth: number[], label: string, isTop: boolean, isRight: boolean) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted font-medium">{label}</span>
      <div className={`flex gap-1 ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
        {teeth.map(tooth => renderTooth(tooth))}
      </div>
    </div>
  )

  const statuses = Object.keys(t.dentalChart.status) as ToothStatus[]
  const treatmentTypes = Object.keys(t.treatments.types) as TreatmentType[]
  const treatmentStatuses = Object.keys(t.treatments.status) as TreatmentStatus[]

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`} className="btn btn-secondary p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t.dentalChart.title}</h1>
          {patient && (
            <p className="text-muted text-sm">{patient.fullName} - {patient.patientId}</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setDentitionType('permanent')}
            className={`btn ${dentitionType === 'permanent' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.dentalChart.permanent}
          </button>
          <button
            onClick={() => setDentitionType('primary')}
            className={`btn ${dentitionType === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.dentalChart.primary}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-muted py-12">{t.common.loading}</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-8">
                {renderQuadrant(quadrants.upperRight, t.dentalChart.upperRight, true, true)}
                {renderQuadrant(quadrants.upperLeft, t.dentalChart.upperLeft, true, false)}
              </div>
              <div className="w-full max-w-md h-px bg-border" />
              <div className="flex gap-8">
                {renderQuadrant(quadrants.lowerRight, t.dentalChart.lowerRight, false, true)}
                {renderQuadrant(quadrants.lowerLeft, t.dentalChart.lowerLeft, false, false)}
              </div>
            </div>

            {selectedTooth !== null && (
              <div className="card bg-primary-light/30 border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {t.dentalChart.selectTooth} {getDisplayNumber(selectedTooth)}
                  </h3>
                  <button onClick={() => setSelectedTooth(null)} className="text-muted hover:text-foreground">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">{t.dentalChart.toothStatus}</label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(status => {
                        const colors = STATUS_COLORS[status]
                        return (
                          <button
                            key={status}
                            onClick={() => setToothStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                              ${toothStatus === status
                                ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ring-primary`
                                : `${colors.bg} ${colors.border} ${colors.text} opacity-60 hover:opacity-100`
                              }`}
                          >
                            {t.dentalChart.status[status]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="label">{t.dentalChart.selectTreatment}</label>
                    <select
                      value={treatmentType}
                      onChange={e => setTreatmentType(e.target.value as TreatmentType)}
                      className="input"
                    >
                      {treatmentTypes.map(type => (
                        <option key={type} value={type}>{t.treatments.types[type]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">{t.treatments.status.planned.split(' ')[0]}</label>
                    <div className="flex flex-wrap gap-2">
                      {treatmentStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => setTreatmentStatus(status)}
                          className={`btn text-xs ${treatmentStatus === status ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          {t.treatments.status[status]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">{t.treatments.notes}</label>
                    <textarea
                      value={treatmentNotes}
                      onChange={e => setTreatmentNotes(e.target.value)}
                      className="input min-h-[80px]"
                    />
                  </div>

                  <button
                    onClick={handleSaveTooth}
                    disabled={saving}
                    className="btn btn-primary w-full"
                  >
                    <Save size={16} />
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </div>
            )}

            {selectedTooth === null && (
              <p className="text-center text-muted py-4">{t.dentalChart.selectTooth}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
