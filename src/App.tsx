import { useCallback, useEffect, useState } from 'react';
import type { BlogArticle, UserAccount } from './types';
import type { WorkspaceData } from './types/workspace';
import { apiRequest } from './utils/api';
import { PublicPortal } from './components/PublicPortal';
import { UnifiedLoginModal, type PublicDemoAccount } from './components/UnifiedLoginModal';
import { ErpWorkspace } from './components/ErpWorkspace';

interface PublicOverviewPayload {
  schoolsCount: number;
  schools: Array<{ id: string; name: string; code: string; city: string; state: string; board: string }>;
  demoAccounts: PublicDemoAccount[];
  publishedBlogs: BlogArticle[];
}

export default function App() {
  const [publicData, setPublicData] = useState<PublicOverviewPayload | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    // Clear any legacy session token previously cached in browser storage
    try {
      sessionStorage.removeItem('vs360_token');
    } catch {
      // ignore storage restrictions
    }
  }, []);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  const loadPublicOverview = useCallback(async () => {
    try {
      const res = await apiRequest<PublicOverviewPayload>('/api/public/overview');
      setPublicData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load platform overview.');
    }
  }, []);

  const loadWorkspace = useCallback(async (activeToken: string) => {
    setLoadingWorkspace(true);
    setError(null);
    try {
      const ws = await apiRequest<WorkspaceData>('/api/workspace', {}, activeToken);
      setWorkspaceData(ws);
    } catch {
      // Session expired or revoked — return gracefully to public portal
      setToken(null);
      setWorkspaceData(null);
    } finally {
      setLoadingWorkspace(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicOverview();
  }, [loadPublicOverview]);

  useEffect(() => {
    if (token) {
      void loadWorkspace(token);
    }
  }, [token, loadWorkspace]);

  function handleLoginSuccess(payload: {
    token: string;
    user: UserAccount;
    activeSchoolId: string | null;
  }) {
    setToken(payload.token);
    setLoginOpen(false);
  }

  function handleLogout() {
    const activeToken = token;
    setToken(null);
    setWorkspaceData(null);
    if (activeToken) {
      void apiRequest('/api/auth/logout', { method: 'POST' }, activeToken).catch(() => {
        // ignore if already expired
      });
    }
    void loadPublicOverview();
  }

  if (token && loadingWorkspace && !workspaceData) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex" aria-busy="true" aria-label="Loading workspace">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#0D1E33] bg-[#142B46] p-5 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#254264]">
            <div className="h-10 w-10 rounded-lg bg-[#254264]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 rounded bg-[#254264]" />
              <div className="h-3 w-32 rounded bg-[#1E3B5C]" />
            </div>
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-[#1E3B5C]/75" />
            ))}
          </div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-44 rounded-lg bg-slate-100" />
              <div className="h-8 w-24 rounded-lg bg-slate-200" />
            </div>
          </header>
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="space-y-2 pb-4 border-b border-slate-200">
              <div className="h-3.5 w-44 rounded bg-amber-100" />
              <div className="h-7 w-72 rounded bg-slate-200" />
              <div className="h-4 w-56 rounded bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-6 w-20 rounded bg-slate-300/70" />
                </div>
              ))}
            </div>
            <div className="h-64 rounded-xl border border-slate-200 bg-white p-6 flex items-center justify-center text-xs font-medium text-slate-500">
              Loading authorised school workspace...
            </div>
          </main>
        </div>
      </div>
    );
  }

  const quotaBanner = mapsQuotaExceeded ? (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-950 hover:text-amber-800"
        >
          maps developer site
        </a>{' '}
        for instructions to update your account.
      </span>
    </div>
  ) : null;

  if (token && workspaceData) {
    return (
      <>
        {quotaBanner}
        <ErpWorkspace
          data={workspaceData}
          token={token}
          onRefresh={() => loadWorkspace(token)}
          onSwitchUser={() => setLoginOpen(true)}
          onLogout={handleLogout}
        />
        <UnifiedLoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          demoAccounts={publicData?.demoAccounts ?? []}
          schools={publicData?.schools ?? []}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  async function handleQuickRoleLogin(userId: string) {
    const res = await apiRequest<{
      token: string;
      user: UserAccount;
      activeSchoolId: string | null;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    handleLoginSuccess(res);
  }

  return (
    <>
      {quotaBanner}
      {error && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-950 flex flex-wrap items-center justify-center gap-3"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              void loadPublicOverview();
            }}
            className="rounded-md border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}
      <PublicPortal
        schoolsCount={publicData?.schoolsCount ?? 2}
        schools={publicData?.schools ?? []}
        demoAccounts={publicData?.demoAccounts ?? []}
        publishedBlogs={publicData?.publishedBlogs ?? []}
        onQuickLoginRole={handleQuickRoleLogin}
        onOpenLogin={() => {
          setError(null);
          if (!publicData || !Array.isArray(publicData.demoAccounts) || publicData.demoAccounts.length === 0) {
            void loadPublicOverview();
          }
          setLoginOpen(true);
        }}
      />
      <UnifiedLoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        demoAccounts={publicData?.demoAccounts ?? []}
        schools={publicData?.schools ?? []}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
