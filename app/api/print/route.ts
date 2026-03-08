import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { expenseId, type = 'receipt', metadata } = await request.json();

    if (type === 'receipt' && !expenseId) {
      return NextResponse.json({ error: 'expenseId is required for receipts' }, { status: 400 });
    }

    const printId = crypto.randomUUID();

    const printLog = await prisma.printLog.create({
      data: {
        expenseId: type === 'receipt' ? expenseId : null,
        type,
        metadata: metadata || null,
        printId,
      },
    });

    return NextResponse.json({ printId: printLog.printId });
  } catch (error) {
    console.error('Error creating print log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
