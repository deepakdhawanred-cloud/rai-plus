import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FeeLedgerAccount, FeeMonthKey, FeePaymentReceipt } from '../types';
import {
  buildStudentPaymentTimeline,
  type RankedFeeDefaulter,
  type StudentPaymentTimelineAnalysis,
} from './financialDashboardEngine';

const INR = new Intl.NumberFormat('en-IN');

const NAVY: [number, number, number] = [20, 43, 70]; // #142B46
const GOLD: [number, number, number] = [214, 182, 109]; // #D6B66D
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_400: [number, number, number] = [148, 163, 184];
const BORDER_LIGHT: [number, number, number] = [226, 232, 240];
const SURFACE_TINT: [number, number, number] = [248, 250, 252];
const EMERALD_700: [number, number, number] = [4, 120, 87];
const EMERALD_SOFT: [number, number, number] = [167, 243, 208];
const AMBER_700: [number, number, number] = [180, 83, 9];
const ROSE_700: [number, number, number] = [190, 18, 60];
const ROSE_SOFT: [number, number, number] = [253, 164, 175];

/**
 * Formats INR using ASCII "Rs." so jsPDF's standard Helvetica font renders
 * cleanly without unsupported Unicode glyph corruption.
 */
function formatPdfInr(amount: number): string {
  const rounded = Math.round(amount || 0);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}Rs. ${INR.format(Math.abs(rounded))}`;
}

function sanitizePdfText(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/₹/g, 'Rs. ')
    .replace(/[–—]/g, '-')
    .replace(/[•·]/g, '|')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyFilePart(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'report'
  );
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNatureRgb(
  tone: StudentPaymentTimelineAnalysis['paymentNatureTone'],
): [number, number, number] {
  switch (tone) {
    case 'positive':
      return EMERALD_700;
    case 'warning':
      return AMBER_700;
    case 'critical':
      return ROSE_700;
    default:
      return SLATE_600;
  }
}

function stampFooters(doc: jsPDF, leftFooterText: string): void {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const safeLeft = sanitizePdfText(leftFooterText);

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_600);
    doc.text(safeLeft, 14, pageHeight - 8);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - 14, pageHeight - 8, {
      align: 'right',
    });
  }
}

export interface DefaultersListPdfOptions {
  schoolName: string;
  schoolCode: string;
  session: string;
  activeMonth: FeeMonthKey;
  classScope: string;
  defaulters: RankedFeeDefaulter[];
  receipts?: FeePaymentReceipt[];
  paidTillCurrentMonthExcludedCount?: number;
  generatedBy?: string;
  generatedAtIso?: string;
}

/**
 * Builds a landscape A4 PDF report for school-wide or class-scoped fee defaulters,
 * including composite risk score, % left, YTD paid, due till active month,
 * total balance due, and each student's payment nature.
 */
export function buildDefaultersListPdfDoc(opts: DefaultersListPdfOptions): {
  doc: jsPDF;
  filename: string;
} {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const generatedDate = opts.generatedAtIso || getTodayIso();
  const scopeLabel = opts.classScope === 'ALL' ? 'All Classes' : opts.classScope;
  const receipts = opts.receipts || [];

  // Executive header banner
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 27, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizePdfText(opts.schoolName), marginX, 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    sanitizePdfText(
      `Fee Defaulters Report (${scopeLabel}) | Unpaid Till ${opts.activeMonth} | Session ${opts.session}`,
    ),
    marginX,
    18.5,
  );
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(
    sanitizePdfText(
      'Ranked by % Amount Left, Paid YTD, and Balance Due | Includes Annual Payment Nature Classification',
    ),
    marginX,
    24,
  );

  // Right-aligned header metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${generatedDate}`, pageWidth - marginX, 11.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  if (opts.generatedBy) {
    doc.text(sanitizePdfText(`Prepared By: ${opts.generatedBy}`), pageWidth - marginX, 17.5, {
      align: 'right',
    });
  }
  doc.text(
    sanitizePdfText(`School Code: ${opts.schoolCode}`),
    pageWidth - marginX,
    23,
    { align: 'right' },
  );

  // Compute aggregate totals for KPI summary bar
  const totalAccounts = opts.defaulters.length;
  const totalGrossInr = opts.defaulters.reduce((s, a) => s + a.defaulterMetrics.grossFeeInr, 0);
  const totalPaidYtdInr = opts.defaulters.reduce((s, a) => s + a.paidAmountInr, 0);
  const totalOverdueTillMonthInr = opts.defaulters.reduce(
    (s, a) => s + a.defaulterMetrics.overdueTillCurrentMonthInr,
    0,
  );
  const totalBalanceDueInr = opts.defaulters.reduce((s, a) => s + a.balanceFeesInr, 0);
  const criticalCount = opts.defaulters.filter((a) => a.defaulterMetrics.riskTier === 'Critical').length;
  const zeroPayerCount = opts.defaulters.filter((a) => a.paidAmountInr <= 0).length;

  // 4-Box KPI Summary Strip
  const kpiTopY = 32;
  const kpiHeight = 16;
  const kpiGap = 4;
  const kpiWidth = (pageWidth - marginX * 2 - kpiGap * 3) / 4;

  const kpis: Array<{
    label: string;
    value: string;
    sub: string;
    valueColor: [number, number, number];
  }> = [
    {
      label: `Unpaid Accounts Till ${opts.activeMonth}`,
      value: `${totalAccounts} Students`,
      sub: `${criticalCount} Critical | ${zeroPayerCount} Zero-Payers`,
      valueColor: NAVY,
    },
    {
      label: `Total Overdue Till ${opts.activeMonth}`,
      value: formatPdfInr(totalOverdueTillMonthInr),
      sub:
        opts.paidTillCurrentMonthExcludedCount && opts.paidTillCurrentMonthExcludedCount > 0
          ? `${opts.paidTillCurrentMonthExcludedCount} paid till ${opts.activeMonth} excluded`
          : `Scope: ${scopeLabel}`,
      valueColor: ROSE_700,
    },
    {
      label: 'Total Balance Due (Session)',
      value: formatPdfInr(totalBalanceDueInr),
      sub: `Gross Fee: ${formatPdfInr(totalGrossInr)}`,
      valueColor: AMBER_700,
    },
    {
      label: 'Total Paid YTD (Listed Accounts)',
      value: formatPdfInr(totalPaidYtdInr),
      sub:
        totalGrossInr > 0
          ? `${Math.round((totalPaidYtdInr / totalGrossInr) * 100)}% collected across listed`
          : '0% collected',
      valueColor: EMERALD_700,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = marginX + idx * (kpiWidth + kpiGap);
    doc.setFillColor(...SURFACE_TINT);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, kpiTopY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(kpi.label), x + 3, kpiTopY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...kpi.valueColor);
    doc.text(sanitizePdfText(kpi.value), x + 3, kpiTopY + 10.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(kpi.sub), x + 3, kpiTopY + 14.2);
  });

  // Build table rows
  const tableRows = opts.defaulters.map((acc, idx) => {
    const dm = acc.defaulterMetrics;
    const tl = buildStudentPaymentTimeline({
      account: acc,
      activeMonth: opts.activeMonth,
      receipts,
    });
    return [
      String(idx + 1),
      sanitizePdfText(acc.admissionNo),
      sanitizePdfText(`${acc.studentName}\nF: ${acc.fatherName}`),
      sanitizePdfText(acc.className),
      sanitizePdfText(acc.contactNo || '-'),
      sanitizePdfText(
        `${tl.paymentNature}\n(${tl.activePaymentMonthsCount}/${tl.monthsElapsed}m | Last: ${
          tl.lastPaymentMonth ? tl.lastPaymentMonth.slice(0, 3) : 'None'
        })`,
      ),
      sanitizePdfText(`${dm.percentLeft}%\n${dm.riskTier} (${dm.defaulterPriorityScore})`),
      formatPdfInr(acc.paidAmountInr),
      formatPdfInr(dm.overdueTillCurrentMonthInr),
      formatPdfInr(acc.balanceFeesInr),
    ];
  });

  if (tableRows.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...EMERALD_700);
    doc.text(
      sanitizePdfText(
        `All student fee accounts under ${scopeLabel} are paid through ${opts.activeMonth}.`,
      ),
      marginX,
      62,
    );
  } else {
    autoTable(doc, {
      startY: 53,
      margin: { left: marginX, right: marginX, bottom: 18 },
      head: [
        [
          '#',
          'Adm No.',
          'Student & Guardian',
          'Class',
          'Contact',
          'Payment Nature & Rhythm',
          '% Left / Risk',
          'Paid YTD',
          `Due Till ${opts.activeMonth.slice(0, 3)}`,
          'Balance Due',
        ],
      ],
      body: tableRows,
      foot: [
        [
          '',
          '',
          `Total (${totalAccounts} Accounts)`,
          '',
          '',
          '',
          '',
          formatPdfInr(totalPaidYtdInr),
          formatPdfInr(totalOverdueTillMonthInr),
          formatPdfInr(totalBalanceDueInr),
        ],
      ],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: SLATE_900,
        lineColor: BORDER_LIGHT,
        lineWidth: 0.2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.6,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: NAVY,
        fontStyle: 'bold',
        fontSize: 7.8,
      },
      alternateRowStyles: {
        fillColor: [250, 251, 253],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 9 },
        1: { cellWidth: 22 },
        2: { cellWidth: 46 },
        3: { cellWidth: 18 },
        4: { cellWidth: 25 },
        5: { cellWidth: 48 },
        6: { halign: 'right', cellWidth: 24 },
        7: { halign: 'right', cellWidth: 26 },
        8: { halign: 'right', cellWidth: 26 },
        9: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body') {
          if (hookData.column.index === 6) {
            const text = String(hookData.cell.raw || '');
            if (text.includes('Critical')) {
              hookData.cell.styles.textColor = ROSE_700;
              hookData.cell.styles.fontStyle = 'bold';
            } else if (text.includes('High')) {
              hookData.cell.styles.textColor = AMBER_700;
              hookData.cell.styles.fontStyle = 'bold';
            }
          }
          if (hookData.column.index === 8) {
            hookData.cell.styles.textColor = ROSE_700;
          }
        }
      },
    });
  }

  stampFooters(
    doc,
    `${opts.schoolName} (${opts.schoolCode}) | Fee Defaulters Report - ${scopeLabel} | Confidential`,
  );

  const filename = `${slugifyFilePart(opts.schoolCode)}-fee-defaulters-${slugifyFilePart(
    opts.activeMonth,
  )}-${slugifyFilePart(scopeLabel)}.pdf`;

  return { doc, filename };
}

