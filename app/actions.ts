'use server';

import { auth } from '@/auth';
import prisma from '../lib/prisma';

export async function getTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const transactions = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return transactions;
}

export async function addTransaction(data: {
  item: string;
  amount: number;
  category: string;
  type: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      item: data.item,
      amount: data.amount,
      category: data.category,
      type: data.type,
      description: data.description || '',
      source: 'web',
      rawInput: 'Manual Web Entry'
    }
  });
  return expense;
}

export async function getWhatsAppToken(forceCreate: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    // @ts-ignore
    select: { waToken: true, waNumber: true, waTokenUpdatedAt: true }
  }) as { waToken: string | null, waNumber: string | null, waTokenUpdatedAt: Date | null } | null;

  if (user?.waNumber) {
    return { token: user.waToken, linked: true, waNumber: user.waNumber, updatedAt: user.waTokenUpdatedAt };
  }

  // Check expiration if not linked
  const FIVE_MINUTES = 5 * 60 * 1000;
  const isExpired = !user?.waTokenUpdatedAt || 
                   (Date.now() - new Date(user.waTokenUpdatedAt).getTime() > FIVE_MINUTES);

  // If not linked and no force create, and either no token or token is expired, return null
  if (!forceCreate && (!user?.waToken || isExpired)) {
    return { token: null, linked: false, waNumber: null, updatedAt: user?.waTokenUpdatedAt || null };
  }

  if (user?.waToken && !isExpired) {
    return { token: user.waToken, linked: false, waNumber: null, updatedAt: user.waTokenUpdatedAt };
  }

  // Generate new token if forceCreate is true or it existed but was expired (and we're refreshing)
  const newToken = Math.random().toString(36).substring(2, 10).toUpperCase();
  const now = new Date();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      waToken: newToken,
      // @ts-ignore
      waTokenUpdatedAt: now
    }
  });

  return { token: newToken, linked: false, waNumber: null, updatedAt: now };
}
