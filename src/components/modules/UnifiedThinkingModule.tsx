import React, { useState } from 'react';
import { BarChart3, Sparkles, TrendingUp } from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import { SkillMonthlyGrowthLeaderboard } from '../SkillMonthlyGrowthLeaderboard';
import { ThinkingAssessmentTab } from './ThinkingAssessmentTab';
import { ThinkingTestsModule } from './ThinkingTestsModule';

interface UnifiedThinkingModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent?: (studentId: string) => void;
}

type UnifiedThinkingSection = 'tests' | 'olq_analytics' | 'growth_leaderboard';

const STAFF_ROLES = new Set([
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'teacher',
]);

export const UnifiedThinkingModule: React.FC<UnifiedThinkingModuleProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
}) => {
  const [section, setSection] = useState<UnifiedThinkingSection>('tests');
  const sessionCount = (data.thinkingAssessments || []).length;
  const isStaff = STAFF_ROLES.has(data.user.role);

  return (
    <div className="space-y-5">
      {/* Unified Single-Row Workspace Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Unified Thinking &amp; OLQ Suite · SRT · WAT · TAT · PPDT · SSB Daily Queue · 15 OLQ Analytics
          </p>
        </div>

        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Thinking Tests and OLQ Views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={section === 'tests'}
            onClick={() => setSection('tests')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              section === 'tests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Monthly &amp; SSB Tests
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'olq_analytics'}
            onClick={() => setSection('olq_analytics')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              section === 'olq_analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            OLQ Analytics, Review &amp; Bank ({sessionCount})
          </button>
          {isStaff && (
            <button
              type="button"
              role="tab"
              aria-selected={section === 'growth_leaderboard'}
              onClick={() => setSection('growth_leaderboard')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                section === 'growth_leaderboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              Monthly Class Growth Leaderboard
            </button>
          )}
        </div>
      </div>

      {section === 'tests' ? (
        <ThinkingAssessmentTab
          data={data}
          token={token}
          onRefresh={onRefresh}
          onOpenAnalytics={() => setSection('olq_analytics')}
        />
      ) : section === 'growth_leaderboard' && isStaff ? (
        <SkillMonthlyGrowthLeaderboard
          data={data}
          skillKey="thinking"
          onInspectStudent={onOpenStudent}
        />
      ) : (
        <ThinkingTestsModule
          data={data}
          token={token}
          onRefresh={onRefresh}
          onOpenStudent={onOpenStudent}
          initialSubTab="profile"
        />
      )}
    </div>
  );
};
