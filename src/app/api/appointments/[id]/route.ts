import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.appointment.findFirst({ where: { id, dentistId: session.dentistId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updateData: any = {}
  if (body.date) updateData.date = new Date(body.date)
  if (body.time) updateData.time = body.time
  if (body.duration) updateData.duration = body.duration
  if (body.status) updateData.status = body.status
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.patientId !== undefined) updateData.patientId = body.patientId
  if (body.patientName !== undefined) updateData.patientName = body.patientName
  if (body.patientPhone !== undefined) updateData.patientPhone = body.patientPhone

  const appointment = await prisma.appointment.update({ where: { id }, data: updateData })

  return NextResponse.json({ ...appointment, date: appointment.date.toISOString(), createdAt: appointment.createdAt.toISOString() })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.appointment.findFirst({ where: { id, dentistId: session.dentistId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.appointment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
