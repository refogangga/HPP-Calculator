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
        ops: body.ops || {}
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
      const existing = await prisma.menu.findMany({ select: { id: true } });
      const existingIds = existing.map(e => e.id);
      const incomingIds = body.map(m => m.id);
      
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.menu.deleteMany({ where: { id: { in: toDelete } } });
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
            ops: m.ops || {}
          },
          create: {
            id: m.id,
            name: m.name,
            emoji: m.emoji || '☕',
            category: m.category || 'Minuman',
            margin: Number(m.margin) || 50,
            ingredients: m.ingredients || [],
            packaging: m.packaging || [],
            ops: m.ops || {}
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
        ops: body.ops
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
