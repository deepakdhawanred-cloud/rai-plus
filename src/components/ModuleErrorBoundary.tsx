import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ModuleErrorBoundaryProps {
  children: React.ReactNode;
  scope?: 'app' | 'module';
  moduleLabel?: string;
  onReset?: () => void;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ModuleErrorBoundary extends React.Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected interface error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[Rai Plus ${this.props.scope || 'module'} error]`, error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isApp = this.props.scope === 'app';
    return (
      <div
        role="alert"
        className={
          isApp
            ? 'min-h-screen bg-[#F6F8FB] flex items-center justify-center p-6'
            : 'rounded-xl border border-amber-200 bg-white p-6 sm:p-8 shadow-xs max-w-2xl mx-auto my-6'
        }
      >
        <div className="max-w-lg w-full space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                {isApp ? 'Rai Plus Recovery Guard' : `${this.props.moduleLabel || 'Module'} Recovery Guard`}
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900">
                {isApp ? 'Something went wrong loading the page' : 'This workspace module paused safely'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your school data is safe and unaffected. Retry loading this view or switch to another module.
              </p>
              {this.state.errorMessage && (
                <p className="mt-2 rounded-md bg-slate-50 border border-slate-200 px-3 py-1.5 font-mono text-[11px] text-slate-600 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3A5F] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry {isApp ? 'Application' : 'Module'}
            </button>
            {isApp && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const WorkspaceModuleSkeleton: React.FC<{ label?: string }> = ({ label }) => (
  <div className="space-y-5 animate-pulse" aria-busy="true" aria-label={`Loading ${label || 'module'}`}>
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div className="space-y-2">
        <div className="h-3 w-36 rounded bg-amber-100" />
        <div className="h-6 w-64 rounded bg-slate-200" />
      </div>
      <div className="h-9 w-28 rounded-lg bg-slate-200" />
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
      Loading {label || 'workspace module'}...
    </div>
  </div>
);
