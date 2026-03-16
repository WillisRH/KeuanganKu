import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    const where: any = { userId };
    if (!isNaN(month)) where.month = month;
    if (!isNaN(year)) where.year = year;

    const budgets = await prisma.budget.findMany({ where });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET Budget Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data anggaran" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { category, amount, month, year } = await req.json();
    if (!category || amount === undefined || month === undefined || year === undefined) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const cat = category.toLowerCase().trim();

    const budget = await prisma.budget.upsert({
      where: {
        category_month_year_userId: {
          category: cat,
          month: Number(month),
          year: Number(year),
          userId
        }
      },
      update: { amount: Number(amount) },
      create: { 
        category: cat, 
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
        userId
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("POST Budget Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data anggaran" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    if (!category || isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    await prisma.budget.delete({
      where: {
        category_month_year_userId: {
          category: category.toLowerCase().trim(),
          month,
          year,
          userId
        }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Budget Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data anggaran" }, { status: 500 });
  }
}