export function exportDefaultersListPdf(opts: DefaultersListPdfOptions): string {
  const { doc, filename } = buildDefaultersListPdfDoc(opts);
  doc.save(filename);
  return filename;
}

export interface StudentPaymentTimelinePdfOptions {
  account: FeeLedgerAccount;
  schoolName: string;
  schoolCode?: string;
  session?: string;
  activeMonth: FeeMonthKey;
  receipts?: FeePaymentReceipt[];
  generatedBy?: string;
  generatedAtIso?: string;
}

/**
 * Builds a portrait A4 Student Annual Fee Payment Timeline & Nature PDF statement
 * containing behavioral assessment, 4 KPI metrics, vector Apr-Mar bar chart,
 * 12-month payment ledger table, and recorded official receipts.
 */
export function buildStudentPaymentTimelinePdfDoc(opts: StudentPaymentTimelinePdfOptions): {
  doc: jsPDF;
  filename: string;
} {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const generatedDate = opts.generatedAtIso || getTodayIso();
  const receipts = opts.receipts || [];
  const { account } = opts;

  const timeline = buildStudentPaymentTimeline({
    account,
    activeMonth: opts.activeMonth,
    receipts,
  });
  const dm = timeline.defaulterMetrics;
  const matchingReceipts = receipts.filter((rcp) =>
    rcp.allocations?.some((al) => al.accountId === account.id),
  );

  // Header Banner
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 26, pageWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizePdfText(opts.schoolName), marginX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(
    sanitizePdfText(
      `Student Annual Fee Payment Timeline & Nature Statement${
        opts.session ? ` | Session ${opts.session}` : ''
      }`,
    ),
    marginX,
    17.5,
  );
  doc.setFontSize(7.8);
  doc.setTextColor(...GOLD);
  doc.text(
    sanitizePdfText(`Active Assessment Month: ${opts.activeMonth} (April - March Ledger)`),
    marginX,
    22.8,
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date: ${generatedDate}`, pageWidth - marginX, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  if (opts.schoolCode) {
    doc.text(sanitizePdfText(`Code: ${opts.schoolCode}`), pageWidth - marginX, 16.5, {
      align: 'right',
    });
  }
  if (opts.generatedBy) {
    doc.text(sanitizePdfText(`By: ${opts.generatedBy}`), pageWidth - marginX, 22, {
      align: 'right',
    });
  }

  // Student Identity & Payment Nature Summary Card
  let cursorY = 32;
  doc.setFillColor(...SURFACE_TINT);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, cursorY, contentWidth, 30, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...NAVY);
  doc.text(sanitizePdfText(account.studentName), marginX + 4, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE_600);
  doc.text(
    sanitizePdfText(
      `Adm No: ${account.admissionNo} | Class: ${account.className} | Plan: ${account.scheduleCadence}`,
    ),
    marginX + 4,
    cursorY + 11.8,
  );
  doc.text(
    sanitizePdfText(
      `Guardian: ${account.fatherName}${account.contactNo ? ` | Phone: ${account.contactNo}` : ''}${
        account.address ? ` | ${account.address}` : ''
      }`,
    ),
    marginX + 4,
    cursorY + 16.5,
  );

  // Payment Nature badge text right-aligned on card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE_600);
  doc.text('PAYMENT NATURE', pageWidth - marginX - 4, cursorY + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...getNatureRgb(timeline.paymentNatureTone));
  doc.text(sanitizePdfText(timeline.paymentNature), pageWidth - marginX - 4, cursorY + 11.5, {
    align: 'right',
  });

  // Behavioral summary line inside card
  doc.setDrawColor(...BORDER_LIGHT);
  doc.line(marginX + 4, cursorY + 19.5, pageWidth - marginX - 4, cursorY + 19.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...SLATE_900);
  const wrappedSummary = doc.splitTextToSize(
    sanitizePdfText(timeline.paymentNatureSummary),
    contentWidth - 8,
  );
  doc.text(wrappedSummary.slice(0, 2), marginX + 4, cursorY + 24);

  // 4-Box KPI Strip
  cursorY += 34;
  const kpiHeight = 16;
  const kpiGap = 3;
  const kpiWidth = (contentWidth - kpiGap * 3) / 4;

  const studentKpis: Array<{
    label: string;
    value: string;
    sub: string;
    color: [number, number, number];
  }> = [
    {
      label: 'Paid YTD / Gross Fee',
      value: formatPdfInr(account.paidAmountInr),
      sub: `${dm.percentPaid}% paid | ${dm.percentLeft}% left`,
      color: account.paidAmountInr > 0 ? EMERALD_700 : ROSE_700,
    },
    {
      label: 'Paying Frequency',
      value: `${timeline.activePaymentMonthsCount} of ${timeline.monthsElapsed} mos`,
      sub: `Avg ${formatPdfInr(timeline.averageInstallmentInr)}/deposit`,
      color: NAVY,
    },
    {
      label: 'Last Payment',
      value: timeline.lastPaymentMonth
        ? `${timeline.lastPaymentMonth.slice(0, 3)} (${formatPdfInr(timeline.lastPaymentAmountInr)})`
        : 'None Yet',
      sub: timeline.largestPaymentMonth
        ? `Peak: ${formatPdfInr(timeline.largestPaymentInr)} (${timeline.largestPaymentMonth.slice(0, 3)})`
        : '0 deposits logged',
      color: SLATE_900,
    },
    {
      label: `Status Through ${opts.activeMonth}`,
      value: dm.hasPaidTillCurrentMonth
        ? `Paid Till ${dm.paidTillMonthLabel}`
        : `${formatPdfInr(dm.overdueTillCurrentMonthInr)} Due`,
      sub: `Bal: ${formatPdfInr(account.balanceFeesInr)} | Gap: ${timeline.longestUnpaidGapMonths}m`,
      color: dm.hasPaidTillCurrentMonth ? EMERALD_700 : ROSE_700,
    },
  ];

  studentKpis.forEach((kpi, idx) => {
    const x = marginX + idx * (kpiWidth + kpiGap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.roundedRect(x, cursorY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(kpi.label), x + 2.5, cursorY + 4.6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...kpi.color);
    doc.text(sanitizePdfText(kpi.value), x + 2.5, cursorY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.7);
    doc.setTextColor(...SLATE_600);
    doc.text(sanitizePdfText(kpi.sub), x + 2.5, cursorY + 14);
  });

  // Vector April-March Monthly Payment Rhythm Chart
  cursorY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('April - March Monthly Payment Rhythm', marginX, cursorY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_600);
  doc.text(
    'Green: Paid | Light Green: Covered Ahead | Red: Missed | Grey: Upcoming',
    pageWidth - marginX,
    cursorY + 3,
    { align: 'right' },
  );

  const chartBoxY = cursorY + 5;
  const chartBoxH = 34;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER_LIGHT);
  doc.roundedRect(marginX, chartBoxY, contentWidth, chartBoxH, 1.5, 1.5, 'FD');

  const plotLeft = marginX + 6;
  const plotRight = pageWidth - marginX - 4;
  const plotTop = chartBoxY + 6;
  const plotBottom = chartBoxY + chartBoxH - 8;
  const plotH = plotBottom - plotTop;
  const maxPaid = Math.max(1, ...timeline.months.map((m) => m.paidInr));
  const slotW = (plotRight - plotLeft) / 12;
  const barW = slotW * 0.56;

  // Baseline + mid gridline
  doc.setDrawColor(...BORDER_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(plotLeft, plotBottom, plotRight, plotBottom);
  doc.line(plotLeft, plotTop + plotH / 2, plotRight, plotTop + plotH / 2);

  timeline.months.forEach((m, idx) => {
    const slotCenterX = plotLeft + idx * slotW + slotW / 2;
    const barX = slotCenterX - barW / 2;
    const barH = m.paidInr > 0 ? Math.max(3, (m.paidInr / maxPaid) * plotH) : 2.2;
    const barY = plotBottom - barH;

    if (m.status === 'Paid') {
      doc.setFillColor(...EMERALD_700);
    } else if (m.status === 'Covered Ahead') {
      doc.setFillColor(...EMERALD_SOFT);
    } else if (m.status === 'Missed') {
      doc.setFillColor(...ROSE_SOFT);
    } else {
      doc.setFillColor(...BORDER_LIGHT);
    }

    doc.rect(barX, barY, barW, barH, 'F');

    if (m.isCurrentMonth) {
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.45);
      doc.rect(barX - 0.5, barY - 0.5, barW + 1, barH + 1, 'S');
    }

    if (m.paidInr > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(...SLATE_900);
      const compactVal =
        m.paidInr >= 1000 ? `${(m.paidInr / 1000).toFixed(m.paidInr % 1000 === 0 ? 0 : 1)}k` : String(m.paidInr);
      doc.text(compactVal, slotCenterX, Math.max(chartBoxY + 4, barY - 1.2), {
        align: 'center',
      });
    }

    doc.setFont('helvetica', m.isCurrentMonth ? 'bold' : 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...(m.isCurrentMonth ? NAVY : SLATE_600));
    doc.text(m.shortLabel, slotCenterX, plotBottom + 4.5, { align: 'center' });
  });

  // 12-Month Breakdown Table
  cursorY = chartBoxY + chartBoxH + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('Month-by-Month Payment Ledger (April - March)', marginX, cursorY);

  autoTable(doc, {
    startY: cursorY + 2.5,
    margin: { left: marginX, right: marginX, bottom: 18 },
    head: [
      [
        'Month',
        'Monthly Paid',
        'Cumulative Paid',
        'Cumulative Expected',
        'Surplus / Shortfall',
        'Status',
      ],
    ],
    body: timeline.months.map((m) => {
      const variance = m.cumulativePaidInr - m.cumulativeExpectedInr;
      const varianceLabel =
        variance >= 0 ? `+${formatPdfInr(variance)}` : formatPdfInr(variance);
      return [
        m.isCurrentMonth ? `${m.monthKey} (Current)` : m.monthKey,
        formatPdfInr(m.paidInr),
        formatPdfInr(m.cumulativePaidInr),
        formatPdfInr(m.cumulativeExpectedInr),
        varianceLabel,
        m.status,
      ];
    }),
    foot: [
      [
        'Session Total',
        formatPdfInr(account.paidAmountInr),
        formatPdfInr(account.paidAmountInr),
        formatPdfInr(dm.grossFeeInr),
        formatPdfInr(account.paidAmountInr - dm.grossFeeInr),
        account.balanceFeesInr <= 0 ? 'Settled' : `Bal ${formatPdfInr(account.balanceFeesInr)}`,
      ],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: SLATE_900,
      lineColor: BORDER_LIGHT,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.6,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: NAVY,
      fontStyle: 'bold',
      fontSize: 7.6,
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { halign: 'right', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 28, fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 5) {
        const val = String(hookData.cell.raw || '');
        if (val === 'Paid') hookData.cell.styles.textColor = EMERALD_700;
        else if (val === 'Covered Ahead') hookData.cell.styles.textColor = NAVY;
        else if (val === 'Missed') hookData.cell.styles.textColor = ROSE_700;
        else hookData.cell.styles.textColor = SLATE_400;
      }
    },
  });

  // Recorded Official Receipts Section (if any)
  const docWithAutoTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  let afterTableY = (docWithAutoTable.lastAutoTable?.finalY ?? 220) + 6;

  if (matchingReceipts.length > 0) {
    if (afterTableY > 245) {
      doc.addPage();
      afterTableY = 18;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(
      `Recorded Official Receipts (${matchingReceipts.length})`,
      marginX,
      afterTableY,
    );

    autoTable(doc, {
      startY: afterTableY + 2.5,
      margin: { left: marginX, right: marginX, bottom: 20 },
      head: [['Date', 'Receipt No.', 'Covered Months', 'Mode', 'Amount Allocated']],
      body: matchingReceipts.map((rcp) => {
        const alloc = rcp.allocations.find((al) => al.accountId === account.id);
        return [
          sanitizePdfText(rcp.paidDate),
          sanitizePdfText(rcp.receiptNo),
          sanitizePdfText(
            rcp.coveredMonths && rcp.coveredMonths.length > 0
              ? rcp.coveredMonths.join(', ')
              : rcp.monthKey,
          ),
          sanitizePdfText(rcp.paymentMode),
          formatPdfInr(alloc?.allocatedInr ?? rcp.amountInr),
        ];
      }),
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.4,
        cellPadding: 2,
        textColor: SLATE_900,
        lineColor: BORDER_LIGHT,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold', textColor: EMERALD_700 },
      },
    });
    afterTableY = (docWithAutoTable.lastAutoTable?.finalY ?? afterTableY + 20) + 6;
  }

  // Schedule note / remarks + signature lines
  if (account.expectedScheduleNote || account.remarks) {
    if (afterTableY > 262) {
      doc.addPage();
      afterTableY = 18;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(...SLATE_600);
    const noteText = sanitizePdfText(
      `Ledger Notes: ${account.expectedScheduleNote || ''}${
        account.remarks ? ` | ${account.remarks}` : ''
      }`,
    );
    doc.text(doc.splitTextToSize(noteText, contentWidth), marginX, afterTableY);
    afterTableY += 7;
  }

  if (afterTableY < 268) {
    const sigY = Math.max(afterTableY + 8, 258);
    doc.setDrawColor(...SLATE_400);
    doc.setLineWidth(0.25);
    doc.line(marginX, sigY, marginX + 52, sigY);
    doc.line(pageWidth - marginX - 52, sigY, pageWidth - marginX, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_600);
    doc.text('Accounts Officer', marginX, sigY + 4);
    doc.text('Principal / Authorized Signatory', pageWidth - marginX, sigY + 4, {
      align: 'right',
    });
  }

  stampFooters(
    doc,
    `${opts.schoolName} | Student Payment Timeline: ${account.studentName} (${account.admissionNo})`,
  );

  const filename = `${slugifyFilePart(
    opts.schoolCode || opts.schoolName,
  )}-payment-timeline-${slugifyFilePart(account.admissionNo)}-${slugifyFilePart(
    account.studentName,
  )}.pdf`;

  return { doc, filename };
}

export function exportStudentPaymentTimelinePdf(opts: StudentPaymentTimelinePdfOptions): string {
  const { doc, filename } = buildStudentPaymentTimelinePdfDoc(opts);
  doc.save(filename);
  return filename;
}
