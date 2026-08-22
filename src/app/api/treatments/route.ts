import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { patientId, toothNumber, treatmentType, status, details, notes, dentalChartId } = body

  let visit = await prisma.visit.findFirst({
    where: { patientId, dentistId: session.dentistId, visitDate: { gte: new Date(new Date().setHours(0,0,0,0)) } },
  })

  if (!visit) {
    visit = await prisma.visit.create({
      data: { patientId, dentistId: session.dentistId },
    })
  }

  const treatment = await prisma.treatment.create({
    data: {
      visitId: visit.id,
      dentalChartId: dentalChartId || null,
      toothNumber: toothNumber || null,
      treatmentType,
      status: status || 'planned',
      details: details ? JSON.stringify(details) : null,
      notes: notes || null,
    },
  })

  return NextResponse.json({ ...treatment, createdAt: treatment.createdAt.toISOString() })
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  const where: any = { visit: { dentistId: session.dentistId } }
  if (patientId) where.visit = { ...where.visit, patientId }

  const treatments = await prisma.treatment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { visit: true },
  })

  return NextResponse.json(treatments.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    visit: { ...t.visit, visitDate: t.visit.visitDate.toISOString() },
  })))
}
