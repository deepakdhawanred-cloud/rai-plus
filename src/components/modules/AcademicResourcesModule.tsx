import React from 'react';
import type { WorkspaceData } from '../../types/workspace';
import { ChapterStudyGameWorkspace } from '../ChapterStudyGameWorkspace';

interface AcademicResourcesModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh?: () => Promise<void>;
}

/**
 * Interactive Chapter Mastery Module replacing static mindmaps with gamified
 * 4-stage chapter quests, timed quizzes, progress badges, and live leaderboards.
 */
export const AcademicResourcesModule: React.FC<AcademicResourcesModuleProps> = ({
  data,
  token,
}) => {
  const defaultClassLabel =
    data.user.classTeacherOf || data.students[0]?.classSection || 'Class 10';
  const activeLearnerName =
    data.user.role === 'parent' || data.user.role === 'student'
      ? data.students[0]?.name || data.user.name
      : data.user.name;

  return (
    <div className="space-y-6" data-testid="chapter-mastery-module">
      <div className="border-b border-[#E5D7C3] pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#142B46]">
            Quick Revise — Gamified Chapter &amp; Topic Studio
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            See · Do · Remember — revise entire chapters or specific important topics with
            hands-on plates, sorting decks, chains, diagrams, memory pairs, and odd-one-out games
            across Classes 1–12.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          {data.activeSchool.board} Curriculum · {data.activeSchool.name}
        </p>
      </div>

      <ChapterStudyGameWorkspace
        board={data.activeSchool.board}
        userId={data.user.id}
        userRole={data.user.role}
        token={token}
        studentName={activeLearnerName}
        defaultClassLabel={defaultClassLabel}
        subjectSpecialty={data.user.subjectSpecialty}
        registerRows={data.productionRegister || []}
        schoolResources={data.resources || []}
      />
    </div>
  );
};
