'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/app/providers'
import { Search, Eye } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  fullName: string
  phoneNumber: string
  gender: string
  age: number
  lastVisit: string | null
}

export default function SearchPatientsPage() {
  const { t } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.sidebar.searchPatients}</h1>

      <div className="card">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t.patients.search}
              className="input"
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn btn-primary">
            <Search size={16} />
            {loading ? t.common.loading : t.sidebar.searchPatients}
          </button>
        </div>
      </div>

      {searched && (
        <div className="card">
          {results.length === 0 ? (
            <p className="text-center text-muted py-8">{t.patients.noPatients}</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t.patients.patientId}</th>
                    <th>{t.patients.fullName}</th>
                    <th>{t.patients.phoneNumber}</th>
                    <th>{t.patients.age}</th>
                    <th>{t.patients.lastVisit}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-sm">{p.patientId}</td>
                      <td className="font-medium">{p.fullName}</td>
                      <td>{p.phoneNumber}</td>
                      <td>{p.age}</td>
                      <td>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : '-'}</td>
                      <td>
                        <Link href={`/patients/${p.id}`} className="btn btn-secondary text-xs p-1">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
