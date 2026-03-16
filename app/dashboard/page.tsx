import { auth } from "@/auth";
import type { Metadata } from "next";
import prisma from '@/lib/prisma';
import ExpenseTable from '../ExpenseDashboard';
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Keuanganku",
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main>
      <ExpenseTable expenses={expenses} />
    </main>
  );
}
