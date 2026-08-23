'use client'
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'
import { ArrowLeft, X, Trash2, Check, CalendarDays, Stethoscope, FileText } from 'lucide-react'
import Link from 'next/link'
import DentalChartSVG from '@/components/dental/DentalChartSVG'

type SimpleTreatment = 'filling' | 'rootFilling' | 'prosthesis' | 'crown' | 'extraction' | 'monitoring'

interface PerToothTreatment {
  type: SimpleTreatment | ''
  canalLength: string
  canalsCount: string
  surface: string
  material: string
  shade: string
  reason: string
}

const EMPTY_TOOTH: PerToothTreatment = { type: '', canalLength: '', canalsCount: '', surface: '', material: '', shade: '', reason: '' }

const SIMPLE_TREATMENT_KEYS: SimpleTreatment[] = ['filling', 'rootFilling', 'prosthesis', 'crown', 'extraction', 'monitoring']

function getToothLabel(toothNumber: string): string {
  const num = parseInt(toothNumber, 10)
  if (num >= 11 && num <= 18) return `UR ${num - 10}`
  if (num >= 21 && num <= 28) return `UL ${num - 20}`
  if (num >= 31 && num <= 38) return `LL ${num - 30}`
  if (num >= 41 && num <= 48) return `LR ${num - 40}`
  return toothNumber
}

function getToothStatusesFromTreatments(toothTreatments: Record<string, PerToothTreatment>): Record<string, string> {
  const statuses: Record<string, string> = {}
  for (const [tooth, treatment] of Object.entries(toothTreatments)) {
    if (!treatment.type) continue
    if (treatment.type === 'extraction') statuses[tooth] = 'missing'
    else if (treatment.type === 'rootFilling') statuses[tooth] = 'root_canal_treated'
    else if (treatment.type === 'prosthesis' || treatment.type === 'crown') statuses[tooth] = 'crown'
    else statuses[tooth] = 'treatment_in_progress'
  }
  return statuses
}

function nowLocalISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

