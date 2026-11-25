import React, { useMemo, useState } from 'react';
import { ExternalLink, FileSearch, Loader2, UserPlus, ArrowUpRight } from 'lucide-react';
import type { StudentRecord, VisParsedReportProfile, VisReportCatalogItem } from '../types';
import { apiRequest } from '../utils/api';

interface VisReportsVaultPanelProps {
  catalog: VisReportCatalogItem[];
  parsedReports: Record<string, VisParsedReportProfile>;
  enrolledStudents?: StudentRecord[];
  token: string;
  onRefresh: () => Promise<void>;
  onOpenProfileModal: (profile: VisParsedReportProfile, item: VisReportCatalogItem) => void;
  onOpenStudent360?: (studentId: string) => void;
}

const CLASS_ORDER = [
  'All',
  'Bridge Class',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export const VisReportsVaultPanel: React.FC<VisReportsVaultPanelProps> = ({
  catalog,
  parsedReports,
  enrolledStudents = [],
  token,
  onRefresh,
  onOpenProfileModal,
  onOpenStudent360,
}) => {
  const [selectedClass, setSelectedClass] = useState('All');
  const [query, setQuery] = useState('');
  const [onlyParsed, setOnlyParsed] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const studentByFileId = useMemo(() => {
    const map = new Map<string, StudentRecord>();
    for (const st of enrolledStudents) {
      if (st.visReportFileId) map.set(st.visReportFileId, st);
    }
    return map;
  }, [enrolledStudents]);

  const availableClasses = useMemo(() => {
    const present = new Set(catalog.map((c) => c.normalizedClass));
    return CLASS_ORDER.filter((cls) => cls === 'All' || present.has(cls));
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((item) => {
      if (selectedClass !== 'All' && item.normalizedClass !== selectedClass) return false;
      if (onlyParsed && !parsedReports[item.fileId]) return false;
      if (q) {
        const hay = `${item.studentName} ${item.fileName} ${item.normalizedClass} ${item.section}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [catalog, selectedClass, query, onlyParsed, parsedReports]);

  const parsedCount = useMemo(
    () => catalog.filter((item) => Boolean(parsedReports[item.fileId])).length,
    [catalog, parsedReports],
  );

  async function handleExtractOrInspect(item: VisReportCatalogItem) {
    setErrorMsg(null);
    const existing = parsedReports[item.fileId];
    if (existing) {
      onOpenProfileModal(existing, item);
      return;
    }

    setExtractingId(item.fileId);
    try {
      const res = await apiRequest<{ profile: VisParsedReportProfile }>(
        `/api/vis-reports/${encodeURIComponent(item.fileId)}/extract`,
        { method: 'POST', body: JSON.stringify({}) },
        token,
      );
      await onRefresh();
      onOpenProfileModal(res.profile, item);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to extract Drive PDF right now.');
    } finally {
      setExtractingId(null);
    }
  }

  async function handleEnrolAndOpen(item: VisReportCatalogItem) {
    setErrorMsg(null);
    const linked = studentByFileId.get(item.fileId);
    if (linked && onOpenStudent360) {
      onOpenStudent360(linked.id);
      return;
    }

    setEnrollingId(item.fileId);
    try {
      const res = await apiRequest<{ student: StudentRecord }>(
        `/api/vis-reports/${encodeURIComponent(item.fileId)}/enrol`,
        { method: 'POST', body: JSON.stringify({}) },
        token,
      );
      await onRefresh();
      if (onOpenStudent360) {
        onOpenStudent360(res.student.id);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to add student to 360° directory.');
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              VIS Student Reports Vault — Real Google Drive PDF Index
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {catalog.length} DMIT & Multiple Intelligence PDFs indexed across 14 classes. Inspect pre-parsed profiles, execute live Drive extraction, or add any student into Student 360°.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-slate-500">Total Reports</p>
              <p className="font-mono text-base font-bold text-slate-900 tabular-nums">{catalog.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-slate-500">Extracted Profiles</p>
              <p className="font-mono text-base font-bold text-blue-900 tabular-nums">{parsedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <label htmlFor="vis-vault-search" className="sr-only">
              Search VIS student reports
            </label>
            <input
              id="vis-vault-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student name or filename (e.g. Abhiraj, Mohit, Tanveer)..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs focus:border-blue-900 focus:outline-none"
            />
          </div>
          <select
            aria-label="Filter reports by class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          >
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'All' ? 'All Classes (14)' : cls}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={onlyParsed}
              onChange={(e) => setOnlyParsed(e.target.checked)}
              className="rounded border-slate-300"
            />
            Extracted Only ({parsedCount})
          </label>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {errorMsg}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="font-mono text-slate-900">{Math.min(filtered.length, 80)}</strong> of{' '}
            <strong className="font-mono text-slate-900">{filtered.length}</strong> matching PDF reports
          </span>
          <span>Advisory telemetry — never penalises OLQ or Learners Score</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 80).map((item) => {
            const parsed = parsedReports[item.fileId];
            const linkedStudent = studentByFileId.get(item.fileId);
            const isExtracting = extractingId === item.fileId;
            const isEnrolling = enrollingId === item.fileId;
            return (
              <div
                key={item.fileId}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.studentName}{' '}
                    <span className="font-normal text-slate-500">
                      · {item.normalizedClass} {item.section}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{item.fileName}</p>
                  {parsed && (
                    <p className="font-mono text-[11px] text-blue-900 tabular-nums">
                      VAK: {parsed.vak.dominantStyle || 'Balanced'} ({parsed.vak.visualPct}/{parsed.vak.auditoryPct}/{parsed.vak.kinestheticPct}%) ·
                      Brain L/R: {parsed.brainDominance.leftPct}/{parsed.brainDominance.rightPct}% ·
                      Bird: {parsed.personality.primaryBird || '—'}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onOpenStudent360 && (
                    <button
                      type="button"
                      disabled={isEnrolling}
                      onClick={() => void handleEnrolAndOpen(item)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                        linkedStudent
                          ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {isEnrolling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : linkedStudent ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      {isEnrolling
                        ? 'Adding...'
                        : linkedStudent
                          ? 'Open 360°'
                          : 'Add to 360°'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={() => void handleExtractOrInspect(item)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                      parsed
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'border border-blue-900/40 bg-blue-50 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Extracting PDF...
                      </>
                    ) : parsed ? (
                      <>
                        <FileSearch className="h-3.5 w-3.5" />
                        Inspect DMIT Profile
                      </>
                    ) : (
                      <>
                        <FileSearch className="h-3.5 w-3.5" />
                        Extract Live Profile
                      </>
                    )}
                  </button>
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.studentName} PDF in Google Drive`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    PDF
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-xs text-slate-500">
              No student reports match this search filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
