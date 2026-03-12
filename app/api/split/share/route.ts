import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    if (!data) return NextResponse.json({ error: 'No data provided' }, { status: 400 });

    const sharedBill = await prisma.sharedBill.create({
      data: {
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json({ id: sharedBill.id });
  } catch (error: any) {
    console.error('Share Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
