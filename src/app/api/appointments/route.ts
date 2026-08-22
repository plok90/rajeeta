import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const today = searchParams.get('today') === 'true'

  const where: any = { dentistId: session.dentistId }

  if (today) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  } else if (date) {
    const d = new Date(date)
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { time: 'asc' },
  })

  return NextResponse.json(appointments.map(a => ({
    ...a,
    date: a.date.toISOString(),
    createdAt: a.createdAt.toISOString(),
  })))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { patientId, patientName, patientPhone, date, time, duration, notes } = body

  if (!date || !time) {
    return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      dentistId: session.dentistId,
      patientId: patientId || null,
      patientName: patientName || null,
      patientPhone: patientPhone || null,
      date: new Date(date),
      time,
      duration: duration || 30,
      notes: notes || null,
    },
  })

  return NextResponse.json({ ...appointment, date: appointment.date.toISOString(), createdAt: appointment.createdAt.toISOString() })
}
