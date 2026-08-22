import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.dentistId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientName, phoneNumber, gender, dateOfBirth, notes, treatments } = body;

    if (!patientName || !phoneNumber || !gender || !dateOfBirth) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lastPatient = await prisma.patient.findFirst({
      where: { dentistId: session.dentistId },
      orderBy: { createdAt: "desc" },
    });
    const nextNum = lastPatient ? parseInt(lastPatient.patientId.replace("P-", "")) + 1 : 1;
    const patientIdStr = `P-${String(nextNum).padStart(3, "0")}`;

    const dob = new Date(dateOfBirth);
    const age = Math.floor(
      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const patient = await prisma.patient.create({
      data: {
        dentistId: session.dentistId,
        patientId: patientIdStr,
        fullName: patientName,
        phoneNumber,
        gender,
        dateOfBirth: dob,
        age,
        generalNotes: notes || null,
      },
    });

    const visit = await prisma.visit.create({
      data: {
        patientId: patient.id,
        dentistId: session.dentistId,
        visitDate: new Date(),
      },
    });

    if (treatments && treatments.length > 0) {
      for (const treatment of treatments) {
        const existing = await prisma.dentalChart.findFirst({
          where: {
            patientId: patient.id,
            toothNumber: treatment.toothNumber,
            dentitionType: treatment.dentitionType || "permanent",
          },
        });

        let chart;
        if (existing) {
          chart = await prisma.dentalChart.update({
            where: { id: existing.id },
            data: { status: "treatment_in_progress" },
          });
        } else {
          chart = await prisma.dentalChart.create({
            data: {
              patientId: patient.id,
              toothNumber: treatment.toothNumber,
              toothPosition: treatment.toothPosition || "",
              dentitionType: treatment.dentitionType || "permanent",
              status: "treatment_in_progress",
            },
          });
        }

        await prisma.treatment.create({
          data: {
            visitId: visit.id,
            dentalChartId: chart.id,
            toothNumber: treatment.toothNumber,
            treatmentType: treatment.treatmentType,
            status: treatment.status || "planned",
            details: treatment.details ? JSON.stringify(treatment.details) : null,
            notes: treatment.notes || null,
          },
        });
      }
    }

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Failed to create patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
