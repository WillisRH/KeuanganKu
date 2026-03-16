import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memberId, paidAmount } = await req.json();

    if (!memberId || paidAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the bill belongs to the user
    const member = await prisma.sharedBillMember.findUnique({
      where: { id: memberId },
      include: { bill: true }
    });

    if (!member || member.bill.userId !== session.user.id) {
      return NextResponse.json({ error: "Member not found or unauthorized" }, { status: 404 });
    }

    const updatedMember = await prisma.sharedBillMember.update({
      where: { id: memberId },
      data: { paidAmount: Number(paidAmount) }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
