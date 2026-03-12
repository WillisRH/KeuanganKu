import { ImageResponse } from 'next/og';
import prisma from '../../../lib/prisma';

export const runtime = 'nodejs';
export const alt = 'Digital Receipt - KeuanganKu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fmt = (n: number) => 'Rp ' + Math.floor(n).toLocaleString('id-ID');

export default async function Image({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Resolve params safely
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let billData: any = null;
  try {
    const bill = await prisma.sharedBill.findUnique({ where: { id } });
    if (bill) {
      billData = JSON.parse(bill.data);
      billData.createdAt = bill.createdAt;
    }
  } catch (e) {
    console.error("OG Image Fetch Error:", e);
  }

  // Fallback for missing data
  if (!billData) {
    return new ImageResponse(
      (
        <div tw="flex flex-col items-center justify-center w-full h-full bg-[#0C0E16] text-white">
          <h1 tw="text-7xl font-black">KeuanganKu</h1>
          <p tw="text-3xl text-gray-400">Bill Tidak Ditemukan</p>
        </div>
      ),
      { ...size }
    );
  }

  const items = billData.items || [];
  const members = billData.members || [];
  const total = billData.total || 0;
  
  const getAssigneeNames = (assignedToIds: string[]) => {
    return assignedToIds
      .map(id => members.find((m: any) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const dateStr = new Date(billData.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full bg-white p-0 items-center justify-center relative">
        {/* Background Decorative Accents */}
        <div tw="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-[#5B6CF8] opacity-5 rounded-full" style={{ filter: 'blur(100px)' }} />
        <div tw="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#9B7CF8] opacity-5 rounded-full" style={{ filter: 'blur(100px)' }} />

        {/* The Receipt Container */}
        <div tw="flex flex-col w-[580px] bg-white text-black p-10 rounded-3xl shadow-2xl relative">
          
          {/* Header */}
          <div tw="flex flex-col items-center mb-6">
            <h1 tw="text-4xl font-black mb-1 tracking-tighter">KEUANGANKU</h1>
            <p tw="text-[10px] font-black text-gray-400 tracking-[5px] uppercase">Smart Split Bill Receipt</p>
            <p tw="text-[11px] text-gray-400 mt-3 font-bold">{dateStr} • ID: {id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Dash Divider */}
          <div tw="w-full h-px border-t-2 border-dashed border-gray-200 my-4" />

          {/* Items List */}
          <div tw="flex flex-col w-full mb-4">
            {items.slice(0, 5).map((item: any, i: number) => {
              const assignees = getAssigneeNames(item.assignedTo || []);
              return (
                <div key={i} tw="flex justify-between items-start mb-4">
                  <div tw="flex flex-col flex-1">
                    <div tw="flex items-baseline">
                       <span tw="text-[15px] font-black uppercase leading-tight">{item.name}</span>
                       {assignees && <span tw="text-[11px] font-bold text-[#5B6CF8] ml-2">({assignees})</span>}
                    </div>
                    {item.qty > 1 && <span tw="text-[10px] text-gray-400 mt-1 font-bold">QTY: {item.qty} × {fmt(item.price)}</span>}
                  </div>
                  <span tw="text-[15px] font-black ml-4">{fmt(item.price * item.qty)}</span>
                </div>
              );
            })}
            {items.length > 5 && (
              <p tw="text-[11px] text-gray-400 italic text-center mt-2 font-bold">... dan {items.length - 5} item lainnya</p>
            )}
          </div>

          {/* Dash Divider */}
          <div tw="w-full h-px border-t-2 border-dashed border-gray-200 my-4" />

          {/* Subtotals */}
          <div tw="flex flex-col w-full mb-6">
            <div tw="flex justify-between mb-2">
              <span tw="text-[11px] font-bold text-gray-400">SUBTOTAL</span>
              <span tw="text-[11px] font-bold">{fmt(billData.subtotal)}</span>
            </div>
            {(billData.tax > 0 || billData.service > 0) && (
              <div tw="flex justify-between mb-2">
                <span tw="text-[11px] font-bold text-gray-400">PAJAK & SERVICE</span>
                <span tw="text-[11px] font-bold">{fmt(billData.tax + billData.service)}</span>
              </div>
            )}
            
            <div tw="flex flex-col items-center mt-8 pt-8 border-t-4 border-black w-full">
              <span tw="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Total Tagihan</span>
              <span tw="text-6xl font-black tracking-tighter">{fmt(total)}</span>
            </div>
          </div>

          {/* Footer Badge */}
          <div tw="flex self-center bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
            {members.length} ORANG BERBAGI
          </div>

          <div tw="flex flex-col items-center mt-8 opacity-20">
             <div tw="flex bg-gray-200 h-2 w-32 rounded-full mb-1" />
             <div tw="flex bg-gray-200 h-2 w-20 rounded-full" />
          </div>
        </div>

      </div>
    ),
    { ...size }
  );
}
