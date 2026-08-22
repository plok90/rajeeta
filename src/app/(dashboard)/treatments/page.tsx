'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/app/providers'

const treatmentLabels: Record<string, string> = {
  composite_filling: 'Composite Filling', amalgam_filling: 'Amalgam Filling',
  gic_filling: 'GIC Filling', root_canal: 'Root Canal', extraction: 'Extraction',
  implant: 'Implant', crown: 'Crown', bridge: 'Bridge', veneer: 'Veneer',
  scaling: 'Scaling', whitening: 'Whitening', periodontal: 'Periodontal',
  fissure_sealant: 'Sealant', temporary_filling: 'Temp Filling', other: 'Other',
}

const statusColors: Record<string, string> = {
  planned: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-700',
  on_hold: 'bg-orange-100 text-orange-700',
}

export default function TreatmentsPage() {
  const { t } = useApp()
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/treatments')
      .then(res => res.json())
      .then(data => setTreatments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center p-8">{t.common.loading}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.treatments.title}</h1>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tooth</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {treatments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">{t.common.noData}</td></tr>
              ) : treatments.map((tr: any) => (
                <tr key={tr.id}>
                  <td className="font-medium">{tr.toothNumber || '-'}</td>
                  <td>{t.treatments.types[tr.treatmentType as keyof typeof t.treatments.types] || tr.treatmentType}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[tr.status] || ''}`}>
                      {t.treatments.status[tr.status as keyof typeof t.treatments.status] || tr.status}
                    </span>
                  </td>
                  <td>{new Date(tr.createdAt).toLocaleDateString()}</td>
                  <td className="text-muted text-sm">{tr.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
