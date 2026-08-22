import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dentistId = session.dentistId
  if (!dentistId) return NextResponse.json({ stats: {}, recentPatients: [], todayAppointments: [] })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalPatients, newPatients, todayAppointments, activeTreatments, completedTreatments, recentPatients, todayAppts] = await Promise.all([
    prisma.patient.count({ where: { dentistId, isArchived: false } }),
    prisma.patient.count({ where: { dentistId, isArchived: false, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.appointment.count({ where: { dentistId, date: { gte: today, lt: tomorrow } } }),
    prisma.treatment.count({ where: { visit: { dentistId }, status: 'in_progress' } }),
    prisma.treatment.count({ where: { visit: { dentistId }, status: 'completed' } }),
    prisma.patient.findMany({
      where: { dentistId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { visits: { orderBy: { visitDate: 'desc' }, take: 1 } },
    }),
    prisma.appointment.findMany({
      where: { dentistId, date: { gte: today, lt: tomorrow } },
      orderBy: { time: 'asc' },
      take: 10,
    }),
  ])

  return NextResponse.json({
    stats: { totalPatients, newPatients, todayAppointments, activeTreatments, completedTreatments },
    recentPatients: recentPatients.map(p => ({
      id: p.id,
      fullName: p.fullName,
      phoneNumber: p.phoneNumber,
      patientId: p.patientId,
      lastVisit: p.visits[0]?.visitDate?.toISOString() || null,
    })),
    todayAppointments: todayAppts.map(a => ({
      id: a.id,
      patientName: a.patientName || 'Unknown',
      time: a.time,
      status: a.status,
    })),
  })
}
