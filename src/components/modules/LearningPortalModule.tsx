import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck,
  ExternalLink,
  GraduationCap,
  LineChart,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  UserCheck,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';

interface LearningPortalModuleProps {
  data: WorkspaceData;
  token: string;
  embedded?: boolean;
}

export const LearningPortalModule: React.FC<LearningPortalModuleProps> = ({
  data,
  token,
  embedded = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeHash, setActiveHash] = useState<string>('#home');
  const [portalReady, setPortalReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const role = data.user.role;
  const isAdmin =
    role === 'super_admin' ||
    role === 'school_admin' ||
    role === 'principal' ||
    role === 'coordinator';
  const isStaff = isAdmin || role === 'teacher';
  const isParent = role === 'parent';
  const linkedStudent = !isStaff ? (data.students || [])[0] : null;
  const restrictionBadge = isAdmin
    ? 'Admin · Full Classes 6–12'
    : role === 'teacher'
      ? `Teacher · Restricted (No School Setup)${data.user.subjectSpecialty ? ` · ${data.user.subjectSpecialty}` : ''}`
      : isParent
        ? `Parent · Read-Only${linkedStudent ? ` (${linkedStudent.name.split(' ')[0]} · Class ${linkedStudent.classSection})` : ''}`
        : `Student · Locked${linkedStudent ? ` to Class ${linkedStudent.classSection}` : ''}`;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || typeof payload !== 'object') return;
      if (payload.type === 'RAI_LP_READY') {
        setPortalReady(true);
        if (typeof payload.hash === 'string') setActiveHash(payload.hash);
      } else if (payload.type === 'RAI_LP_STATE' && typeof payload.hash === 'string') {
        setActiveHash(payload.hash);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const navigatePortal = useCallback((hash: string) => {
    setActiveHash(hash);
    const frameWin = iframeRef.current?.contentWindow;
    if (frameWin) {
      frameWin.postMessage({ type: 'RAI_LP_NAV', hash }, window.location.origin);
    }
  }, []);

  const handleReload = useCallback(() => {
    setPortalReady(false);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#fbfaf7]'
          : 'flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden'
      }
      data-testid="learning-portal-module"
    >
      {/* Integrated Rai Plus Operational Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-[#0F243D] via-[#153152] to-[#1C3D63] px-4 py-2.5 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight truncate">
                Rai Plus Learning Portal · Classes 6–12
              </h2>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-400/15 border border-emerald-300/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                127 Chapters · 394 Visuals &amp; 3D Models
              </span>
              <span
                data-testid="learning-portal-restriction-badge"
                className="inline-flex items-center rounded-full bg-amber-400/20 border border-amber-300/35 px-2 py-0.5 text-[10px] font-bold text-amber-100"
              >
                {restrictionBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {data.activeSchool.name} · {data.activeSchool.board} {data.activeSchool.session} ·{' '}
              {portalReady ? 'Synced live with Rai Plus' : 'Connecting portal…'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigatePortal('#home')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              activeHash === '#home' || activeHash.startsWith('#ch-')
                ? 'bg-white text-slate-900'
                : 'bg-white/10 text-slate-100 hover:bg-white/20'
            }`}
          >
            <BookOpenCheck className="h-3.5 w-3.5" />
            Chapters
          </button>

          {isStaff && (
            <button
              type="button"
              onClick={() => navigatePortal('#monitor')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                activeHash === '#monitor'
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-slate-100 hover:bg-white/20'
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
              Syllabus Monitor
            </button>
          )}

          {!isStaff && (
            <button
              type="button"
              onClick={() => navigatePortal('#me')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                activeHash === '#me'
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-slate-100 hover:bg-white/20'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              {isParent ? 'Child’s Progress' : 'My Progress'}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigatePortal('#setup')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                activeHash === '#setup'
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-slate-100 hover:bg-white/20'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              School Setup
            </button>
          )}

          <button
            type="button"
            onClick={handleReload}
            title="Reload Learning Portal"
            className="inline-flex items-center justify-center rounded-lg bg-white/10 p-1.5 text-slate-100 hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Fullscreen</span>
              </>
            )}
          </button>

          <a
            href="/learning-portal/index.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Learning Portal in a dedicated browser tab"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 border border-amber-300/30 px-2 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-400/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">New Tab</span>
          </a>
        </div>
      </div>

      {/* Embedded Learning Portal Surface */}
      <div
        className={
          isFullscreen
            ? 'flex-1 w-full bg-[#fbfaf7]'
            : embedded
              ? 'w-full bg-[#fbfaf7] h-[calc(100vh-260px)] min-h-[700px]'
              : 'w-full bg-[#fbfaf7] h-[calc(100vh-195px)] min-h-[680px]'
        }
      >
        <iframe
          key={`${data.activeSchool.id}-${data.user.id}-${reloadKey}`}
          ref={iframeRef}
          src="/learning-portal/index.html"
          data-token={token}
          title="Rai Plus Learning Portal — Classes 6 to 12 Interactive Lessons, Visuals, 3D Models & Syllabus Monitor"
          className="h-full w-full border-0 block"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};
