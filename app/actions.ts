'use server';

import prisma from '../lib/prisma';

export async function getTransactions() {
  const transactions = await prisma.expense.findMany({
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
  const expense = await prisma.expense.create({
    data: {
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
