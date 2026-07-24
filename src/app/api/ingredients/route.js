import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("GET /api/ingredients error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newIngredient = await prisma.ingredient.create({
      data: {
        id: body.id || undefined,
        name: body.name || 'Bahan Baru',
        hargaBeli: Number(body.hargaBeli) || 0,
        ukuranKemasan: Number(body.ukuranKemasan) || 1000,
        unit: body.unit || 'gr',
        isPackaging: body.isPackaging !== undefined ? body.isPackaging : false,
        outletId: body.outletId || null
      }
    });
    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error("POST /api/ingredients error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Bulk Sync
    if (Array.isArray(body)) {
      const incomingIds = body.map(i => i.id);
      const activeOutletIdsInPayload = [...new Set(body.map(i => i.outletId).filter(Boolean))];
      
      if (activeOutletIdsInPayload.length > 0) {
        const existing = await prisma.ingredient.findMany({
          where: { outletId: { in: activeOutletIdsInPayload } },
          select: { id: true }
        });
        const existingIds = existing.map(e => e.id);
        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await prisma.ingredient.deleteMany({ where: { id: { in: toDelete } } });
        }
      }
      
      const upserts = body.map(i => 
        prisma.ingredient.upsert({
          where: { id: i.id },
          update: {
            name: i.name,
            hargaBeli: Number(i.hargaBeli) || 0,
            ukuranKemasan: Number(i.ukuranKemasan) || 1000,
            unit: i.unit || 'gr',
            isPackaging: i.isPackaging !== undefined ? i.isPackaging : false,
            outletId: i.outletId || null
          },
          create: {
            id: i.id,
            name: i.name || 'Bahan',
            hargaBeli: Number(i.hargaBeli) || 0,
            ukuranKemasan: Number(i.ukuranKemasan) || 1000,
            unit: i.unit || 'gr',
            isPackaging: i.isPackaging !== undefined ? i.isPackaging : false,
            outletId: i.outletId || null
          }
        })
      );
      
      await prisma.$transaction(upserts);
      return NextResponse.json({ success: true, count: body.length });
    }
    
    // Single Update
    if (!body.id) {
      return NextResponse.json({ error: 'Missing ingredient id' }, { status: 400 });
    }
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: body.id },
      data: {
        name: body.name,
        hargaBeli: body.hargaBeli !== undefined ? Number(body.hargaBeli) : undefined,
        ukuranKemasan: body.ukuranKemasan !== undefined ? Number(body.ukuranKemasan) : undefined,
        unit: body.unit,
        isPackaging: body.isPackaging,
        outletId: body.outletId !== undefined ? body.outletId : undefined
      }
    });
    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error("PUT /api/ingredients error:", error);
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
      const result = await prisma.ingredient.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, count: result.count });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ingredient id' }, { status: 400 });
    }
    await prisma.ingredient.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/ingredients error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
