import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { data } = await request.json();
    if (!data) return NextResponse.json({ error: 'No data provided' }, { status: 400 });

    // Use nested write to create bill, items, and members in one transaction
    const sharedBill = await prisma.sharedBill.create({
      data: {
        userId: session?.user?.id,
        subtotal: data.subtotal,
        tax: data.tax,
        service: data.service,
        total: data.total,
        taxRate: data.taxRate || 0,
        serviceRate: data.serviceRate || 0,
        items: {
          create: data.items.map((item: any) => ({
            name: item.name,
            price: item.price,
            qty: item.qty,
            assignedTo: item.assignedTo || [],
          })),
        },
        members: {
          create: data.members.map((m: any) => ({
            memberId: m.id,
            name: m.name,
            subtotal: m.subtotal,
            tax: m.tax,
            service: m.service,
            total: m.total,
          })),
        },
      },
    });

    return NextResponse.json({ id: sharedBill.id });
  } catch (error: any) {
    console.error('Share Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
