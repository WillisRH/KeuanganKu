import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany();
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET Budget Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data anggaran" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category, amount } = await req.json();
    if (!category || amount === undefined) {
      return NextResponse.json({ error: "Kategori dan nominal harus diisi" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: { category: category.toLowerCase().trim() },
      update: { amount: Number(amount) },
      create: { category: category.toLowerCase().trim(), amount: Number(amount) },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("POST Budget Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data anggaran" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    if (!category) {
      return NextResponse.json({ error: "Kategori harus diisi" }, { status: 400 });
    }

    await prisma.budget.delete({
      where: { category: category.toLowerCase().trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Budget Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data anggaran" }, { status: 500 });
  }
}
