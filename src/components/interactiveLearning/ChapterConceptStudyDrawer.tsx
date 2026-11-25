import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Gamepad2,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  ChapterLearningBlueprint,
  ExperientialSimulationAsset,
  InteractiveGameAsset,
  InteractiveLearningAttempt,
} from '../../types/interactiveLearning';
import { GAME_FORMAT_CATALOG } from '../../utils/interactiveLearningEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface ChapterConceptStudyDrawerProps {
  blueprint: ChapterLearningBlueprint;
  games: InteractiveGameAsset[];
  simulations: ExperientialSimulationAsset[];
  studentAttempts: InteractiveLearningAttempt[];
  token: string;
  studentId?: string;
  onAttemptSaved: () => Promise<void>;
  onLaunchGame: (game: InteractiveGameAsset) => void;
  onLaunchSim: (sim: ExperientialSimulationAsset) => void;
  onClose: () => void;
}

export const ChapterConceptStudyDrawer: React.FC<ChapterConceptStudyDrawerProps> = ({
  blueprint,
  games,
  simulations,
  studentAttempts,
  token,
  studentId,
  onAttemptSaved,
  onLaunchGame,
  onLaunchSim,
  onClose,
}) => {
  const [markingId, setMarkingId] = useState<string | null>(null);

  const chapterGames = games.filter((g) => g.chapterId === blueprint.id);
  const chapterSims = simulations.filter((e) => e.chapterId === blueprint.id);

  const handleMarkStudied = async (conceptId: string, conceptTitle: string) => {
    setMarkingId(conceptId);
    try {
      await apiRequest(
        '/api/interactive-learning/attempts',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            subject: blueprint.subject,
            chapterId: blueprint.id,
            conceptId,
            assetId: `concept-exp-${conceptId}`,
            assetTitle: `${blueprint.chapterTitle}: ${conceptTitle}`,
            assetType: 'explanation',
            status: 'completed',
            progressPct: 100,
            scorePct: 85,
            accuracyPct: 85,
            timeSpentSec: 60,
            mistakes: [],
          }),
        },
        token,
      );
      pushToast(`Marked "${conceptTitle}" as studied (+XP logged).`, 'success');
      await onAttemptSaved();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to save study progress.', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55"
      role="dialog"
      aria-modal="true"
      aria-label={`Chapter study guide for ${blueprint.chapterTitle}`}
    >
      <div className="relative w-full max-w-3xl bg-white h-full flex flex-col border-l border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="bg-[#142B46] text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
              {blueprint.board} · Class {blueprint.classLevel} · {blueprint.subject} · Ch.{' '}
              {blueprint.chapterNumber}
            </p>
            <h3 className="font-display text-lg font-bold">{blueprint.chapterTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{blueprint.overview}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chapter concept guide"
            className="rounded-lg border border-white/20 p-1.5 text-slate-200 hover:bg-white/10 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FAF4EC]/40">
          {/* Topic Outline Strip */}
          {blueprint.topics.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Chapter Topics &amp; Subtopics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blueprint.topics.map((t, idx) => (
                  <div
                    key={t.topicId}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1"
                  >
                    <p className="text-xs font-bold text-[#142B46]">
                      {idx + 1}. {t.title}
                    </p>
                    {t.subtopics.length > 0 && (
                      <p className="text-[11px] text-slate-600">{t.subtopics.join(' · ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concept-by-Concept Interactive Study Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#142B46]" />
              <h4 className="font-display text-sm font-bold text-[#142B46]">
                Atomic Concept Explanations ({blueprint.concepts.length})
              </h4>
            </div>

            {blueprint.concepts.map((concept, idx) => {
              const matchingGame = chapterGames.find((g) => g.conceptId === concept.conceptId);
              const matchingSim = chapterSims.find((e) => e.conceptId === concept.conceptId);
              const isStudied = studentAttempts.some(
                (a) =>
                  a.conceptId === concept.conceptId &&
                  a.assetType === 'explanation' &&
                  a.status === 'completed',
              );

              return (
                <div
                  key={concept.conceptId}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Concept {idx + 1} · {concept.difficulty}
                        {concept.isDifficult ? ' · Key Focus Area' : ''}
                      </p>
                      <h5 className="font-display text-sm font-bold text-[#142B46]">
                        {concept.title}
                      </h5>
                    </div>
                    <button
                      type="button"
                      disabled={markingId === concept.conceptId || isStudied}
                      onClick={() => handleMarkStudied(concept.conceptId, concept.title)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isStudied
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#142B46] text-white hover:bg-[#1e3b5c]'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isStudied
                        ? 'Studied'
                        : markingId === concept.conceptId
                          ? 'Saving...'
                          : 'Mark Studied'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed">{concept.explanation}</p>

                  {concept.learningObjectives.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <strong className="text-[#142B46]">Learning Goal:</strong>{' '}
                      {concept.learningObjectives.join(' · ')}
                    </div>
                  )}

                  {concept.practicalApplications.length > 0 && (
                    <div className="rounded-lg border border-amber-200/70 bg-amber-50/50 px-3 py-2 text-[11px] text-amber-950 flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Real-Life Application:</strong>{' '}
                        {concept.practicalApplications.join(' · ')}
                      </span>
                    </div>
                  )}

                  {concept.prerequisites.length > 0 && (
                    <p className="text-[11px] text-slate-500">
                      Prerequisites: {concept.prerequisites.join(', ')}
                    </p>
                  )}

                  {/* Launch matching interactive Game or Experiential Motion Lab */}
                  {(matchingGame || matchingSim) && (
                    <div className="border-t border-slate-100 pt-2.5 flex flex-wrap items-center gap-2">
                      {matchingSim && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onLaunchSim(matchingSim);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6349] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b]"
                        >
                          <FlaskConical className="h-3.5 w-3.5" />
                          Launch Lab: {matchingSim.title}
                        </button>
                      )}
                      {matchingGame && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onLaunchGame(matchingGame);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46]/25 bg-[#FAF4EC] px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#f3e6d8]"
                        >
                          <Gamepad2 className="h-3.5 w-3.5" />
                          Play {GAME_FORMAT_CATALOG[matchingGame.gameFormat]?.label || 'Game'}:{' '}
                          {matchingGame.title}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Revision Activities Footer */}
          {blueprint.revisionActivities.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3D6349] inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Recommended Revision Activities
              </p>
              <p className="text-xs text-slate-700">{blueprint.revisionActivities.join(' · ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
