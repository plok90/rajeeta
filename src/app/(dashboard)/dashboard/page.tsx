'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'
import { Users, UserPlus, Calendar, Activity, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalPatients: number
  newPatients: number
  todayAppointments: number
  activeTreatments: number
  completedTreatments: number
}

interface RecentPatient {
  id: string
  fullName: string
  phoneNumber: string
  patientId: string
  lastVisit: string
}

interface RecentAppointment {
  id: string
  patientName: string
  time: string
  status: string
}

export default function DashboardPage() {
  const { t, locale } = useApp()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    newPatients: 0,
    todayAppointments: 0,
    activeTreatments: 0,
    completedTreatments: 0,
  })
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const [todayAppts, setTodayAppts] = useState<RecentAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => {
        if (r.status === 401) { window.location.href = '/'; return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        if (data.stats) setStats(data.stats)
        if (data.recentPatients) setRecentPatients(data.recentPatients)
        if (data.todayAppointments) setTodayAppts(data.todayAppointments)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: t.dashboard.totalPatients, value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
    { label: t.dashboard.newPatients, value: stats.newPatients, icon: UserPlus, color: 'bg-green-500' },
    { label: t.dashboard.todayAppointments, value: stats.todayAppointments, icon: Calendar, color: 'bg-purple-500' },
    { label: t.dashboard.activeTreatments, value: stats.activeTreatments, icon: Activity, color: 'bg-orange-500' },
    { label: t.dashboard.completedTreatments, value: stats.completedTreatments, icon: CheckCircle, color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : card.value}</p>
                <p className="text-xs text-muted">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.dashboard.recentPatients}</h2>
          {recentPatients.length === 0 ? (
            <p className="text-muted text-sm">{t.common.noData}</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-primary-light/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{p.fullName}</p>
                    <p className="text-xs text-muted">{p.phoneNumber}</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {p.patientId}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.dashboard.recentActivity}</h2>
          {todayAppts.length === 0 ? (
            <p className="text-muted text-sm">{t.appointments.noAppointments}</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-primary-light/20">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-primary" />
                    <div>
                      <p className="font-medium text-sm">{a.patientName}</p>
                      <p className="text-xs text-muted">{a.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    a.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {t.appointments[a.status as keyof typeof t.appointments] || a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
