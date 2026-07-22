import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.bepSettings.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/bep error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      outletId,
      operationalDays,
      manualOpex,
      manualMargin,
      manualPrice,
      actualVolume,
      manualInvestment,
      manualDiscount,
      targetPaybackMonths
    } = body;

    if (!outletId) {
      return NextResponse.json({ error: 'outletId is required' }, { status: 400 });
    }

    const upserted = await prisma.bepSettings.upsert({
      where: { outletId },
      update: {
        operationalDays: Number(operationalDays) ?? 30,
        manualOpex: manualOpex !== null ? Number(manualOpex) : null,
        manualMargin: manualMargin !== null ? Number(manualMargin) : null,
        manualPrice: manualPrice !== null ? Number(manualPrice) : null,
        actualVolume: actualVolume !== null ? Number(actualVolume) : null,
        manualInvestment: manualInvestment !== null ? Number(manualInvestment) : null,
        manualDiscount: manualDiscount !== null ? Number(manualDiscount) : null,
        targetPaybackMonths: Number(targetPaybackMonths) ?? 12
      },
      create: {
        outletId,
        operationalDays: Number(operationalDays) ?? 30,
        manualOpex: manualOpex !== null ? Number(manualOpex) : null,
        manualMargin: manualMargin !== null ? Number(manualMargin) : null,
        manualPrice: manualPrice !== null ? Number(manualPrice) : null,
        actualVolume: actualVolume !== null ? Number(actualVolume) : null,
        manualInvestment: manualInvestment !== null ? Number(manualInvestment) : null,
        manualDiscount: manualDiscount !== null ? Number(manualDiscount) : null,
        targetPaybackMonths: Number(targetPaybackMonths) ?? 12
      }
    });

    return NextResponse.json(upserted);
  } catch (error) {
    console.error("PUT /api/bep error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
