import { ImageResponse } from 'next/og';
import prisma from '../../../lib/prisma';

export const runtime = 'nodejs';
export const alt = 'Digital Receipt - KeuanganKu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fmt = (n: number) => 'Rp ' + Math.floor(n).toLocaleString('id-ID');

export default async function Image({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let billData: any = null;
  try {
    const bill = await prisma.sharedBill.findUnique({ 
      where: { id },
      include: {
        items: true,
        members: true,
      }
    });

    if (bill) {
      // Direct mapping from relational entities
      billData = {
        id: bill.id,
        subtotal: bill.subtotal,
        tax: bill.tax,
        service: bill.service,
        total: bill.total,
        taxRate: bill.taxRate,
        serviceRate: bill.serviceRate,
        createdAt: bill.createdAt,
        items: bill.items,
        members: bill.members,
      };
    }
  } catch (e) {
    console.error("OG Image Error:", e);
  }

  if (!billData) {
    return new ImageResponse(
      (
        <div tw="flex flex-col items-center justify-center w-full h-full bg-[#0C0E16] text-white">
          <h1 tw="text-7xl font-black">KeuanganKu</h1>
          <p tw="text-3xl text-gray-500 mt-4">Bill Tidak Ditemukan</p>
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
      .map(id => members.find((m: any) => m.memberId === id)?.name)
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
      <div tw="flex w-full h-full bg-[#0C0E16] items-center justify-center p-0 m-0 overflow-hidden relative">
        {/* Subtle Background Elements */}
        <div tw="absolute top-[-20%] left-[-10%] w-[60%] h-[100%] bg-[#5B6CF8] opacity-10 rounded-full" style={{ filter: 'blur(120px)' }} />
        <div tw="absolute bottom-[-20%] right-[-10%] w-[60%] h-[100%] bg-[#9B7CF8] opacity-10 rounded-full" style={{ filter: 'blur(120px)' }} />

        {/* Brand Side - Left */}
        <div tw="flex flex-col flex-1 items-center justify-center px-12 z-10">
          <div tw="flex bg-[#5B6CF8] p-5 rounded-3xl mb-8 shadow-2xl">
             <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h1 tw="text-5xl font-black text-white tracking-tighter mb-2">KEUANGANKU</h1>
          <p tw="text-sm font-bold text-[#5B6CF8] tracking-[10px] uppercase opacity-80">AI Split Bill</p>
          <div tw="mt-12 flex flex-col items-center">
             <span tw="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Receipt Generated On</span>
             <span tw="text-sm font-bold text-gray-300">{dateStr}</span>
          </div>
        </div>

        {/* The Receipt - Center */}
        <div tw="flex flex-col w-[420px] h-[580px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative mx-4 border-[12px] border-white/10">
          {/* Header */}
          <div tw="flex flex-col items-center pt-8 pb-4 px-8">
            <h2 tw="text-2xl font-black tracking-tighter m-0">BILL SUMMARY</h2>
            <div tw="w-12 h-1 bg-[#5B6CF8] mt-2 rounded-full" />
          </div>

          <div tw="w-full h-px border-t-2 border-dashed border-gray-100 mt-4 mb-2" />

          {/* Items List */}
          <div tw="flex flex-col flex-1 px-10 py-4 overflow-hidden">
            {items.slice(0, 6).map((item: any, i: number) => {
              const assignees = getAssigneeNames(item.assignedTo || []);
              return (
                <div key={i} tw="flex justify-between items-start mb-4">
                  <div tw="flex flex-col flex-1 pr-4">
                    <div tw="flex items-baseline flex-wrap">
                       <span tw="text-[14px] font-black uppercase leading-tight truncate">{item.name}</span>
                       {assignees && <span tw="text-[9px] font-bold text-[#5B6CF8] ml-2">({assignees})</span>}
                    </div>
                    <span tw="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{item.qty} × {fmt(item.price)}</span>
                  </div>
                  <span tw="text-[14px] font-black whitespace-nowrap">{fmt(item.price * item.qty)}</span>
                </div>
              );
            })}
            {items.length > 6 && (
              <p tw="text-[10px] text-gray-300 italic text-center mt-auto font-bold">+ {items.length - 6} items lainnya</p>
            )}
          </div>

          <div tw="w-full h-px border-t-2 border-dashed border-gray-100 my-2" />

          {/* Grand Total Footer */}
          <div tw="flex flex-col bg-gray-50 p-8 pt-6">
            <div tw="flex justify-between mb-4">
               <span tw="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Payable</span>
               <span tw="text-[10px] font-black text-gray-400 uppercase tracking-widest">{members.length} People</span>
            </div>
            <div tw="flex items-center justify-center pb-2">
              <span tw="text-5xl font-black tracking-tighter">{fmt(total)}</span>
            </div>
            <div tw="flex justify-center mt-4">
               <div tw="flex bg-black text-white px-6 py-2 rounded-xl text-[9px] font-black tracking-[4px] uppercase">Ready to split</div>
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div tw="flex flex-col flex-1 px-12 z-10">
           <div tw="flex flex-col bg-white/5 border border-white/10 p-8 rounded-[32px] w-full">
              <span tw="text-[#5B6CF8] text-[10px] font-black tracking-[4px] uppercase mb-6">Internal Status</span>
              <div tw="flex flex-col gap-5">
                 <div tw="flex flex-col">
                    <span tw="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction ID</span>
                    <span tw="text-xs font-black text-white truncate">{id.slice(0, 16).toUpperCase()}</span>
                 </div>
                 <div tw="flex flex-col">
                    <span tw="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Split Status</span>
                    <div tw="flex items-center mt-1">
                       <div tw="w-2 h-2 bg-[#4ADE80] rounded-full mr-2" />
                       <span tw="text-xs font-black text-[#4ADE80] uppercase">Verified & Active</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