export default function NewPatientPage() {
  const router = useRouter()
  const { t } = useApp()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('male')
  const [dob, setDob] = useState('')
  const [visitDate, setVisitDate] = useState(nowLocalISO)
  const [prescribedTreatment, setPrescribedTreatment] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [allergies, setAllergies] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [toothTreatments, setToothTreatments] = useState<Record<string, PerToothTreatment>>({})
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toothStatuses = useMemo(() => getToothStatusesFromTreatments(toothTreatments), [toothTreatments])

  const documentedCount = useMemo(() => {
    return Object.values(toothTreatments).filter(tr => tr.type).length
  }, [toothTreatments])

  const handleToothSelect = useCallback((toothNumber: string) => {
    setSelectedTooth(prev => prev === toothNumber ? null : toothNumber)
  }, [])

  const updateToothTreatment = useCallback((key: keyof PerToothTreatment, value: string) => {
    if (!selectedTooth) return
    setToothTreatments(prev => ({
      ...prev,
      [selectedTooth]: { ...(prev[selectedTooth] ?? { ...EMPTY_TOOTH }), [key]: value },
    }))
  }, [selectedTooth])

  const removeToothTreatment = (toothNumber: string) => {
    setToothTreatments(prev => {
      const next = { ...prev }
      delete next[toothNumber]
      return next
    })
  }

  const currentTreatment: PerToothTreatment = selectedTooth ? (toothTreatments[selectedTooth] ?? { ...EMPTY_TOOTH }) : { ...EMPTY_TOOTH }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError(t.patients.nameAndPhoneRequired)
      return
    }
    setLoading(true)
    setError('')
    try {
      const treatmentsPayload: { toothNumber: string; treatmentType: string; details: Record<string, string> }[] = []
      for (const [toothNumber, treatment] of Object.entries(toothTreatments)) {
        if (!treatment.type) continue
        treatmentsPayload.push({
          toothNumber,
          treatmentType: treatment.type,
          details: {
            canalLength: treatment.canalLength,
            canalsCount: treatment.canalsCount,
            surface: treatment.surface,
            material: treatment.material,
            shade: treatment.shade,
            reason: treatment.reason,
          },
        })
      }

      const clinicalNotes = [
        chiefComplaint,
        medicalHistory,
        allergies,
        currentMedications,
        bloodPressure ? `BP: ${bloodPressure}` : '',
        heartRate ? `HR: ${heartRate}` : '',
        medicalNotes,
      ].filter(Boolean).join('\n')

      const response = await fetch('/api/patients/create-with-treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: name.trim(),
          phoneNumber: phone.trim(),
          gender,
          dateOfBirth: dob,
          visitDate,
          prescribedTreatment,
          notes: clinicalNotes || null,
          treatments: treatmentsPayload,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create patient')
      }
      router.push('/patients')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const tooth = selectedTooth ?? ''

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/patients" className="btn btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.patients.addPatient}</h1>
          <p className="text-muted text-sm">{t.patients.clinicalForm}</p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.patients.patientInfo}</h2>
                  <p className="text-muted text-xs">{t.patients.clinicalForm}</p>
                </div>
                <span className="text-xs text-muted">{t.patients.requiredFieldsNote}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">{t.patients.fullName} *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label">{t.patients.phoneNumber} *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="label">{t.patients.gender}</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input">
                    <option value="male">{t.patients.male}</option>
                    <option value="female">{t.patients.female}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t.patients.dateOfBirth} *</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input" required />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.patients.visitDetails}</h2>
                  <p className="text-muted text-xs">{t.patients.visitDetailsHint}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {t.patients.systemTime}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.patients.visitDateTime}</label>
                  <input type="datetime-local" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">{t.patients.prescribedTreatment}</label>
                  <input type="text" value={prescribedTreatment} onChange={e => setPrescribedTreatment(e.target.value)} className="input" placeholder={t.patients.prescribedTreatmentPlaceholder} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t.patients.doctorNotes}</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">{t.patients.chiefComplaint}</label>
                  <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className="input min-h-[60px]" rows={2} placeholder={t.patients.chiefComplaintPlaceholder} />
                </div>
                <div>
                  <label className="label">{t.patients.medicalHistory}</label>
                  <textarea value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} className="input min-h-[60px]" rows={2} placeholder={t.patients.medicalHistoryPlaceholder} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t.patients.allergies}</label>
                    <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} className="input" placeholder={t.patients.allergiesPlaceholder} />
                  </div>
                  <div>
                    <label className="label">{t.patients.currentMedications}</label>
                    <input type="text" value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} className="input" placeholder={t.patients.currentMedicationsPlaceholder} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t.patients.bloodPressure}</label>
                    <input type="text" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} className="input" placeholder="120/80" />
                  </div>
                  <div>
                    <label className="label">{t.patients.heartRate}</label>
                    <input type="text" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="input" placeholder="bpm" />
                  </div>
                </div>
                <div>
                  <label className="label">{t.patients.medicalNotes}</label>
                  <textarea value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} className="input min-h-[60px]" rows={2} placeholder={t.patients.clinicalNotesPlaceholder} />
                </div>
              </div>
            </div>

            {documentedCount > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t.patients.toothTreatmentsSummary} ({documentedCount})</h2>
                <div className="space-y-2">
                  {Object.entries(toothTreatments).map(([toothNum, tr]) => {
                    if (!tr.type) return null
                    return (
                      <div key={toothNum} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 border border-border">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-foreground">{getToothLabel(toothNum)}</span>
                          <span className="text-xs text-muted">{t.treatments.simple[tr.type as SimpleTreatment]}</span>
                        </div>
                        <button type="button" onClick={() => removeToothTreatment(toothNum)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? t.common.loading : t.common.save}
              </button>
              <Link href="/patients" className="btn btn-secondary">
                {t.common.cancel}
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.dentalChart.treatmentPlan}</h2>
                  <p className="text-muted text-xs">{t.dentalChart.treatmentPlanHint}</p>
                </div>
                <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
                  {documentedCount} {t.treatments.documentedTeeth}
                </span>
              </div>
              <DentalChartSVG
                toothStatuses={toothStatuses}
                onToothClick={handleToothSelect}
                selectedTooth={selectedTooth || undefined}
              />
              <div className="flex items-center gap-5 mt-3 text-xs text-muted justify-center">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-slate-300 bg-white inline-block" /> {t.dentalChart.legendHealthy}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-blue-600 bg-blue-50 inline-block" /> {t.dentalChart.legendSelected}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-orange-300 bg-orange-100 inline-block" /> {t.dentalChart.legendTreated}</span>
              </div>
              {!selectedTooth && (
                <p className="text-muted text-sm mt-3 text-center">{t.patients.clickToothHint}</p>
              )}
            </div>

            {selectedTooth && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold">
                    {t.treatments.selectedToothLabel}: {tooth}
                  </div>
                  <button type="button" onClick={() => setSelectedTooth(null)} className="p-1 text-muted hover:text-foreground hover:bg-muted/20 rounded transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <div>
                    <h3 className="text-sm font-semibold">{t.treatments.procedureForTooth} {tooth}</h3>
                    <p className="text-xs text-muted">{t.treatments.procedureSubtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SIMPLE_TREATMENT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateToothTreatment('type', currentTreatment.type === key ? '' : key)}
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-all ${
                        currentTreatment.type === key
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold ${
                        currentTreatment.type === key ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {t.treatments.simple.marks[key]}
                      </span>
                      <span>{t.treatments.simple[key]}</span>
                    </button>
                  ))}
                </div>

                {currentTreatment.type && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {currentTreatment.type === 'filling' && (
                      <>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.surface}</label>
                          <select value={currentTreatment.surface} onChange={e => updateToothTreatment('surface', e.target.value)} className="input text-sm">
                            <option value="">{t.treatments.selectTreatmentType}</option>
                            <option value="occlusal">{t.treatments.simple.surfaces.occlusal}</option>
                            <option value="buccal">{t.treatments.simple.surfaces.buccal}</option>
                            <option value="lingual">{t.treatments.simple.surfaces.lingual}</option>
                            <option value="interproximal">{t.treatments.simple.surfaces.interproximal}</option>
                          </select>
                        </div>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.fillingMaterial}</label>
                          <select value={currentTreatment.material} onChange={e => updateToothTreatment('material', e.target.value)} className="input text-sm">
                            <option value="">{t.treatments.selectTreatmentType}</option>
                            <option value="composite">{t.treatments.simple.materials.composite}</option>
                            <option value="amalgam">{t.treatments.simple.materials.amalgam}</option>
                            <option value="gic">{t.treatments.simple.materials.gic}</option>
                          </select>
                        </div>
                      </>
                    )}

                    {currentTreatment.type === 'rootFilling' && (
                      <>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.canalLength}</label>
                          <input type="text" value={currentTreatment.canalLength} onChange={e => updateToothTreatment('canalLength', e.target.value)} className="input text-sm" placeholder={t.treatments.simple.canalLengthPlaceholder} />
                        </div>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.canalsCount}</label>
                          <input type="number" min="1" max="6" value={currentTreatment.canalsCount} onChange={e => updateToothTreatment('canalsCount', e.target.value)} className="input text-sm" placeholder="3" />
                        </div>
                      </>
                    )}

                    {(currentTreatment.type === 'prosthesis' || currentTreatment.type === 'crown') && (
                      <>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.prosthesisType}</label>
                          <select value={currentTreatment.material} onChange={e => updateToothTreatment('material', e.target.value)} className="input text-sm">
                            <option value="">{t.treatments.selectTreatmentType}</option>
                            <option value="zirconia">{t.treatments.simple.prosthesisTypes.zirconia}</option>
                            <option value="ceramic">{t.treatments.simple.prosthesisTypes.ceramic}</option>
                            <option value="pfm">{t.treatments.simple.prosthesisTypes.pfm}</option>
                          </select>
                        </div>
                        <div>
                          <label className="label text-sm">{t.treatments.simple.shade}</label>
                          <input type="text" value={currentTreatment.shade} onChange={e => updateToothTreatment('shade', e.target.value)} className="input text-sm" placeholder={t.treatments.simple.shadePlaceholder} />
                        </div>
                      </>
                    )}

                    {currentTreatment.type === 'extraction' && (
                      <div>
                        <label className="label text-sm">{t.treatments.simple.reason}</label>
                        <input type="text" value={currentTreatment.reason} onChange={e => updateToothTreatment('reason', e.target.value)} className="input text-sm" placeholder={t.treatments.simple.reasonPlaceholder} />
                      </div>
                    )}

                    {currentTreatment.type && (
                      <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.treatments.savedToothNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  )
}