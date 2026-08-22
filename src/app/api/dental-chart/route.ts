import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })

  const charts = await prisma.dentalChart.findMany({
    where: { patientId },
    orderBy: { toothPosition: 'asc' },
  })

  return NextResponse.json(charts.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  })))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { patientId, toothNumber, toothPosition, dentitionType, status, notes } = body

  if (!patientId || !toothNumber || !toothPosition) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.dentalChart.findFirst({
    where: { patientId, toothNumber, dentitionType: dentitionType || 'permanent' },
  })

  let chart
  if (existing) {
    chart = await prisma.dentalChart.update({
      where: { id: existing.id },
      data: {
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
    })
  } else {
    chart = await prisma.dentalChart.create({
      data: {
        patientId,
        toothNumber,
        toothPosition,
        dentitionType: dentitionType || 'permanent',
        status: status || 'healthy',
        notes: notes || null,
      },
    })
  }

  return NextResponse.json({ ...chart, createdAt: chart.createdAt.toISOString() })
}
