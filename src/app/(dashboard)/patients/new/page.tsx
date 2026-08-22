'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import DentalChartSVG from '@/components/dental/DentalChartSVG'

interface TreatmentItem {
  id: string
  toothNumber: string
  treatmentType: string
  details: Record<string, unknown>
  notes: string
}

interface CompositeDetails {
  surfaces: string[]
  material: string
  shade: string
  anesthesia: boolean
  isolation: boolean
}

interface RootCanalDetails {
  numberOfCanals: number
  canalNames: string[]
  workingLengths: Record<string, string>
  pulpDiagnosis: string
  periapicalDiagnosis: string
  treatmentSession: string
  obturationMaterial: string
  obturationTechnique: string
}

interface CrownDetails {
  crownType: string
  material: string
  shade: string
  preparationDate: string
  impressionDate: string
  laboratory: string
}

interface ImplantDetails {
  systemBrand: string
  diameter: string
  length: string
  implantDate: string
  boneGrafting: boolean
  notes: string
}

const TREATMENT_CATEGORIES = [
  {
    category: 'Crowns',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    items: [
      { type: 'anatomic_crown', label: 'Anatomic Crown' },
      { type: 'coping', label: 'Coping' },
      { type: 'veneer', label: 'Veneer' },
    ],
  },
  {
    category: 'Fillings',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      { type: 'composite_filling', label: 'Composite Filling' },
      { type: 'amalgam_filling', label: 'Amalgam Filling' },
      { type: 'gic_filling', label: 'GIC Filling' },
    ],
  },
  {
    category: 'Endodontics',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    items: [
      { type: 'root_canal', label: 'Root Canal Treatment' },
    ],
  },
  {
    category: 'Surgical',
    color: 'bg-red-50 text-red-700 border-red-200',
    items: [
      { type: 'extraction', label: 'Extraction' },
    ],
  },
  {
    category: 'Prosthodontics',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    items: [
      { type: 'implant', label: 'Implant' },
      { type: 'bridge', label: 'Bridge' },
    ],
  },
  {
    category: 'Preventive',
    color: 'bg-green-50 text-green-700 border-green-200',
    items: [
      { type: 'scaling', label: 'Scaling / Cleaning' },
      { type: 'whitening', label: 'Whitening' },
    ],
  },
  {
    category: 'Other',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    items: [
      { type: 'other', label: 'Other' },
    ],
  },
]

const COMPOSITE_SURFACES = ['M', 'O', 'D', 'B', 'L', 'MO', 'DO', 'MOD']
const CANAL_NAMES = ['MB', 'DB', 'P', 'ML', 'DL']
const PULP_DIAGNOSES = ['Normal', 'Hyperplastic', 'Exposed', 'Necrotic', 'Calcified']
const PERIAPICAL_DIAGNOSES = ['Normal', 'Periodontitis', 'Abscess', 'Cyst']
const TREATMENT_SESSIONS = ['Session 1', 'Session 2', 'Session 3']
const CROWN_TYPES = ['Full', 'Partial', 'Onlay', 'Inlay']

const TOOTH_BADGE_COLORS: Record<string, string> = {
  anatomic_crown: 'bg-amber-100 text-amber-800 border-amber-300',
  coping: 'bg-amber-100 text-amber-800 border-amber-300',
  veneer: 'bg-amber-100 text-amber-800 border-amber-300',
  composite_filling: 'bg-blue-100 text-blue-800 border-blue-300',
  amalgam_filling: 'bg-blue-100 text-blue-800 border-blue-300',
  gic_filling: 'bg-blue-100 text-blue-800 border-blue-300',
  root_canal: 'bg-purple-100 text-purple-800 border-purple-300',
  extraction: 'bg-red-100 text-red-800 border-red-300',
  implant: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  bridge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  scaling: 'bg-green-100 text-green-800 border-green-300',
  whitening: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
}

function getTreatmentLabel(type: string): string {
  for (const cat of TREATMENT_CATEGORIES) {
    const found = cat.items.find((i) => i.type === type)
    if (found) return found.label
  }
  return type
}

