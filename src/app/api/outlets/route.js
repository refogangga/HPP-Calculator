import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(outlets);
  } catch (error) {
    console.error("GET /api/outlets error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, copyFromOutletId } = body;
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create new outlet
    const newOutlet = await prisma.outlet.create({
      data: { name }
    });

    // Create empty default BEP settings for this new outlet
    await prisma.bepSettings.create({
      data: {
        outletId: newOutlet.id,
        operationalDays: 30,
        manualOpex: null,
        manualMargin: null,
        manualPrice: null,
        actualVolume: null,
        manualInvestment: null,
        targetPaybackMonths: 12
      }
    });

    // Handle copying logic if copyFromOutletId is specified
    if (copyFromOutletId) {
      // 1. Copy menus
      const menusToCopy = await prisma.menu.findMany({
        where: { outletId: copyFromOutletId }
      });
      if (menusToCopy.length > 0) {
        const newMenusData = menusToCopy.map(m => ({
          name: m.name,
          emoji: m.emoji,
          category: m.category,
          margin: m.margin,
          ingredients: m.ingredients,
          packaging: m.packaging,
          ops: m.ops || {},
          outletId: newOutlet.id
        }));
        await prisma.menu.createMany({
          data: newMenusData
        });
      }

      // 2. Copy opex profiles
      const opexProfilesToCopy = await prisma.opexProfile.findMany({
        where: { outletId: copyFromOutletId }
      });
      if (opexProfilesToCopy.length > 0) {
        const newOpexData = opexProfilesToCopy.map(p => ({
          name: p.name,
          usePenyusutan: p.usePenyusutan,
          penyusutan: p.penyusutan,
          isTotalVolumeLocked: p.isTotalVolumeLocked,
          totalVolume: p.totalVolume,
          menuVolumes: p.menuVolumes,
          menuPrices: p.menuPrices,
          selectedMenuIds: p.selectedMenuIds,
          assets: p.assets,
          expenses: p.expenses,
          outletId: newOutlet.id
        }));
        await prisma.opexProfile.createMany({
          data: newOpexData
        });
      }

      // 3. Copy BEP settings values
      const bepToCopy = await prisma.bepSettings.findUnique({
        where: { outletId: copyFromOutletId }
      });
      if (bepToCopy) {
        await prisma.bepSettings.update({
          where: { outletId: newOutlet.id },
          data: {
            operationalDays: bepToCopy.operationalDays,
            manualOpex: bepToCopy.manualOpex,
            manualMargin: bepToCopy.manualMargin,
            manualPrice: bepToCopy.manualPrice,
            actualVolume: bepToCopy.actualVolume,
            manualInvestment: bepToCopy.manualInvestment,
            targetPaybackMonths: bepToCopy.targetPaybackMonths
          }
        });
      }
    }

    return NextResponse.json(newOutlet, { status: 201 });
  } catch (error) {
    console.error("POST /api/outlets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (body.id && body.name) {
      const updated = await prisma.outlet.update({
        where: { id: body.id },
        data: { name: body.name }
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/outlets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.outlet.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/outlets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
