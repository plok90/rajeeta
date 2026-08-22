import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { calculateAge } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const archived = searchParams.get('archived') === 'true'

  const where: any = { dentistId: session.dentistId, isArchived: archived }

  if (query) {
    where.OR = [
      { fullName: { contains: query } },
      { phoneNumber: { contains: query } },
      { patientId: { contains: query } },
    ]
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { visits: { orderBy: { visitDate: 'desc' }, take: 1 } },
  })

  return NextResponse.json(patients.map(p => ({
    ...p,
    dateOfBirth: p.dateOfBirth.toISOString(),
    firstVisitDate: p.firstVisitDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    lastVisit: p.visits[0]?.visitDate?.toISOString() || null,
  })))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session?.dentistId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, phoneNumber, gender, dateOfBirth, medicalNotes, allergies, generalNotes } = body

  if (!fullName || !phoneNumber || !gender || !dateOfBirth) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const lastPatient = await prisma.patient.findFirst({
    where: { dentistId: session.dentistId },
    orderBy: { createdAt: 'desc' },
  })

  const nextNum = lastPatient ? parseInt(lastPatient.patientId.replace('P-', '')) + 1 : 1
  const patientId = `P-${String(nextNum).padStart(3, '0')}`

  const dob = new Date(dateOfBirth)
  const age = calculateAge(dob)

  const patient = await prisma.patient.create({
    data: {
      dentistId: session.dentistId,
      patientId,
      fullName,
      phoneNumber,
      gender,
      dateOfBirth: dob,
      age,
      medicalNotes: medicalNotes || null,
      allergies: allergies || null,
      generalNotes: generalNotes || null,
    },
  })

  return NextResponse.json({ ...patient, dateOfBirth: patient.dateOfBirth.toISOString(), firstVisitDate: patient.firstVisitDate.toISOString(), createdAt: patient.createdAt.toISOString() })
}
