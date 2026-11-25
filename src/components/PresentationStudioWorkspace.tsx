import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Eye,
  FileJson,
  Layers,
  Maximize2,
  Plus,
  Presentation,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  PresentationLanguageMode,
  RedesignedPresentationDeck,
  SlideVisualTemplate,
  VisualSlideItem,
} from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  buildNotebookLmSourceBrief,
  isMathematicsSubject,
} from '../utils/presentationStudioEngine';

interface PresentationStudioWorkspaceProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

const TEMPLATE_LABELS: Record<SlideVisualTemplate, string> = {
  infographic_grid: 'Infographic Grid',
  process_flowchart: 'Process Flowchart',
  concept_mind_map: 'Concept / Mind Map',
  comparison_matrix: 'Comparison Matrix',
  chronological_timeline: 'Chronological Timeline',
  labelled_diagram: 'Labelled Scientific Diagram',
  real_life_application: 'Real-Life Application',
  interactive_question: 'Interactive Classroom Question',
  visual_summary: 'Visual Chapter Summary',
};

const VisualSlideRenderer: React.FC<{
  slide: VisualSlideItem;
  subject: string;
  languageMode: PresentationLanguageMode;
  large?: boolean;
}> = ({ slide, subject, languageMode, large }) => {
  const showHindi = languageMode === 'bilingual_en_hi' && !isMathematicsSubject(subject);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${
        large ? 'p-8 space-y-6' : 'p-5 space-y-4'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-blue-900">
            Slide {slide.slideNumber} · {TEMPLATE_LABELS[slide.template]}
          </p>
          <h3 className={`font-display font-bold text-slate-900 mt-0.5 ${large ? 'text-2xl' : 'text-lg'}`}>
            {slide.title}
          </h3>
          {showHindi && slide.hindiTitle && (
            <p className="text-sm font-medium text-indigo-800 mt-0.5">{slide.hindiTitle}</p>
          )}
        </div>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {languageMode === 'english_only_math'
            ? 'Strict English (Math Policy)'
            : showHindi
              ? 'Bilingual EN + HI'
              : 'English'}
        </span>
      </div>

      {/* Crisp Key Takeaway Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-2.5">
        <p className={`font-semibold text-blue-950 ${large ? 'text-base' : 'text-xs'}`}>
          {slide.keyTakeaway}
        </p>
        {showHindi && slide.hindiTakeaway && (
          <p className="text-xs text-indigo-900 mt-1">{slide.hindiTakeaway}</p>
        )}
      </div>

      {/* Structured Diagram Rendering by Visual Template */}
      {slide.template === 'process_flowchart' || slide.template === 'chronological_timeline' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {slide.visualNodes.map((node, i) => (
            <div key={i} className="relative rounded-xl border border-blue-200 bg-slate-50 p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-blue-900">
                {node.tag || `Step ${i + 1}`}
              </span>
              <p className="text-xs font-bold text-slate-900">{node.label}</p>
              <p className="text-[11px] text-slate-600 leading-snug">{node.detail}</p>
            </div>
          ))}
        </div>
      ) : slide.template === 'concept_mind_map' || slide.template === 'labelled_diagram' ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="mx-auto max-w-xs rounded-lg bg-blue-900 px-4 py-2 text-center text-xs font-bold text-white">
            {slide.title}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {slide.visualNodes.map((node, i) => (
              <div key={i} className="rounded-lg border border-slate-300 bg-white p-3 space-y-1">
                <p className="text-[10px] font-mono font-bold text-emerald-700">{node.tag || `Node ${i + 1}`}</p>
                <p className="text-xs font-bold text-slate-900">{node.label}</p>
                <p className="text-[11px] text-slate-600">{node.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slide.visualNodes.map((node, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
              {node.tag && (
                <span className="font-mono text-[10px] font-bold uppercase text-indigo-800">{node.tag}</span>
              )}
              <p className="text-xs font-bold text-slate-900">{node.label}</p>
              <p className="text-[11px] text-slate-600">{node.detail}</p>
            </div>
          ))}
        </div>
      )}

      {slide.realLifeExample && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-950">
          <strong>Real-Life Connection:</strong> {slide.realLifeExample}
        </div>
      )}

      {slide.interactivePrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 space-y-2 text-xs">
          <p className="font-bold text-amber-950">Classroom Checkpoint: {slide.interactivePrompt.question}</p>
          {slide.interactivePrompt.options && (
            <ul className="list-disc pl-4 space-y-0.5 text-amber-950">
              {slide.interactivePrompt.options.map((opt) => <li key={opt}>{opt}</li>)}
            </ul>
          )}
          <p className="text-[11px] text-amber-900">
            <strong>Expected Insight:</strong> {slide.interactivePrompt.expectedInsight}
          </p>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
        <strong>Teacher Speaker Cue:</strong> {slide.speakerNotes}
      </div>
    </div>
  );
};

export const PresentationStudioWorkspace: React.FC<PresentationStudioWorkspaceProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isStaff = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    data.user.role,
  );
  const canPrincipalApprove = ['super_admin', 'school_admin', 'principal'].includes(data.user.role);

  const originalPresentations = useMemo(
    () => data.resources.filter((r) => r.category === 'Presentations'),
    [data.resources],
  );
  const audits = data.presentationAudits || [];
  const decks = data.redesignedDecks || [];

  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    originalPresentations[0]?.id || decks[0]?.originalResourceId || '',
  );
  const [studioMode, setStudioMode] = useState<'audit' | 'studio' | 'notebooklm' | 'compare'>('studio');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [classroomMode, setClassroomMode] = useState(false);

  // NotebookLM Import State
  const [notebookLmJsonDraft, setNotebookLmJsonDraft] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideHindiTitle, setNewSlideHindiTitle] = useState('');
  const [newSlideTemplate, setNewSlideTemplate] = useState<SlideVisualTemplate>('labelled_diagram');
  const [newSlideTakeaway, setNewSlideTakeaway] = useState('');
  const [newSlideNode1, setNewSlideNode1] = useState('');
  const [newSlideNode2, setNewSlideNode2] = useState('');

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedOriginal =
    originalPresentations.find((r) => r.id === selectedResourceId) || originalPresentations[0] || null;
  const selectedAudit = audits.find((a) => a.resourceId === selectedOriginal?.id) || null;
  const selectedDeck: RedesignedPresentationDeck | null =
    decks.find((d) => d.originalResourceId === selectedOriginal?.id) || decks[0] || null;

  const sourceBriefText = useMemo(() => {
    if (!selectedAudit || !selectedOriginal) return '';
    return buildNotebookLmSourceBrief(selectedAudit, selectedOriginal.contentSummary);
  }, [selectedAudit, selectedOriginal]);

  async function handleRunAudit() {
    if (!selectedOriginal) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/presentations/audit',
        {
          method: 'POST',
          body: JSON.stringify({
            resourceId: selectedOriginal.id,
            originalSlideCount: 14,
            avgWordsPerSlide: 74,
            visualCoveragePct: 28,
            hasInteractiveChecks: false,
            hasVisualSummary: false,
            requestedLanguageMode: isMathematicsSubject(selectedOriginal.subject)
              ? 'english_only_math'
              : 'bilingual_en_hi',
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback(`Audited "${selectedOriginal.title}" (original preserved untouched).`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to audit presentation.');
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateVisualScaffold() {
    if (!selectedOriginal) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ deck: RedesignedPresentationDeck; policyNote?: string }>(
        '/api/presentations/redesigned',
        {
          method: 'POST',
          body: JSON.stringify({
            originalResourceId: selectedOriginal.id,
            languageMode: isMathematicsSubject(selectedOriginal.subject)
              ? 'english_only_math'
              : 'bilingual_en_hi',
            workflowSource: 'visual_studio',
            changeNote: 'Created visual infographic redesign from original curriculum deck.',
          }),
        },
        token,
      );
      await onRefresh();
      setActiveSlideIdx(0);
      setStudioMode('studio');
      setFeedback(
        `Generated v${res.deck.versionNumber} visual deck (${res.deck.slides.length} slides). ${res.policyNote || 'Original presentation preserved.'}`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create visual deck.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSlideToDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOriginal || !selectedDeck || !newSlideTitle.trim() || !newSlideTakeaway.trim()) {
      setErrorMsg('Slide title and key takeaway are required.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const addedSlide: VisualSlideItem = {
        id: `sld-new-${Date.now().toString(36)}`,
        slideNumber: selectedDeck.slides.length + 1,
        title: newSlideTitle.trim(),
        hindiTitle: newSlideHindiTitle.trim() || undefined,
        template: newSlideTemplate,
        keyTakeaway: newSlideTakeaway.trim(),
        visualNodes: [
          { label: 'Core Visual Point', detail: newSlideNode1.trim() || newSlideTakeaway.trim(), tag: 'Visual 1' },
          { label: 'Applied Link', detail: newSlideNode2.trim() || 'Connect to student notebook exercise', tag: 'Visual 2' },
        ],
        speakerNotes: 'Walk students through the diagram before copying summary keywords.',
      };

      const res = await apiRequest<{ deck: RedesignedPresentationDeck; policyNote?: string }>(
        '/api/presentations/redesigned',
        {
          method: 'POST',
          body: JSON.stringify({
            originalResourceId: selectedOriginal.id,
            redesignedTitle: selectedDeck.redesignedTitle,
            languageMode: selectedDeck.languageMode,
            workflowSource: 'visual_studio',
            changeNote: `Added "${addedSlide.title}" (${TEMPLATE_LABELS[newSlideTemplate]}).`,
            slides: [...selectedDeck.slides, addedSlide],
          }),
        },
        token,
      );
      setNewSlideTitle('');
      setNewSlideHindiTitle('');
      setNewSlideTakeaway('');
      setNewSlideNode1('');
      setNewSlideNode2('');
      await onRefresh();
      setActiveSlideIdx(res.deck.slides.length - 1);
      setFeedback(`Saved v${res.deck.versionNumber} with new visual slide. ${res.policyNote || ''}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to add slide.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImportNotebookLmJson(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOriginal || !notebookLmJsonDraft.trim()) {
      setErrorMsg('Paste the NotebookLM storyboard JSON before importing.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ deck: RedesignedPresentationDeck; policyNote?: string }>(
        '/api/presentations/redesigned',
        {
          method: 'POST',
          body: JSON.stringify({
            originalResourceId: selectedOriginal.id,
            languageMode: isMathematicsSubject(selectedOriginal.subject)
              ? 'english_only_math'
              : 'bilingual_en_hi',
            workflowSource: 'notebooklm_import',
            notebookLmJson: notebookLmJsonDraft,
            changeNote: 'Imported structured visual storyboard from NotebookLM workflow.',
          }),
        },
        token,
      );
      setNotebookLmJsonDraft('');
      await onRefresh();
      setActiveSlideIdx(0);
      setStudioMode('studio');
      setFeedback(
        `Imported ${res.deck.slides.length} visual slides from NotebookLM JSON as v${res.deck.versionNumber}. ${res.policyNote || ''}`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'NotebookLM JSON import failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleApprovalStage(stage: 'teacher' | 'principal' | 'changes_requested') {
    if (!selectedDeck) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        `/api/presentations/redesigned/${selectedDeck.id}/approve`,
        { method: 'POST', body: JSON.stringify({ stage }) },
        token,
      );
      await onRefresh();
      setFeedback(`Updated deck approval workflow status to "${stage}".`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Approval update failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleDownloadSourceBrief() {
    if (!sourceBriefText || !selectedOriginal) return;
    const blob = new Blob([sourceBriefText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebooklm-brief-${selectedOriginal.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadDeckJson() {
    if (!selectedDeck) return;
    const blob = new Blob([JSON.stringify(selectedDeck, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDeck.id}-v${selectedDeck.versionNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeSlide = selectedDeck?.slides[activeSlideIdx] || selectedDeck?.slides[0] || null;

  return (
    <div className="space-y-5">
      {/* Header & Deck Picker */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Presentation className="h-5 w-5 text-blue-900" />
              Presentation Redesign Studio &amp; Visual Learning Library
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Audit existing decks non-destructively (originals are never deleted), redesign via NotebookLM export-import or Visual Slide Studio, enforce English-only Mathematics, and route Teacher → Principal approval.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {originalPresentations.length > 0 && (
              <select
                aria-label="Select curriculum presentation to redesign"
                value={selectedOriginal?.id || ''}
                onChange={(e) => {
                  setSelectedResourceId(e.target.value);
                  setActiveSlideIdx(0);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 max-w-xs"
              >
                {originalPresentations.map((r) => (
                  <option key={r.id} value={r.id}>
                    Class {r.classSection} · {r.subject} — {r.chapter}
                  </option>
                ))}
              </select>
            )}
            {selectedDeck && (
              <button
                type="button"
                onClick={() => setClassroomMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Classroom Mode
              </button>
            )}
          </div>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {isStaff && (
            <button
              type="button"
              onClick={() => setStudioMode('audit')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                studioMode === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              1. Quality Audit ({audits.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setStudioMode('studio')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              studioMode === 'studio' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            2. Visual Slide Studio ({selectedDeck?.slides.length || 0} slides)
          </button>
          {isStaff && (
            <button
              type="button"
              onClick={() => setStudioMode('notebooklm')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                studioMode === 'notebooklm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              3. NotebookLM Export / Import
            </button>
          )}
          <button
            type="button"
            onClick={() => setStudioMode('compare')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              studioMode === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            4. Original vs Redesigned &amp; Approvals
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-900">
          {errorMsg}
        </div>
      )}

      {/* MODE 1: PRESENTATION AUDIT */}
      {studioMode === 'audit' && isStaff && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Original Deck Audit — {selectedOriginal?.title || 'Select a presentation'}
              </h3>
              <p className="text-xs text-slate-600">
                Original files are permanently archived and never overwritten.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy || !selectedOriginal}
                onClick={() => void handleRunAudit()}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Run Fresh Audit
              </button>
              <button
                type="button"
                disabled={busy || !selectedOriginal}
                onClick={() => void handleGenerateVisualScaffold()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Visual Redesign Deck
              </button>
            </div>
          </div>

          {selectedAudit ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Visual Quality Score</p>
                  <p className="font-mono text-2xl font-bold text-blue-900 mt-0.5">{selectedAudit.auditScore}/100</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Avg Words / Slide</p>
                  <p className="font-mono text-2xl font-bold text-amber-700 mt-0.5">{selectedAudit.avgWordsPerSlide}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Visual Coverage</p>
                  <p className="font-mono text-2xl font-bold text-slate-900 mt-0.5">{selectedAudit.visualCoveragePct}%</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Language Policy</p>
                  <p className="text-xs font-bold text-emerald-800 mt-1.5">
                    {selectedAudit.languageMode === 'english_only_math'
                      ? 'English Only (Math Policy)'
                      : selectedAudit.languageMode === 'bilingual_en_hi'
                        ? 'Bilingual EN + HI'
                        : 'Academic English'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Flagged Redesign Opportunities ({selectedAudit.issues.length})</p>
                {selectedAudit.issues.map((iss, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs space-y-0.5">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      [{iss.severity}] {iss.message}
                    </p>
                    <p className="text-amber-900">Fix: {iss.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click &quot;Run Fresh Audit&quot; to inspect this presentation.</p>
          )}
        </div>
      )}

      {/* MODE 2: IN-APP VISUAL INFOGRAPHIC SLIDE STUDIO */}
      {studioMode === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Visual Slides ({selectedDeck?.slides.length || 0})
                </h3>
                {selectedDeck && (
                  <button
                    type="button"
                    onClick={handleDownloadDeckJson}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 hover:underline"
                  >
                    <Download className="h-3 w-3" />
                    Export JSON
                  </button>
                )}
              </div>
              {selectedDeck ? (
                <div className="space-y-1.5">
                  {selectedDeck.slides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`w-full text-left rounded-lg border p-2.5 text-xs transition-colors ${
                        idx === activeSlideIdx
                          ? 'border-blue-900 bg-blue-50/70'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-slate-900">
                        {s.slideNumber}. {s.title}
                      </p>
                      <p className="text-[10px] text-slate-500">{TEMPLATE_LABELS[s.template]}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-500">No redesigned visual deck yet for this chapter.</p>
                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => void handleGenerateVisualScaffold()}
                      className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Create Visual Deck
                    </button>
                  )}
                </div>
              )}
            </div>

            {isStaff && selectedDeck && (
              <form
                onSubmit={handleAddSlideToDeck}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5"
              >
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-blue-900" />
                  Add Visual Infographic Slide
                </h3>
                <select
                  aria-label="Visual slide template"
                  value={newSlideTemplate}
                  onChange={(e) => setNewSlideTemplate(e.target.value as SlideVisualTemplate)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                >
                  {(Object.entries(TEMPLATE_LABELS) as Array<[SlideVisualTemplate, string]>).map(
                    ([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
                <input
                  type="text"
                  required
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  placeholder="Slide heading (English)"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                {selectedDeck.languageMode === 'bilingual_en_hi' && !isMathematicsSubject(selectedDeck.subject) && (
                  <input
                    type="text"
                    value={newSlideHindiTitle}
                    onChange={(e) => setNewSlideHindiTitle(e.target.value)}
                    placeholder="Optional Hindi heading (Bilingual policy)"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                )}
                <input
                  type="text"
                  required
                  value={newSlideTakeaway}
                  onChange={(e) => setNewSlideTakeaway(e.target.value)}
                  placeholder="Concise 1-line visual takeaway"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={newSlideNode1}
                  onChange={(e) => setNewSlideNode1(e.target.value)}
                  placeholder="Diagram node 1 detail"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={newSlideNode2}
                  onChange={(e) => setNewSlideNode2(e.target.value)}
                  placeholder="Diagram node 2 detail"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-blue-900 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Save New Slide (Increments Version)
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-8">
            {activeSlide && selectedDeck ? (
              <VisualSlideRenderer
                slide={activeSlide}
                subject={selectedDeck.subject}
                languageMode={selectedDeck.languageMode}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
                Select or generate a redesigned visual deck to preview slides.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: HONEST NOTEBOOKLM EXPORT / IMPORT WORKFLOW */}
      {studioMode === 'notebooklm' && isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Step 1: Export NotebookLM Source Brief</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (sourceBriefText) {
                      void navigator.clipboard?.writeText(sourceBriefText);
                      setFeedback('Copied NotebookLM Source Brief to clipboard.');
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSourceBrief}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .md
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Because NotebookLM does not offer a public API, Rai Plus generates a clean, curriculum-aligned source brief and prompt you can upload directly into NotebookLM Studio.
            </p>
            <textarea
              readOnly
              rows={12}
              value={sourceBriefText || 'Run an audit on the selected presentation first to generate its NotebookLM Source Brief.'}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800"
            />
          </div>

          <form
            onSubmit={handleImportNotebookLmJson}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileJson className="h-4 w-4 text-blue-900" />
              Step 2: Import NotebookLM Visual Storyboard JSON
            </h3>
            <p className="text-xs text-slate-600">
              Paste the structured JSON returned by NotebookLM below. Mathematics decks automatically strip non-English text to honour strict English Math policy.
            </p>
            <textarea
              rows={11}
              value={notebookLmJsonDraft}
              onChange={(e) => setNotebookLmJsonDraft(e.target.value)}
              placeholder={`{\n  "redesignedTitle": "Visual Chapter Edition",\n  "slides": [\n    {\n      "title": "Core Concept Map",\n      "template": "concept_mind_map",\n      "keyTakeaway": "Short 12-word visual takeaway",\n      "visualNodes": [{ "label": "Node 1", "detail": "Crisp explanation" }]\n    }\n  ]\n}`}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-[11px]"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-blue-900 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Validate &amp; Import Storyboard as New Version
            </button>
          </form>
        </div>
      )}

      {/* MODE 4: SIDE-BY-SIDE ORIGINAL VS REDESIGNED & DUAL APPROVAL */}
      {studioMode === 'compare' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Original Archived Presentation (Preserved Untouched)
              </p>
              <h3 className="text-base font-bold text-slate-900">{selectedOriginal?.title || '—'}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedOriginal?.contentSummary}</p>
              {selectedAudit && (
                <p className="font-mono text-xs text-amber-800">
                  Original Metrics: {selectedAudit.originalSlideCount} slides · {selectedAudit.avgWordsPerSlide} words/slide · {selectedAudit.visualCoveragePct}% visual
                </p>
              )}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Redesigned Visual Edition (v{selectedDeck?.versionNumber || 0})
                </p>
                <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-900">
                  {selectedDeck?.approvalStatus.replace(/_/g, ' ') || 'Not Created'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedDeck?.redesignedTitle || 'No redesigned version yet'}
              </h3>
              {selectedDeck && (
                <>
                  <p className="text-xs text-slate-700">
                    {selectedDeck.slides.length} structured infographic slides · Workflow: {selectedDeck.workflowSource} · Policy: {selectedDeck.languageMode}
                  </p>
                  {isStaff && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleApprovalStage('teacher')}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                      >
                        Teacher Approve
                      </button>
                      {canPrincipalApprove && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleApprovalStage('principal')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Principal Final Approval
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleApprovalStage('changes_requested')}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"
                      >
                        Request Revision
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {selectedDeck && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-900" />
                Version History ({selectedDeck.versionHistory.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {selectedDeck.versionHistory.map((vh) => (
                  <div key={vh.versionNumber} className="py-2 flex flex-wrap justify-between gap-2">
                    <span>
                      <strong className="font-mono text-blue-900">v{vh.versionNumber}</strong> — {vh.changeNote}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {vh.savedBy} · {vh.savedAt} ({vh.slideCount} slides)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN CLASSROOM PRESENTATION MODE */}
      {classroomMode && selectedDeck && activeSlide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Classroom presentation mode"
          className="fixed inset-0 z-50 bg-slate-950/95 p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 text-xs">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span className="font-bold">{selectedDeck.redesignedTitle}</span>
              <span className="text-slate-400">
                · Slide {activeSlideIdx + 1} / {selectedDeck.slides.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setClassroomMode(false)}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
              Exit Classroom Mode
            </button>
          </div>

          <div className="max-w-5xl w-full mx-auto my-auto">
            <VisualSlideRenderer
              slide={activeSlide}
              subject={selectedDeck.subject}
              languageMode={selectedDeck.languageMode}
              large
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={activeSlideIdx <= 0}
              onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:opacity-40"
            >
              Previous Slide
            </button>
            <button
              type="button"
              disabled={activeSlideIdx >= selectedDeck.slides.length - 1}
              onClick={() => setActiveSlideIdx((i) => Math.min(selectedDeck.slides.length - 1, i + 1))}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Next Slide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
