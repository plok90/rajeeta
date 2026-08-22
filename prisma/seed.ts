import { PrismaClient } from '../src/generated/prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(__dirname, '..', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12)
  const dentistPassword = await bcrypt.hash('dentist123', 12)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      name: 'Administrator',
    },
  })

  const dentistUser = await prisma.user.upsert({
    where: { username: 'dr.ahmed' },
    update: {},
    create: {
      username: 'dr.ahmed',
      password: dentistPassword,
      role: 'dentist',
      name: 'Dr. Ahmed',
    },
  })

  const dentist = await prisma.dentist.upsert({
    where: { userId: dentistUser.id },
    update: {},
    create: {
      userId: dentistUser.id,
      name: 'Dr. Ahmed Mohammed',
      phone: '+966501234567',
      email: 'dr.ahmed@example.com',
      specialty: 'General Dentistry',
    },
  })

  const patient1 = await prisma.patient.create({
    data: {
      dentistId: dentist.id,
      patientId: 'P-001',
      fullName: 'Sara Al-Harbi',
      phoneNumber: '+966551112222',
      gender: 'female',
      dateOfBirth: new Date('1990-05-15'),
      age: 36,
      firstVisitDate: new Date('2026-01-10'),
      medicalNotes: 'No chronic conditions',
      allergies: 'Penicillin',
    },
  })

  const patient2 = await prisma.patient.create({
    data: {
      dentistId: dentist.id,
      patientId: 'P-002',
      fullName: 'Khalid Al-Otaibi',
      phoneNumber: '+966552223333',
      gender: 'male',
      dateOfBirth: new Date('1985-08-22'),
      age: 40,
      firstVisitDate: new Date('2026-03-05'),
      medicalNotes: 'Diabetes Type 2',
    },
  })

  const patient3 = await prisma.patient.create({
    data: {
      dentistId: dentist.id,
      patientId: 'P-003',
      fullName: 'Fatima Al-Saud',
      phoneNumber: '+966553334444',
      gender: 'female',
      dateOfBirth: new Date('2015-02-10'),
      age: 11,
      firstVisitDate: new Date('2026-06-20'),
    },
  })

  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      dentistId: dentist.id,
      visitDate: new Date('2026-08-22'),
      notes: 'Regular checkup',
    },
  })

  await prisma.visit.create({
    data: {
      patientId: patient2.id,
      dentistId: dentist.id,
      visitDate: new Date('2026-08-20'),
      notes: 'Pain in upper right molar',
    },
  })

  await prisma.dentalChart.create({
    data: {
      patientId: patient1.id,
      toothNumber: '16',
      toothPosition: 'UR-6',
      dentitionType: 'permanent',
      status: 'caries',
    },
  })

  await prisma.dentalChart.create({
    data: {
      patientId: patient1.id,
      toothNumber: '26',
      toothPosition: 'UL-6',
      dentitionType: 'permanent',
      status: 'healthy',
    },
  })

  await prisma.dentalChart.create({
    data: {
      patientId: patient1.id,
      toothNumber: '36',
      toothPosition: 'LL-6',
      dentitionType: 'permanent',
      status: 'root_canal_treated',
    },
  })

  await prisma.treatment.create({
    data: {
      visitId: visit1.id,
      toothNumber: '16',
      treatmentType: 'composite_filling',
      status: 'planned',
      details: JSON.stringify({ surface: 'MOD', material: 'Composite', shade: 'A2' }),
      notes: 'Schedule next visit for filling',
    },
  })

  await prisma.appointment.create({
    data: {
      dentistId: dentist.id,
      patientId: patient1.id,
      patientName: 'Sara Al-Harbi',
      patientPhone: '+966551112222',
      date: new Date('2026-08-25'),
      time: '10:00',
      duration: 45,
      status: 'scheduled',
      notes: 'Composite filling for tooth 16',
    },
  })

  await prisma.appointment.create({
    data: {
      dentistId: dentist.id,
      patientId: patient3.id,
      patientName: 'Fatima Al-Saud',
      patientPhone: '+966553334444',
      date: new Date(),
      time: '14:00',
      duration: 30,
      status: 'scheduled',
      notes: 'Routine checkup',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
