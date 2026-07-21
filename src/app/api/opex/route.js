import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.opexProfile.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("GET /api/opex error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newProfile = await prisma.opexProfile.create({
      data: {
        id: body.id || undefined,
        name: body.name || 'Profil OPEX Baru',
        usePenyusutan: body.usePenyusutan !== undefined ? body.usePenyusutan : true,
        penyusutan: Number(body.penyusutan) || 0,
        isTotalVolumeLocked: body.isTotalVolumeLocked !== undefined ? body.isTotalVolumeLocked : true,
        totalVolume: Number(body.totalVolume) || 1000,
        menuVolumes: body.menuVolumes || {},
        menuPrices: body.menuPrices || {},
        selectedMenuIds: body.selectedMenuIds || [],
        assets: body.assets || [],
        expenses: body.expenses || []
      }
    });
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("POST /api/opex error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Bulk Sync
    if (Array.isArray(body)) {
      const existing = await prisma.opexProfile.findMany({ select: { id: true } });
      const existingIds = existing.map(e => e.id);
      const incomingIds = body.map(p => p.id);
      
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.opexProfile.deleteMany({ where: { id: { in: toDelete } } });
      }
      
      const upserts = body.map(p => 
        prisma.opexProfile.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            usePenyusutan: p.usePenyusutan !== undefined ? p.usePenyusutan : true,
            penyusutan: Number(p.penyusutan) || 0,
            isTotalVolumeLocked: p.isTotalVolumeLocked !== undefined ? p.isTotalVolumeLocked : true,
            totalVolume: Number(p.totalVolume) || 1000,
            menuVolumes: p.menuVolumes || {},
            menuPrices: p.menuPrices || {},
            selectedMenuIds: p.selectedMenuIds || [],
            assets: p.assets || [],
            expenses: p.expenses || []
          },
          create: {
            id: p.id,
            name: p.name || 'Profil OPEX',
            usePenyusutan: p.usePenyusutan !== undefined ? p.usePenyusutan : true,
            penyusutan: Number(p.penyusutan) || 0,
            isTotalVolumeLocked: p.isTotalVolumeLocked !== undefined ? p.isTotalVolumeLocked : true,
            totalVolume: Number(p.totalVolume) || 1000,
            menuVolumes: p.menuVolumes || {},
            menuPrices: p.menuPrices || {},
            selectedMenuIds: p.selectedMenuIds || [],
            assets: p.assets || [],
            expenses: p.expenses || []
          }
        })
      );
      
      await prisma.$transaction(upserts);
      return NextResponse.json({ success: true, count: body.length });
    }
    
    // Single Update
    if (!body.id) {
      return NextResponse.json({ error: 'Missing profile id' }, { status: 400 });
    }
    const updatedProfile = await prisma.opexProfile.update({
      where: { id: body.id },
      data: {
        name: body.name,
        usePenyusutan: body.usePenyusutan,
        penyusutan: body.penyusutan !== undefined ? Number(body.penyusutan) : undefined,
        isTotalVolumeLocked: body.isTotalVolumeLocked,
        totalVolume: body.totalVolume !== undefined ? Number(body.totalVolume) : undefined,
        menuVolumes: body.menuVolumes,
        menuPrices: body.menuPrices,
        selectedMenuIds: body.selectedMenuIds,
        assets: body.assets,
        expenses: body.expenses
      }
    });
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("PUT /api/opex error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing profile id' }, { status: 400 });
    }
    await prisma.opexProfile.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/opex error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
