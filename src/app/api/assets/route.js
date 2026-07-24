import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("GET /api/assets error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newAsset = await prisma.asset.create({
      data: {
        id: body.id || undefined,
        name: body.name || 'Aset Baru',
        harga: Number(body.harga) || 0,
        tahun: Number(body.tahun) || 5,
        enabled: body.enabled !== undefined ? body.enabled : true,
        category: body.category || 'Semua',
        isLargeExpense: body.isLargeExpense !== undefined ? body.isLargeExpense : false,
        outletId: body.outletId || null
      }
    });
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("POST /api/assets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Bulk Sync
    if (Array.isArray(body)) {
      const incomingIds = body.map(a => a.id);
      const activeOutletIdsInPayload = [...new Set(body.map(a => a.outletId).filter(Boolean))];
      
      if (activeOutletIdsInPayload.length > 0) {
        const existing = await prisma.asset.findMany({
          where: { outletId: { in: activeOutletIdsInPayload } },
          select: { id: true }
        });
        const existingIds = existing.map(e => e.id);
        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await prisma.asset.deleteMany({ where: { id: { in: toDelete } } });
        }
      }
      
      const upserts = body.map(a => 
        prisma.asset.upsert({
          where: { id: a.id },
          update: {
            name: a.name,
            harga: Number(a.harga) || 0,
            tahun: Number(a.tahun) || 5,
            enabled: a.enabled !== undefined ? a.enabled : true,
            category: a.category || 'Semua',
            isLargeExpense: a.isLargeExpense !== undefined ? a.isLargeExpense : false,
            outletId: a.outletId || null
          },
          create: {
            id: a.id,
            name: a.name || 'Aset Baru',
            harga: Number(a.harga) || 0,
            tahun: Number(a.tahun) || 5,
            enabled: a.enabled !== undefined ? a.enabled : true,
            category: a.category || 'Semua',
            isLargeExpense: a.isLargeExpense !== undefined ? a.isLargeExpense : false,
            outletId: a.outletId || null
          }
        })
      );
      
      await prisma.$transaction(upserts);
      return NextResponse.json({ success: true, count: body.length });
    }
    
    // Single Update
    if (!body.id) {
      return NextResponse.json({ error: 'Missing asset id' }, { status: 400 });
    }
    const updatedAsset = await prisma.asset.update({
      where: { id: body.id },
      data: {
        name: body.name,
        harga: body.harga !== undefined ? Number(body.harga) : undefined,
        tahun: body.tahun !== undefined ? Number(body.tahun) : undefined,
        enabled: body.enabled,
        category: body.category,
        isLargeExpense: body.isLargeExpense,
        outletId: body.outletId !== undefined ? body.outletId : undefined
      }
    });
    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("PUT /api/assets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    
    if (idsParam) {
      const ids = idsParam.split(',');
      const result = await prisma.asset.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, count: result.count });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Missing asset id' }, { status: 400 });
    }
    await prisma.asset.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/assets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
