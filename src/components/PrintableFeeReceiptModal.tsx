import React, { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Download, Printer, X } from 'lucide-react';
import type { FeePaymentReceipt, School } from '../types';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';

interface PrintableFeeReceiptModalProps {
  receipt: FeePaymentReceipt | null;
  school: School;
  onClose: () => void;
}

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

function numberToIndianWords(num: number): string {
  const n = Math.round(Math.abs(num || 0));
  if (n === 0) return 'Zero';
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigits = (x: number): string => {
    if (x < 20) return ones[x];
    const t = Math.floor(x / 10);
    const o = x % 10;
    return `${tens[t]}${o ? ` ${ones[o]}` : ''}`;
  };

  const threeDigits = (x: number): string => {
    const h = Math.floor(x / 100);
    const rem = x % 100;
    if (h && rem) return `${ones[h]} Hundred ${twoDigits(rem)}`;
    if (h) return `${ones[h]} Hundred`;
    return twoDigits(rem);
  };

  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(' ');
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReceiptCopyHtml(
  receipt: FeePaymentReceipt,
  school: School,
  copyLabel: string,
): string {
  const paidTill = receipt.paidTillMonth || receipt.monthKey;
  const pendingBalance = receipt.totalPendingBalanceInr ?? 0;
  const prevBalance =
    receipt.previousPendingBalanceInr !== undefined
      ? receipt.previousPendingBalanceInr
      : pendingBalance + receipt.amountInr;
  const amountWords = `${numberToIndianWords(receipt.amountInr)} Rupees Only`;
  const coveredMonthsLabel =
    receipt.coveredMonths && receipt.coveredMonths.length > 0
      ? receipt.coveredMonths.join(', ')
      : `Paid Till ${paidTill}`;
  const partialNote =
    receipt.partialAdjustedMonth && (receipt.partialMonthTotalPaidInr ?? 0) > 0
      ? ` + Partial adj. in ${receipt.partialAdjustedMonth} (${formatInr(receipt.partialMonthTotalPaidInr ?? 0)} paid, ${formatInr(receipt.partialMonthRemainingInr ?? 0)} bal.)`
      : '';
  const planLabel = receipt.scheduleCadence ? `${receipt.scheduleCadence} Plan` : 'Standard Plan';

  const allocationRows = receipt.allocations
    .map(
      (al, idx) => `
      <tr>
        <td style="padding:7px 10px;border-bottom:1px solid #E6D8C6;">${idx + 1}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #E6D8C6;font-weight:600;">${escapeHtml(al.studentName)}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #E6D8C6;">${escapeHtml(al.className)}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #E6D8C6;">
          Tuition / School Fee · Months: <strong>${escapeHtml(coveredMonthsLabel)}</strong>${escapeHtml(partialNote)}
          ${receipt.lybAdjustedInr ? ` · LYB Arrears: ${formatInr(receipt.lybAdjustedInr)}` : ''}
        </td>
        <td style="padding:7px 10px;border-bottom:1px solid #E6D8C6;text-align:right;font-family:monospace;font-weight:700;">${formatInr(al.allocatedInr)}</td>
      </tr>`,
    )
    .join('');

  const upcomingRowsHtml =
    receipt.upcomingInstallments && receipt.upcomingInstallments.length > 0
      ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #D6B66D;display:flex;flex-wrap:wrap;gap:8px;font-size:10.5px;color:#4A6078;">
          <strong style="color:#142B46;">Upcoming Schedule (${escapeHtml(planLabel)}):</strong>
          ${receipt.upcomingInstallments
            .slice(0, 4)
            .map(
              (inst) =>
                `<span>${escapeHtml(inst.label)}: <strong style="font-family:monospace;color:#142B46;">${formatInr(inst.expectedAmountInr)}</strong> (${escapeHtml(inst.dueDate)})</span>`,
            )
            .join(' &nbsp;|&nbsp; ')}
        </div>`
      : '';

  const nextDueHtml =
    receipt.nextExpectedFeeDate || (receipt.nextExpectedFeeAmountInr && receipt.nextExpectedFeeAmountInr > 0)
      ? `
      <div style="margin-top:12px;padding:10px 14px;border-radius:8px;border:1px solid #D6B66D;background:#FAF4EC;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7B5D1C;">Next Expected Fee &amp; Calendar Reminder (${escapeHtml(planLabel)})</div>
            <div style="font-size:13px;font-weight:700;color:#142B46;margin-top:2px;">
              ${receipt.nextExpectedFeeAmountInr ? formatInr(receipt.nextExpectedFeeAmountInr) : formatInr(pendingBalance)}
              ${receipt.nextExpectedFeeMonth ? ` (${escapeHtml(receipt.nextExpectedFeeMonth)})` : ''}
              ${receipt.nextExpectedFeeDate ? ` · Expected On: <span style="font-family:monospace;">${escapeHtml(receipt.nextExpectedFeeDate)}</span>` : ''}
            </div>
          </div>
          <div style="font-size:11px;font-weight:600;color:#3D6349;white-space:nowrap;">Calendar Reminder Synced</div>
        </div>
        ${upcomingRowsHtml}
      </div>`
      : pendingBalance === 0
        ? `
      <div style="margin-top:12px;padding:9px 14px;border-radius:8px;border:1px solid #C6DCCC;background:#F0F6F2;font-size:12px;font-weight:700;color:#2D5139;">
        All session dues cleared. Zero pending balance remaining.
      </div>`
        : '';

  return `
    <div style="border:1.5px solid #142B46;border-radius:10px;overflow:hidden;background:#ffffff;margin-bottom:18px;page-break-inside:avoid;">
      <div style="background:#142B46;color:#F3E6D8;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${RAI_PLUS_LOGO_URL}" alt="Rai Plus Logo" style="width:44px;height:44px;border-radius:8px;border:1px solid #D6B66D;object-fit:cover;background:#F3E6D8;flex-shrink:0;" />
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#D6B66D;">RAI PLUS+ · OFFICIAL FEE RECEIPT · ${escapeHtml(copyLabel)}</div>
            <h2 style="margin:3px 0 2px;font-size:18px;font-weight:800;color:#ffffff;">${escapeHtml(school.name)}</h2>
            <div style="font-size:11px;color:#A9C5D8;">${escapeHtml(school.city)}, ${escapeHtml(school.state)} · ${escapeHtml(school.board)} · UDISE: ${escapeHtml(school.udiseCode)} · MIS: ${escapeHtml(school.haryanaMisCode)}</div>
          </div>
        </div>
        <div style="text-align:right;font-size:11px;white-space:nowrap;">
          <div style="font-family:monospace;font-size:14px;font-weight:800;color:#D6B66D;">${escapeHtml(receipt.receiptNo)}</div>
          <div style="margin-top:2px;color:#F3E6D8;">Date: <strong style="font-family:monospace;">${escapeHtml(receipt.paidDate)}</strong></div>
          <div style="color:#A9C5D8;">Session ${escapeHtml(school.session)} · ${escapeHtml(planLabel)}</div>
        </div>
      </div>

      <div style="padding:14px 18px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-bottom:12px;border-bottom:1px solid #E6D8C6;font-size:11.5px;">
          <div>
            <div style="color:#64778C;font-size:10px;text-transform:uppercase;font-weight:600;">Student / Family</div>
            <div style="font-weight:700;color:#142B46;margin-top:2px;">${escapeHtml(receipt.payerLabel)}</div>
            ${receipt.fatherName ? `<div style="color:#4A6078;font-size:11px;">Father/Guardian: ${escapeHtml(receipt.fatherName)}</div>` : ''}
          </div>
          <div>
            <div style="color:#64778C;font-size:10px;text-transform:uppercase;font-weight:600;">Class, Adm &amp; Payment Plan</div>
            <div style="font-weight:700;color:#142B46;margin-top:2px;">${escapeHtml(receipt.className || receipt.allocations.map((a) => a.className).join(', '))} · ${escapeHtml(planLabel)}</div>
            ${receipt.admissionNo ? `<div style="color:#4A6078;font-size:11px;font-family:monospace;">Adm: ${escapeHtml(receipt.admissionNo)}</div>` : ''}
          </div>
          <div>
            <div style="color:#64778C;font-size:10px;text-transform:uppercase;font-weight:600;">Payment Mode &amp; Paid Till</div>
            <div style="font-weight:700;color:#142B46;margin-top:2px;">${escapeHtml(receipt.paymentMode)} · Paid Till <span style="color:#3D6349;">${escapeHtml(paidTill)}</span></div>
            ${receipt.contactNo ? `<div style="color:#4A6078;font-size:11px;font-family:monospace;">Ph: ${escapeHtml(receipt.contactNo)}</div>` : ''}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:10px;">
          <thead>
            <tr style="background:#FAF4EC;color:#4A6078;text-align:left;font-size:10.5px;text-transform:uppercase;">
              <th style="padding:7px 10px;border-bottom:1px solid #D9C9B6;">#</th>
              <th style="padding:7px 10px;border-bottom:1px solid #D9C9B6;">Student Name</th>
              <th style="padding:7px 10px;border-bottom:1px solid #D9C9B6;">Class</th>
              <th style="padding:7px 10px;border-bottom:1px solid #D9C9B6;">Fee Particulars</th>
              <th style="padding:7px 10px;border-bottom:1px solid #D9C9B6;text-align:right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>${allocationRows}</tbody>
        </table>

        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <div style="padding:9px 10px;border-radius:7px;border:1px solid #E6D8C6;background:#FAF4EC;">
            <div style="font-size:10px;color:#64778C;font-weight:600;">Previous Pending</div>
            <div style="font-family:monospace;font-size:13px;font-weight:700;color:#142B46;margin-top:2px;">${formatInr(prevBalance)}</div>
          </div>
          <div style="padding:9px 10px;border-radius:7px;border:1px solid #C6DCCC;background:#F0F6F2;">
            <div style="font-size:10px;color:#3D6349;font-weight:700;">Fee Paid Now</div>
            <div style="font-family:monospace;font-size:14px;font-weight:800;color:#2D5139;margin-top:2px;">${formatInr(receipt.amountInr)}</div>
          </div>
          <div style="padding:9px 10px;border-radius:7px;border:1px solid #C8DCE9;background:#F1F6FA;">
            <div style="font-size:10px;color:#142B46;font-weight:700;">Fee Paid Till Month</div>
            <div style="font-size:13px;font-weight:800;color:#142B46;margin-top:2px;">${escapeHtml(paidTill)}</div>
          </div>
          <div style="padding:9px 10px;border-radius:7px;border:1px solid #D6B66D;background:#FCF7EE;">
            <div style="font-size:10px;color:#7B5D1C;font-weight:700;">Total Pending Balance</div>
            <div style="font-family:monospace;font-size:14px;font-weight:800;color:#7B5D1C;margin-top:2px;">${formatInr(pendingBalance)}</div>
          </div>
        </div>

        <div style="margin-top:8px;font-size:11px;color:#4A6078;">
          <strong>Amount in Words:</strong> ${escapeHtml(amountWords)}
          ${receipt.remarks ? ` &nbsp;·&nbsp; <strong>Ref / Remarks:</strong> ${escapeHtml(receipt.remarks)}` : ''}
        </div>

        ${nextDueHtml}

        <div style="margin-top:18px;padding-top:12px;border-top:1px dashed #D9C9B6;display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;color:#4A6078;">
          <div>
            <div>Received By: <strong style="color:#142B46;">${escapeHtml(receipt.recordedBy)}</strong></div>
            <div style="font-size:10px;color:#64778C;">System-generated receipt · Rai Plus Accounts Desk</div>
          </div>
          <div style="display:flex;gap:36px;text-align:center;">
            <div style="min-width:130px;border-top:1px solid #64778C;padding-top:4px;">Parent / Depositor Signature</div>
            <div style="min-width:140px;border-top:1px solid #142B46;padding-top:4px;font-weight:700;color:#142B46;">Accountant / Auth. Signatory</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildStandaloneReceiptDocument(
  receipt: FeePaymentReceipt,
  school: School,
  dualCopy: boolean,
): string {
  const body = dualCopy
    ? `${buildReceiptCopyHtml(receipt, school, 'PARENT COPY')}
       <div style="border-top:1px dashed #8D9CAE;margin:14px 0;text-align:center;font-size:10px;color:#64778C;padding-top:4px;">✂ Tear Along Line — Office Record Below ✂</div>
       ${buildReceiptCopyHtml(receipt, school, 'SCHOOL OFFICE COPY')}`
    : buildReceiptCopyHtml(receipt, school, 'PARENT / OFFICE COPY');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt ${escapeHtml(receipt.receiptNo)} — ${escapeHtml(school.name)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 12px;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
      color: #142B46;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

export const PrintableFeeReceiptModal: React.FC<PrintableFeeReceiptModalProps> = ({
  receipt,
  school,
  onClose,
}) => {
  const [dualCopy, setDualCopy] = useState<boolean>(true);

  const amountWords = useMemo(
    () => (receipt ? `${numberToIndianWords(receipt.amountInr)} Rupees Only` : ''),
    [receipt],
  );

  if (!receipt) return null;

  const paidTill = receipt.paidTillMonth || receipt.monthKey;
  const pendingBalance = receipt.totalPendingBalanceInr ?? 0;
  const prevBalance =
    receipt.previousPendingBalanceInr !== undefined
      ? receipt.previousPendingBalanceInr
      : pendingBalance + receipt.amountInr;

  function handlePrintReceipt() {
    if (!receipt) return;
    const html = buildStandaloneReceiptDocument(receipt, school, dualCopy);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      window.setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          window.setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 1500);
        }
      }, 120);
    } else {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      window.print();
    }
  }

  function handleDownloadHtml() {
    if (!receipt) return;
    const html = buildStandaloneReceiptDocument(receipt, school, dualCopy);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RaiPlus-Fee-Receipt-${receipt.receiptNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fee-receipt-preview-title"
      data-testid="printable-fee-receipt-modal"
    >
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Top Modal Controls */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#FAF4EC] px-6 py-3.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7B5D1C]">
              Official Fee Receipt Ready to Print
            </p>
            <h2
              id="fee-receipt-preview-title"
              className="font-display text-base font-bold text-[#142B46]"
            >
              Receipt {receipt.receiptNo} · {receipt.payerLabel}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dualCopy}
                onChange={(e) => setDualCopy(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              Dual Copy (Parent + Office)
            </label>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Save Copy
            </button>
            <button
              type="button"
              data-testid="print-official-receipt-btn"
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5 text-[#D6B66D]" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt preview"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Receipt Paper Preview */}
        <div className="p-6 bg-white">
          <div className="rounded-xl border-2 border-[#142B46] overflow-hidden">
            {/* School Letterhead Header */}
            <div className="bg-[#142B46] text-[#F3E6D8] px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={RAI_PLUS_LOGO_URL}
                  alt="Rai Plus Logo"
                  className="h-11 w-11 rounded-lg border border-[#D6B66D]/70 object-cover bg-[#F3E6D8] shrink-0"
                />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6B66D]">
                    RAI PLUS+ · Official School Fee Receipt
                  </p>
                  <h3 className="font-display text-lg font-bold text-white mt-0.5">
                    {school.name}
                  </h3>
                  <p className="text-xs text-[#A9C5D8] mt-0.5">
                    {school.city}, {school.state} · {school.board} · UDISE: {school.udiseCode} · MIS:{' '}
                    {school.haryanaMisCode}
                  </p>
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="font-mono text-base font-bold text-[#D6B66D] tabular-nums">
                  {receipt.receiptNo}
                </p>
                <p className="text-xs text-[#F3E6D8] mt-0.5">
                  Date: <span className="font-mono font-semibold tabular-nums">{receipt.paidDate}</span>
                </p>
                <p className="text-xs text-[#A9C5D8]">Session {school.session}</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Student / Family Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-4 text-xs">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Student / Family
                  </p>
                  <p className="font-semibold text-[#142B46] text-sm mt-0.5">{receipt.payerLabel}</p>
                  {receipt.fatherName && (
                    <p className="text-slate-600 mt-0.5">Father / Guardian: {receipt.fatherName}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Class, Adm &amp; Payment Plan
                  </p>
                  <p className="font-semibold text-[#142B46] text-sm mt-0.5">
                    {receipt.className ||
                      Array.from(new Set(receipt.allocations.map((a) => a.className))).join(', ')}
                    {receipt.scheduleCadence ? ` · ${receipt.scheduleCadence} Plan` : ''}
                  </p>
                  {receipt.admissionNo && (
                    <p className="font-mono text-slate-600 mt-0.5">Adm: {receipt.admissionNo}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Payment Mode &amp; Contact
                  </p>
                  <p className="font-semibold text-[#142B46] text-sm mt-0.5">
                    {receipt.paymentMode} · Ledger {receipt.monthKey}
                  </p>
                  {receipt.contactNo && (
                    <p className="font-mono text-slate-600 mt-0.5">Ph: {receipt.contactNo}</p>
                  )}
                </div>
              </div>

              {/* Allocation Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF4EC] text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">#</th>
                      <th className="px-4 py-2.5 font-semibold">Student Name</th>
                      <th className="px-4 py-2.5 font-semibold">Class</th>
                      <th className="px-4 py-2.5 font-semibold">Months Covered &amp; Adjustments</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.allocations.map((al, idx) => (
                      <tr key={al.accountId}>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-[#142B46]">{al.studentName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{al.className}</td>
                        <td className="px-4 py-2.5 text-slate-700">
                          <div>
                            {receipt.coveredMonths && receipt.coveredMonths.length > 0 ? (
                              <>
                                Months Covered:{' '}
                                <strong className="text-[#142B46]">
                                  {receipt.coveredMonths.join(', ')}
                                </strong>
                              </>
                            ) : (
                              <>School / Tuition Fee (Paid Till {paidTill})</>
                            )}
                          </div>
                          {receipt.partialAdjustedMonth &&
                            (receipt.partialMonthTotalPaidInr ?? 0) > 0 && (
                              <div className="text-[11px] font-semibold text-[#7B5D1C] mt-0.5">
                                Partial Adjusted in {receipt.partialAdjustedMonth}:{' '}
                                <span className="font-mono">
                                  {formatInr(receipt.partialMonthTotalPaidInr ?? 0)}
                                </span>{' '}
                                paid ·{' '}
                                <span className="font-mono">
                                  {formatInr(receipt.partialMonthRemainingInr ?? 0)}
                                </span>{' '}
                                balance left for {receipt.partialAdjustedMonth}
                              </div>
                            )}
                          {receipt.lybAdjustedInr && receipt.lybAdjustedInr > 0 ? (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Previous Session Arrears (LYB) Adjusted:{' '}
                              <span className="font-mono font-semibold">
                                {formatInr(receipt.lybAdjustedInr)}
                              </span>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-[#2D5139] text-right tabular-nums">
                          {formatInr(al.allocatedInr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Core 4-Metric Financial Summary: Previous Pending, Paid Now, Paid Till Month, Total Pending Balance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 bg-[#FAF4EC] p-3">
                  <p className="text-[11px] font-medium text-slate-500">Previous Pending</p>
                  <p className="mt-1 font-mono text-base font-bold text-[#142B46] tabular-nums">
                    {formatInr(prevBalance)}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[11px] font-semibold text-emerald-800">Fee Paid Now</p>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-800 tabular-nums">
                    {formatInr(receipt.amountInr)}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[11px] font-semibold text-[#142B46]">Fee Paid Till Month</p>
                  <p
                    data-testid="receipt-paid-till-month"
                    className="mt-1 font-display text-base font-bold text-[#142B46]"
                  >
                    {paidTill}
                  </p>
                  {receipt.partialAdjustedMonth && (receipt.partialMonthTotalPaidInr ?? 0) > 0 && (
                    <p className="text-[10px] font-semibold text-[#7B5D1C] mt-0.5">
                      + {formatInr(receipt.partialMonthTotalPaidInr ?? 0)} in{' '}
                      {receipt.partialAdjustedMonth}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-[#D6B66D] bg-[#FCF7EE] p-3">
                  <p className="text-[11px] font-semibold text-[#7B5D1C]">Total Pending Balance</p>
                  <p
                    data-testid="receipt-pending-balance"
                    className="mt-1 font-mono text-base font-bold text-[#7B5D1C] tabular-nums"
                  >
                    {formatInr(pendingBalance)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                <span className="font-semibold text-[#142B46]">Amount in Words:</span> {amountWords}
                {receipt.remarks && (
                  <>
                    {' '}
                    · <span className="font-semibold text-[#142B46]">Reference / Remarks:</span>{' '}
                    {receipt.remarks}
                  </>
                )}
              </p>

              {/* Next Expected Fee & Calendar Reminder Box */}
              {receipt.nextExpectedFeeDate ||
              (receipt.nextExpectedFeeAmountInr && receipt.nextExpectedFeeAmountInr > 0) ? (
                <div
                  data-testid="receipt-next-expected-fee"
                  className="rounded-xl border border-[#D6B66D] bg-[#FAF4EC] px-4 py-3.5 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CalendarClock className="h-4 w-4 text-[#7B5D1C] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
                          Next Expected Fee &amp; Scheduled Reminder
                          {receipt.scheduleCadence ? ` (${receipt.scheduleCadence} Plan)` : ''}
                        </p>
                        <p className="text-sm font-bold text-[#142B46] mt-0.5 tabular-nums">
                          {formatInr(receipt.nextExpectedFeeAmountInr ?? pendingBalance)}
                          {receipt.nextExpectedFeeMonth ? ` (${receipt.nextExpectedFeeMonth})` : ''}
                          {receipt.nextExpectedFeeDate
                            ? ` · Expected Date: ${receipt.nextExpectedFeeDate}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D6349] whitespace-nowrap shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                      Updated in Fee Reminder Calendar
                    </span>
                  </div>

                  {receipt.upcomingInstallments && receipt.upcomingInstallments.length > 0 && (
                    <div className="border-t border-[#D6B66D]/50 pt-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Remaining {receipt.scheduleCadence || 'Session'} Payment Roadmap
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {receipt.upcomingInstallments.slice(0, 4).map((inst, idx) => (
                          <div
                            key={`${inst.label}-${idx}`}
                            className="rounded-lg border border-[#D6B66D]/60 bg-white px-2.5 py-1.5 text-[11px]"
                          >
                            <p className="font-semibold text-[#142B46] truncate">{inst.label}</p>
                            <p className="font-mono font-bold text-[#7B5D1C] tabular-nums">
                              {formatInr(inst.expectedAmountInr)}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                              Due {inst.dueDate}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : pendingBalance === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  All session fee dues are cleared. Zero pending balance remaining.
                </div>
              ) : null}

              {/* Signatures Footer */}
              <div className="pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-slate-600">
                <div>
                  <p>
                    Recorded By:{' '}
                    <span className="font-semibold text-[#142B46]">{receipt.recordedBy}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verified computer-generated receipt · Rai Plus Accounts Desk
                  </p>
                </div>
                <div className="flex items-end gap-8">
                  <div className="min-w-[130px] border-t border-slate-400 pt-1.5 text-center">
                    Parent / Depositor
                  </div>
                  <div className="min-w-[140px] border-t border-[#142B46] pt-1.5 text-center font-semibold text-[#142B46]">
                    Accountant Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
