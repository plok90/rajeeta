'use client'

import { useApp } from '@/app/providers'
import { TrendingUp, Users, Calendar, FileText } from 'lucide-react'

export default function ReportsPage() {
  const { t } = useApp()

  const stats = [
    { title: t.dashboard.totalPatients, icon: Users },
    { title: t.dashboard.todayAppointments, icon: Calendar },
    { title: t.dashboard.activeTreatments, icon: FileText },
    { title: t.dashboard.completedTreatments, icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.reports.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">{t.reports.title}</h3>
        <p className="text-muted text-sm text-center py-8">{t.common.noData}</p>
      </div>
    </div>
  )
}
