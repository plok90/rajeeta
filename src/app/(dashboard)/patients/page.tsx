'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/app/providers'
import { Plus, Search, Archive, ArchiveRestore, Eye } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  fullName: string
  phoneNumber: string
  gender: string
  age: number
  isArchived: boolean
  lastVisit: string | null
}

export default function PatientsPage() {
  const { t, locale } = useApp()
  const [patients, setPatients] = useState<Patient[]>([])
  const [archived, setArchived] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchPatients = () => {
    setLoading(true)
    fetch(`/patients?archived=${archived}`)
      .then(r => r.json())
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPatients() }, [archived])

  const handleArchive = async (id: string, isArchived: boolean) => {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived }),
    })
    fetchPatients()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.patients.title}</h1>
        <div className="flex gap-2">
          <button onClick={() => setArchived(!archived)} className="btn btn-secondary">
            {archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {archived ? t.patients.active : t.patients.archived}
          </button>
          <Link href="/patients/new" className="btn btn-primary">
            <Plus size={16} />
            {t.patients.addPatient}
          </Link>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-muted py-8">{t.common.loading}</p>
        ) : patients.length === 0 ? (
          <p className="text-center text-muted py-8">{t.patients.noPatients}</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t.patients.patientId}</th>
                  <th>{t.patients.fullName}</th>
                  <th>{t.patients.phoneNumber}</th>
                  <th>{t.patients.gender}</th>
                  <th>{t.patients.age}</th>
                  <th>{t.patients.lastVisit}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-sm">{p.patientId}</td>
                    <td className="font-medium">{p.fullName}</td>
                    <td>{p.phoneNumber}</td>
                    <td>{p.gender === 'male' ? t.patients.male : t.patients.female}</td>
                    <td>{p.age}</td>
                    <td>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <Link href={`/patients/${p.id}`} className="btn btn-secondary text-xs p-1">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleArchive(p.id, !p.isArchived)} className="btn btn-secondary text-xs p-1">
                          {p.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
