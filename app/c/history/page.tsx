import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export const metadata = {
  title: "Riwayat Split Bill | Keuanganku",
};

export default async function SplitBillHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const bills = await prisma.sharedBill.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      members: true,
    },
  });

  return <HistoryClient bills={bills} />;
}
