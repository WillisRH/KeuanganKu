import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const printId = searchParams.get('printId');

    if (!printId) {
      return NextResponse.json({ error: 'printId is required' }, { status: 400 });
    }

    const printLog = await prisma.printLog.findUnique({
      where: { printId },
      include: {
        expense: true,
      },
    });

    if (!printLog) {
      return NextResponse.json({ error: 'Invalid print ID' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      type: printLog.type,
      data: printLog.type === 'receipt' ? printLog.expense : null,
      metadata: printLog.metadata ? JSON.parse(printLog.metadata) : null,
      printedAt: printLog.createdAt,
    });
  } catch (error) {
    console.error('Error validating print:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
