import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { calculateAge } from '@/lib/utils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const patient = await prisma.patient.findFirst({
    where: { id, dentistId: session.dentistId },
    include: {
      visits: { orderBy: { visitDate: 'desc' }, include: { treatments: true } },
      dentalCharts: true,
      appointments: { orderBy: { date: 'desc' } },
      files: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  return NextResponse.json({
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString(),
    firstVisitDate: patient.firstVisitDate.toISOString(),
    createdAt: patient.createdAt.toISOString(),
    visits: patient.visits.map(v => ({
      ...v,
      visitDate: v.visitDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
      treatments: v.treatments.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
    })),
    dentalCharts: patient.dentalCharts.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    appointments: patient.appointments.map(a => ({
      ...a,
      date: a.date.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
    files: patient.files.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    })),
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.patient.findFirst({ where: { id, dentistId: session.dentistId } })
  if (!existing) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  const updateData: any = {}
  if (body.fullName) updateData.fullName = body.fullName
  if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber
  if (body.gender) updateData.gender = body.gender
  if (body.dateOfBirth) {
    updateData.dateOfBirth = new Date(body.dateOfBirth)
    updateData.age = calculateAge(new Date(body.dateOfBirth))
  }
  if (body.medicalNotes !== undefined) updateData.medicalNotes = body.medicalNotes
  if (body.allergies !== undefined) updateData.allergies = body.allergies
  if (body.generalNotes !== undefined) updateData.generalNotes = body.generalNotes
  if (body.isArchived !== undefined) updateData.isArchived = body.isArchived

  const patient = await prisma.patient.update({ where: { id }, data: updateData })

  return NextResponse.json({
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString(),
    firstVisitDate: patient.firstVisitDate.toISOString(),
    createdAt: patient.createdAt.toISOString(),
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.patient.findFirst({ where: { id, dentistId: session.dentistId } })
  if (!existing) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  await prisma.patient.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
