import { ImageResponse } from 'next/og';
import prisma from '../../../lib/prisma';

export const runtime = 'nodejs';
export const alt = 'Digital Receipt - KeuanganKu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fmt = (n: number) => 'Rp ' + Math.floor(n).toLocaleString('id-ID');
const fmtShort = (n: number) => {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1).replace('.0', '') + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(1).replace('.0', '') + 'rb';
  return 'Rp ' + n;
};

export default async function Image({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let billData: any = null;
  try {
    const bill = await prisma.sharedBill.findUnique({
      where: { id },
      include: { items: true, members: true },
    });
    if (bill) {
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
    console.error('OG Image Error:', e);
  }

  // ── Not Found State ──
  if (!billData) {
    return new ImageResponse(
      (
        <div tw="flex flex-col items-center justify-center w-full h-full" style={{ background: 'linear-gradient(160deg, #F8F9FC 0%, #EEF0F7 50%, #F8F9FC 100%)' }}>
          {/* Soft glow orbs */}
          <div tw="absolute" style={{ top: 60, left: 200, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
          <div tw="absolute" style={{ bottom: 40, right: 250, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)' }} />
          <div tw="flex items-center mb-6">
            <div tw="flex w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <span tw="text-4xl font-bold" style={{ color: '#1A1A2E' }}>Keuangan</span>
            <span tw="text-4xl font-bold" style={{ color: '#6366F1' }}>ku</span>
          </div>
          <p tw="text-xl" style={{ color: '#9CA3AF' }}>Bill tidak ditemukan atau sudah kedaluwarsa</p>
        </div>
      ),
      { ...size }
    );
  }

  const items = billData.items || [];
  const members = billData.members || [];
  const total = billData.total || 0;
  const subtotal = billData.subtotal || 0;
  const tax = billData.tax || 0;
  const service = billData.service || 0;
  const perPerson = members.length > 0 ? total / members.length : 0;

  const getAssigneeNames = (assignedToIds: string[]) =>
    assignedToIds.map(aid => members.find((m: any) => m.memberId === aid)?.name).filter(Boolean).join(', ');

  const dateStr = new Date(billData.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(billData.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });

  const displayItems = items.slice(0, 5);
  const remainingCount = items.length - displayItems.length;

  return new ImageResponse(
    (
      <div tw="flex w-full h-full" style={{ background: 'linear-gradient(160deg, #F8F9FC 0%, #EEF0F7 40%, #F4F5FA 70%, #F8F9FC 100%)', fontFamily: 'system-ui, sans-serif' }}>

        {/* ── Background Decorations ── */}
        <div tw="absolute" style={{ top: -100, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 60%)' }} />
        <div tw="absolute" style={{ bottom: -120, left: -60, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%)' }} />
        <div tw="absolute" style={{ top: 180, right: 350, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)' }} />

        {/* ── Content Container ── */}
        <div tw="flex flex-col w-full h-full p-10">

          {/* ── Top Bar ── */}
          <div tw="flex items-center justify-between mb-6">
            <div tw="flex items-center">
              <div tw="flex w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
              </div>
              <span tw="text-2xl font-bold" style={{ color: '#1A1A2E' }}>Keuangan</span>
              <span tw="text-2xl font-bold" style={{ color: '#6366F1' }}>ku</span>
            </div>
            <div tw="flex items-center">
              <div tw="flex items-center rounded-xl px-4 py-2 mr-3" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                <span tw="text-xs font-bold text-white ml-2">Split Bill</span>
              </div>
              <div tw="flex items-center rounded-xl px-4 py-2" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span tw="text-xs font-medium ml-2" style={{ color: '#6B7280' }}>{dateStr} · {timeStr}</span>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div tw="flex flex-1">

            {/* ── Left Column ── */}
            <div tw="flex flex-col w-[400px] mr-6">

              {/* Hero Total Card - Premium gradient */}
              <div
                tw="flex flex-col w-full rounded-3xl p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 40%, #3730A3 70%, #1E1B4B 100%)', boxShadow: '0 20px 48px rgba(30,27,75,0.3)' }}
              >
                {/* Decorative inner glows */}
                <div tw="absolute" style={{ top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 65%)' }} />
                <div tw="absolute" style={{ bottom: -50, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)' }} />

                <div tw="flex items-center mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
                  <span tw="text-[11px] font-bold uppercase tracking-widest ml-2" style={{ color: 'rgba(199,210,254,0.7)' }}>TOTAL TAGIHAN</span>
                </div>
                <span tw="font-bold text-white leading-none mb-6" style={{ fontSize: '46px', letterSpacing: '-2px' }}>
                  {fmt(total)}
                </span>

                {/* Breakdown pills */}
                <div tw="flex items-center mb-6">
                  <div tw="flex items-center mr-4 rounded-xl px-3 py-2" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    <span tw="text-sm font-bold ml-2" style={{ color: '#34D399' }}>Subtotal {fmtShort(subtotal)}</span>
                  </div>
                  {(tax + service) > 0 && (
                    <div tw="flex items-center rounded-xl px-3 py-2" style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7L17 17M17 17H7M17 17V7"/></svg>
                      <span tw="text-sm font-bold ml-2" style={{ color: '#FCA5A5' }}>Biaya {fmtShort(tax + service)}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div tw="flex items-center rounded-2xl py-4 px-6 justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"/></svg>
                  <span tw="text-sm font-bold text-white ml-2">Lihat Detail Split →</span>
                </div>
              </div>

              {/* ── Stat Cards Row ── */}
              <div tw="flex mt-4">
                {/* Members Card */}
                <div tw="flex flex-col flex-1 rounded-2xl p-5 mr-3 relative overflow-hidden" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div tw="absolute" style={{ top: -25, right: -25, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
                  <div tw="flex items-center mb-3">
                    <div tw="flex w-8 h-8 rounded-lg items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <span tw="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: '#9CA3AF' }}>ANGGOTA</span>
                  </div>
                  <span tw="text-2xl font-bold" style={{ color: '#6366F1' }}>{members.length} orang</span>
                  <span tw="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>
                    ~{fmtShort(perPerson)}/orang
                  </span>
                </div>

                {/* Tax/Service Card */}
                <div tw="flex flex-col flex-1 rounded-2xl p-5 relative overflow-hidden" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div tw="absolute" style={{ top: -25, right: -25, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)' }} />
                  <div tw="flex items-center mb-3">
                    <div tw="flex w-8 h-8 rounded-lg items-center justify-center" style={{ background: 'rgba(248,113,113,0.08)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                    <span tw="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: '#9CA3AF' }}>PAJAK + SVC</span>
                  </div>
                  <span tw="text-2xl font-bold" style={{ color: '#F87171' }}>{fmt(tax + service)}</span>
                  <span tw="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>
                    {billData.taxRate ? `Tax ${billData.taxRate}%` : ''}{billData.taxRate && billData.serviceRate ? ' · ' : ''}{billData.serviceRate ? `Svc ${billData.serviceRate}%` : ''}{!billData.taxRate && !billData.serviceRate ? 'Tidak ada' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Items List ── */}
            <div tw="flex flex-col flex-1 rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              
              {/* Header */}
              <div tw="flex items-center justify-between px-7 pt-6 pb-4">
                <div tw="flex items-center">
                  <div tw="flex items-center rounded-xl px-4 py-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span tw="text-xs font-bold ml-2" style={{ color: '#6366F1' }}>Daftar Item</span>
                  </div>
                </div>
                <span tw="text-xs font-medium" style={{ color: '#9CA3AF' }}>{items.length} item</span>
              </div>

              {/* Column Labels */}
              <div tw="flex px-7 py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <span tw="flex-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D1D5DB' }}>ITEM</span>
                <span tw="w-20 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: '#D1D5DB' }}>QTY</span>
                <span tw="w-32 text-[10px] font-bold uppercase tracking-wider text-right" style={{ color: '#D1D5DB' }}>HARGA</span>
                <span tw="w-28 text-[10px] font-bold uppercase tracking-wider text-right" style={{ color: '#D1D5DB' }}>DIBAYAR</span>
              </div>

              {/* Rows */}
              <div tw="flex flex-col">
                {displayItems.map((item: any, i: number) => {
                  const assignees = getAssigneeNames(item.assignedTo || []);
                  const assigneeShort = assignees.length > 10 ? assignees.slice(0, 10) + '…' : assignees;
                  const rowColors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
                  const accentColor = rowColors[i % rowColors.length];

                  return (
                    <div
                      key={i}
                      tw="flex items-center px-7 py-4"
                      style={{ borderBottom: '1px solid #F3F4F6' }}
                    >
                      <div tw="flex items-center flex-1">
                        <div tw="flex w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ background: `${accentColor}10` }}>
                          <div tw="w-2.5 h-2.5 rounded-full" style={{ background: accentColor }} />
                        </div>
                        <span tw="text-sm font-bold" style={{ color: '#1F2937' }}>{item.name}</span>
                      </div>
                      <span tw="w-20 text-sm text-center font-medium" style={{ color: '#9CA3AF' }}>{item.qty}×</span>
                      <span tw="w-32 text-sm font-bold text-right" style={{ color: '#10B981' }}>+{fmt(item.price * item.qty)}</span>
                      <div tw="flex w-28 justify-end">
                        {assigneeShort ? (
                          <div tw="flex items-center rounded-lg px-2 py-1" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                            <span tw="text-[10px] font-medium" style={{ color: '#6366F1' }}>{assigneeShort}</span>
                          </div>
                        ) : (
                          <span tw="text-[11px]" style={{ color: '#D1D5DB' }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {remainingCount > 0 && (
                <div tw="flex justify-center py-3">
                  <div tw="flex items-center rounded-xl px-4 py-1" style={{ background: '#F9FAFB' }}>
                    <span tw="text-xs font-medium" style={{ color: '#9CA3AF' }}>+{remainingCount} item lainnya</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div tw="flex items-center justify-between px-7 py-4 mt-auto" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div tw="flex items-center">
                  <span tw="text-xs font-medium" style={{ color: '#9CA3AF' }}>{items.length} item · {members.length} anggota</span>
                </div>
                <div tw="flex items-center">
                  <div tw="flex items-center rounded-xl px-3 py-1 mr-2" style={{ background: 'rgba(16,185,129,0.06)' }}>
                    <span tw="text-xs font-bold" style={{ color: '#10B981' }}>+{fmtShort(subtotal)}</span>
                  </div>
                  {(tax + service) > 0 && (
                    <div tw="flex items-center rounded-xl px-3 py-1" style={{ background: 'rgba(248,113,113,0.06)' }}>
                      <span tw="text-xs font-bold" style={{ color: '#F87171' }}>-{fmtShort(tax + service)}</span>
                    </div>
                  )}
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