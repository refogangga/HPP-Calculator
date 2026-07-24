import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("GET /api/menus error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newMenu = await prisma.menu.create({
      data: {
        id: body.id || undefined,
        name: body.name,
        emoji: body.emoji || '☕',
        category: body.category || 'Minuman',
        margin: Number(body.margin) || 50,
        ingredients: body.ingredients || [],
        packaging: body.packaging || [],
        ops: body.ops || {},
        platform: body.platform || null,
        outletId: body.outletId || null
      }
    });
    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error("POST /api/menus error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Bulk Sync
    if (Array.isArray(body)) {
      // Find what needs to be deleted or updated
      const incomingIds = body.map(m => m.id);
      
      // If the bulk sync payload has elements, let's look up which ones to delete.
      // However, we want to delete only from the specific outlet if possible,
      // but to keep it simple, if they send a list of menus for sync:
      // We look at all menus in the DB and if any of them are NOT in incomingIds,
      // we check if they belong to the active outlet of this sync (if provided).
      // Wait, let's just delete menus that are in the database but NOT in incomingIds,
      // but only those that belong to the outlet(s) present in the payload to avoid cross-outlet deletion!
      // This is VERY IMPORTANT! If we delete blindly, it will clear out menus from other outlets!
      const activeOutletIdsInPayload = [...new Set(body.map(m => m.outletId).filter(Boolean))];
      
      if (activeOutletIdsInPayload.length > 0) {
        const existing = await prisma.menu.findMany({
          where: { outletId: { in: activeOutletIdsInPayload } },
          select: { id: true }
        });
        const existingIds = existing.map(e => e.id);
        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
        
        if (toDelete.length > 0) {
          await prisma.menu.deleteMany({ where: { id: { in: toDelete } } });
        }
      }
      
      const upserts = body.map(m => 
        prisma.menu.upsert({
          where: { id: m.id },
          update: {
            name: m.name,
            emoji: m.emoji || '☕',
            category: m.category || 'Minuman',
            margin: Number(m.margin) || 50,
            ingredients: m.ingredients || [],
            packaging: m.packaging || [],
            ops: m.ops || {},
            platform: m.platform || null,
            outletId: m.outletId || null
          },
          create: {
            id: m.id,
            name: m.name,
            emoji: m.emoji || '☕',
            category: m.category || 'Minuman',
            margin: Number(m.margin) || 50,
            ingredients: m.ingredients || [],
            packaging: m.packaging || [],
            ops: m.ops || {},
            platform: m.platform || null,
            outletId: m.outletId || null
          }
        })
      );
      
      await prisma.$transaction(upserts);
      return NextResponse.json({ success: true, count: body.length });
    }
    
    // Single Update
    if (!body.id) {
      return NextResponse.json({ error: 'Missing menu id' }, { status: 400 });
    }
    const updatedMenu = await prisma.menu.update({
      where: { id: body.id },
      data: {
        name: body.name,
        emoji: body.emoji,
        category: body.category,
        margin: body.margin !== undefined ? Number(body.margin) : undefined,
        ingredients: body.ingredients,
        packaging: body.packaging,
        ops: body.ops,
        platform: body.platform !== undefined ? body.platform : undefined,
        outletId: body.outletId !== undefined ? body.outletId : undefined
      }
    });
    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("PUT /api/menus error:", error);
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
      const result = await prisma.menu.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, count: result.count });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id or ids' }, { status: 400 });
    }
    await prisma.menu.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menus error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
