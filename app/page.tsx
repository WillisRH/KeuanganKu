import prisma from '../lib/prisma';
import ExpenseTable from './ExpenseDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main>
      <ExpenseTable expenses={expenses} />
    </main>
  );
}