export default function NewPatientPage() {
  const { t } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('male')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [notes, setNotes] = useState('')

  const visitDateTime = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const h = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
  }, [])

  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string | null>(null)
  const [treatmentNotes, setTreatmentNotes] = useState('')

  const [compositeDetails, setCompositeDetails] = useState<CompositeDetails>({
    surfaces: [],
    material: '',
    shade: '',
    anesthesia: false,
    isolation: false,
  })

  const [rootCanalDetails, setRootCanalDetails] = useState<RootCanalDetails>({
    numberOfCanals: 1,
    canalNames: ['MB'],
    workingLengths: {},
    pulpDiagnosis: 'Normal',
    periapicalDiagnosis: 'Normal',
    treatmentSession: 'Session 1',
    obturationMaterial: '',
    obturationTechnique: '',
  })

  const [crownDetails, setCrownDetails] = useState<CrownDetails>({
    crownType: 'Full',
    material: '',
    shade: '',
    preparationDate: '',
    impressionDate: '',
    laboratory: '',
  })

  const [implantDetails, setImplantDetails] = useState<ImplantDetails>({
    systemBrand: '',
    diameter: '',
    length: '',
    implantDate: '',
    boneGrafting: false,
    notes: '',
  })

  const [treatments, setTreatments] = useState<TreatmentItem[]>([])

  const handleToothClick = (toothNumber: string) => {
    setSelectedTooth(toothNumber)
    setSelectedTreatmentType(null)
    setTreatmentNotes('')
    resetDynamicForms()
  }

  const resetDynamicForms = () => {
    setCompositeDetails({ surfaces: [], material: '', shade: '', anesthesia: false, isolation: false })
    setRootCanalDetails({
      numberOfCanals: 1,
      canalNames: ['MB'],
      workingLengths: {},
      pulpDiagnosis: 'Normal',
      periapicalDiagnosis: 'Normal',
      treatmentSession: 'Session 1',
      obturationMaterial: '',
      obturationTechnique: '',
    })
    setCrownDetails({ crownType: 'Full', material: '', shade: '', preparationDate: '', impressionDate: '', laboratory: '' })
    setImplantDetails({ systemBrand: '', diameter: '', length: '', implantDate: '', boneGrafting: false, notes: '' })
  }

  const toggleCompositeSurface = (surface: string) => {
    setCompositeDetails((prev) => ({
      ...prev,
      surfaces: prev.surfaces.includes(surface)
        ? prev.surfaces.filter((s) => s !== surface)
        : [...prev.surfaces, surface],
    }))
  }

  const toggleCanalName = (name: string) => {
    setRootCanalDetails((prev) => {
      const names = prev.canalNames.includes(name)
        ? prev.canalNames.filter((n) => n !== name)
        : [...prev.canalNames, name]
      return { ...prev, canalNames: names, numberOfCanals: names.length }
    })
  }

  const addTreatment = () => {
    if (!selectedTooth || !selectedTreatmentType) return

    let details: Record<string, unknown> = {}
    if (selectedTreatmentType === 'composite_filling') {
      details = { ...compositeDetails }
    } else if (selectedTreatmentType === 'root_canal') {
      details = { ...rootCanalDetails }
    } else if (['anatomic_crown', 'coping', 'veneer'].includes(selectedTreatmentType)) {
      details = { ...crownDetails }
    } else if (selectedTreatmentType === 'implant') {
      details = { ...implantDetails }
    }

    const newTreatment: TreatmentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      toothNumber: selectedTooth,
      treatmentType: selectedTreatmentType,
      details,
      notes: treatmentNotes,
    }

    setTreatments((prev) => [...prev, newTreatment])
    setSelectedTreatmentType(null)
    setTreatmentNotes('')
    resetDynamicForms()
  }

  const removeTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((tr) => tr.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/patients/create-with-treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phoneNumber,
          gender,
          dateOfBirth,
          notes,
          treatments: treatments.map((tr) => ({
            toothNumber: tr.toothNumber,
            treatmentType: tr.treatmentType,
            details: tr.details,
            notes: tr.notes,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create patient')
        return
      }

      router.push('/patients')
    } catch {
      setError('Failed to create patient')
    } finally {
      setLoading(false)
    }
  }

  const renderDynamicForm = () => {
    if (!selectedTreatmentType) return null

    if (selectedTreatmentType === 'composite_filling') {
      return (
        <div className="space-y-3 mt-3 border-t border-border pt-3">
          <div>
            <label className="label">{t.treatments.composite.surface}</label>
            <div className="flex flex-wrap gap-2">
              {COMPOSITE_SURFACES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleCompositeSurface(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    compositeDetails.surfaces.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.composite.material}</label>
              <input
                type="text"
                value={compositeDetails.material}
                onChange={(e) => setCompositeDetails({ ...compositeDetails, material: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.treatments.composite.shade}</label>
              <input
                type="text"
                value={compositeDetails.shade}
                onChange={(e) => setCompositeDetails({ ...compositeDetails, shade: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={compositeDetails.anesthesia}
                onChange={(e) => setCompositeDetails({ ...compositeDetails, anesthesia: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
              {t.treatments.composite.anesthesia}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={compositeDetails.isolation}
                onChange={(e) => setCompositeDetails({ ...compositeDetails, isolation: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
              />
              {t.treatments.composite.isolation}
            </label>
          </div>
        </div>
      )
    }

    if (selectedTreatmentType === 'root_canal') {
      return (
        <div className="space-y-3 mt-3 border-t border-border pt-3">
          <div>
            <label className="label">{t.treatments.rootCanal.canalNames}</label>
            <div className="flex flex-wrap gap-2">
              {CANAL_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCanalName(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    rootCanalDetails.canalNames.includes(name)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          {rootCanalDetails.canalNames.map((name) => (
            <div key={name}>
              <label className="label">{t.treatments.rootCanal.workingLength} ({name})</label>
              <input
                type="text"
                value={rootCanalDetails.workingLengths[name] || ''}
                onChange={(e) =>
                  setRootCanalDetails({
                    ...rootCanalDetails,
                    workingLengths: { ...rootCanalDetails.workingLengths, [name]: e.target.value },
                  })
                }
                className="input"
                placeholder="mm"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.rootCanal.pulpDiagnosis}</label>
              <select
                value={rootCanalDetails.pulpDiagnosis}
                onChange={(e) => setRootCanalDetails({ ...rootCanalDetails, pulpDiagnosis: e.target.value })}
                className="input"
              >
                {PULP_DIAGNOSES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.treatments.rootCanal.periapicalDiagnosis}</label>
              <select
                value={rootCanalDetails.periapicalDiagnosis}
                onChange={(e) => setRootCanalDetails({ ...rootCanalDetails, periapicalDiagnosis: e.target.value })}
                className="input"
              >
                {PERIAPICAL_DIAGNOSES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t.treatments.rootCanal.treatmentSession}</label>
            <select
              value={rootCanalDetails.treatmentSession}
              onChange={(e) => setRootCanalDetails({ ...rootCanalDetails, treatmentSession: e.target.value })}
              className="input"
            >
              {TREATMENT_SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.rootCanal.obturationMaterial}</label>
              <input
                type="text"
                value={rootCanalDetails.obturationMaterial}
                onChange={(e) => setRootCanalDetails({ ...rootCanalDetails, obturationMaterial: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.treatments.rootCanal.obturationTechnique}</label>
              <input
                type="text"
                value={rootCanalDetails.obturationTechnique}
                onChange={(e) => setRootCanalDetails({ ...rootCanalDetails, obturationTechnique: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>
      )
    }

    if (['anatomic_crown', 'coping', 'veneer'].includes(selectedTreatmentType)) {
      return (
        <div className="space-y-3 mt-3 border-t border-border pt-3">
          <div>
            <label className="label">{t.treatments.crown.crownType}</label>
            <select
              value={crownDetails.crownType}
              onChange={(e) => setCrownDetails({ ...crownDetails, crownType: e.target.value })}
              className="input"
            >
              {CROWN_TYPES.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.crown.material}</label>
              <input
                type="text"
                value={crownDetails.material}
                onChange={(e) => setCrownDetails({ ...crownDetails, material: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.treatments.crown.shade}</label>
              <input
                type="text"
                value={crownDetails.shade}
                onChange={(e) => setCrownDetails({ ...crownDetails, shade: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.crown.preparationDate}</label>
              <input
                type="date"
                value={crownDetails.preparationDate}
                onChange={(e) => setCrownDetails({ ...crownDetails, preparationDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.treatments.crown.impressionDate}</label>
              <input
                type="date"
                value={crownDetails.impressionDate}
                onChange={(e) => setCrownDetails({ ...crownDetails, impressionDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">{t.treatments.crown.laboratory}</label>
            <input
              type="text"
              value={crownDetails.laboratory}
              onChange={(e) => setCrownDetails({ ...crownDetails, laboratory: e.target.value })}
              className="input"
            />
          </div>
        </div>
      )
    }

    if (selectedTreatmentType === 'implant') {
      return (
        <div className="space-y-3 mt-3 border-t border-border pt-3">
          <div>
            <label className="label">{t.treatments.implant.system}</label>
            <input
              type="text"
              value={implantDetails.systemBrand}
              onChange={(e) => setImplantDetails({ ...implantDetails, systemBrand: e.target.value })}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.treatments.implant.diameter}</label>
              <input
                type="text"
                value={implantDetails.diameter}
                onChange={(e) => setImplantDetails({ ...implantDetails, diameter: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.treatments.implant.length}</label>
              <input
                type="text"
                value={implantDetails.length}
                onChange={(e) => setImplantDetails({ ...implantDetails, length: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">{t.treatments.implant.implantDate}</label>
            <input
              type="date"
              value={implantDetails.implantDate}
              onChange={(e) => setImplantDetails({ ...implantDetails, implantDate: e.target.value })}
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={implantDetails.boneGrafting}
              onChange={(e) => setImplantDetails({ ...implantDetails, boneGrafting: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
            />
            {t.treatments.implant.boneGrafting}
          </label>
          <div>
            <label className="label">{t.treatments.notes}</label>
            <textarea
              value={implantDetails.notes}
              onChange={(e) => setImplantDetails({ ...implantDetails, notes: e.target.value })}
              className="input min-h-[60px]"
              rows={2}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3 mt-3 border-t border-border pt-3">
        <div>
          <label className="label">{t.treatments.notes}</label>
          <textarea
            value={treatmentNotes}
            onChange={(e) => setTreatmentNotes(e.target.value)}
            className="input min-h-[60px]"
            rows={2}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="btn btn-secondary p-2">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold">{t.patients.addPatient}</h1>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:bg-danger/10 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card space-y-4">
              <div>
                <label className="label">{t.patients.fullName} *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.patients.phoneNumber} *</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">{t.patients.gender} *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="male">{t.patients.male}</option>
                    <option value="female">{t.patients.female}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.patients.dateOfBirth} *</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Visit Date/Time</label>
                  <input
                    type="datetime-local"
                    value={visitDateTime}
                    readOnly
                    className="input bg-muted/10 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t.patients.medicalNotes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            {treatments.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-sm mb-3 text-foreground">Selected Treatments ({treatments.length})</h3>
                <div className="space-y-2">
                  {treatments.map((tr) => (
                    <div
                      key={tr.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${TOOTH_BADGE_COLORS[tr.treatmentType] || 'bg-gray-50 text-gray-800 border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm shrink-0">#{tr.toothNumber}</span>
                        <span className="text-xs truncate">{getTreatmentLabel(tr.treatmentType)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTreatment(tr.id)}
                        className="p-1 rounded hover:bg-black/10 shrink-0 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
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

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 text-foreground">{t.dentalChart.title}</h3>
              <DentalChartSVG
                onToothClick={handleToothClick}
                selectedTooth={selectedTooth || undefined}
              />
            </div>

            {selectedTooth && (
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    Tooth #{selectedTooth}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setSelectedTooth(null); setSelectedTreatmentType(null); resetDynamicForms() }}
                    className="p-1 rounded hover:bg-muted/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {TREATMENT_CATEGORIES.map((cat) => (
                    <div key={cat.category}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1 ${cat.color.split(' ').slice(1).join(' ')}`}>
                        {cat.category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => { setSelectedTreatmentType(item.type); setTreatmentNotes(''); resetDynamicForms() }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              selectedTreatmentType === item.type
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : `bg-card text-foreground border-border hover:border-primary/50 hover:shadow-sm`
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTreatmentType && (
                  <div className="mt-4">
                    {renderDynamicForm()}
                    {selectedTreatmentType !== 'composite_filling' &&
                      selectedTreatmentType !== 'root_canal' &&
                      !['anatomic_crown', 'coping', 'veneer'].includes(selectedTreatmentType) &&
                      selectedTreatmentType !== 'implant' && (
                      <div className="mt-3">
                        <label className="label">{t.treatments.notes}</label>
                        <textarea
                          value={treatmentNotes}
                          onChange={(e) => setTreatmentNotes(e.target.value)}
                          className="input min-h-[60px]"
                          rows={2}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addTreatment}
                      className="btn btn-primary w-full mt-3"
                    >
                      <Plus size={16} />
                      {t.treatments.addTreatment}
                    </button>
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
