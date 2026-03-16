import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { expenseId, type = 'receipt', metadata } = await request.json();

    if (type === 'receipt' && !expenseId) {
      return NextResponse.json({ error: 'expenseId is required for receipts' }, { status: 400 });
    }

    if (expenseId) {
      // Verify expense belongs to user
      const expense = await prisma.expense.findFirst({
        where: { id: expenseId, userId }
      });
      if (!expense) {
        return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
      }
    }

    const printId = crypto.randomUUID();

    const printLog = await prisma.printLog.create({
      data: {
        expenseId: type === 'receipt' ? expenseId : null,
        userId,
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
