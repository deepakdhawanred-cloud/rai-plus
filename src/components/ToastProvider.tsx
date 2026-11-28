import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Info, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RAI_EASE } from './motion/RaiMotionSystem';

export type ToastVariant = 'success' | 'info' | 'error' | 'streak';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  badge?: string;
  durationMs?: number;
  primaryAction?: ToastAction;
  secondaryAction?: ToastAction;
  onDismiss?: () => void;
}

export interface ToastItem {
  id: string;
  title?: string;
  badge?: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
  primaryAction?: ToastAction;
  secondaryAction?: ToastAction;
  onDismiss?: () => void;
}

type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

export function pushToast(
  message: string,
  variant: ToastVariant = 'success',
  options?: ToastOptions,
) {
  const item: ToastItem = {
    id: options?.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: options?.title,
    badge: options?.badge,
    message,
    variant,
    durationMs: options?.durationMs ?? (variant === 'streak' ? 12000 : 3800),
    primaryAction: options?.primaryAction,
    secondaryAction: options?.secondaryAction,
    onDismiss: options?.onDismiss,
  };
  listeners.forEach((fn) => fn(item));
}

export const ToastViewport: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const prefersReduced = useReducedMotion();

  const removeToast = (id: string, invokeDismiss = false) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => {
      const target = prev.find((t) => t.id === id);
      if (invokeDismiss && target?.onDismiss) {
        target.onDismiss();
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const scheduleAutoDismiss = (item: ToastItem) => {
    const existing = timersRef.current.get(item.id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
    }
    const timerId = window.setTimeout(() => {
      timersRef.current.delete(item.id);
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, item.durationMs);
    timersRef.current.set(item.id, timerId);
  };

  useEffect(() => {
    const handleAdd: ToastListener = (item) => {
      setToasts((prev) => {
        const deduped = prev.filter((t) => t.id !== item.id);
        return [...deduped.slice(-3), item];
      });
      scheduleAutoDismiss(item);
    };
    listeners.add(handleAdd);
    return () => {
      listeners.delete(handleAdd);
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] print:hidden pointer-events-none"
    >
      <AnimatePresence initial={false}>
      {toasts.map((t) => {
        const isStreak = t.variant === 'streak';
        const style =
          t.variant === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-900'
            : t.variant === 'streak'
              ? 'border-[#D6B66D] bg-[#FAF4EC] text-[#142B46] shadow-lg'
              : t.variant === 'info'
                ? 'border-blue-200 bg-white text-slate-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950';
        const Icon =
          t.variant === 'error'
            ? AlertCircle
            : t.variant === 'streak'
              ? Flame
              : t.variant === 'info'
                ? Info
                : CheckCircle2;
        const iconColor =
          t.variant === 'error'
            ? 'text-rose-600'
            : t.variant === 'streak'
              ? 'text-[#D6B66D]'
              : t.variant === 'info'
                ? 'text-blue-900'
                : 'text-emerald-700';

        return (
          <motion.div
            key={t.id}
            layout="position"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.97 }}
            transition={{ duration: prefersReduced ? 0.1 : 0.22, ease: RAI_EASE.spring }}
            role={isStreak ? 'alert' : 'status'}
            data-testid={isStreak ? 'revision-streak-toast' : 'workspace-toast'}
            onMouseEnter={() => {
              const timerId = timersRef.current.get(t.id);
              if (timerId !== undefined) {
                window.clearTimeout(timerId);
                timersRef.current.delete(t.id);
              }
            }}
            onMouseLeave={() => scheduleAutoDismiss(t)}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3.5 text-xs font-medium shadow-md ${style}`}
          >
            {isStreak ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142B46] text-[#D6B66D] mt-0.5">
                <Flame className="h-4 w-4" />
              </div>
            ) : (
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              {(t.title || t.badge) && (
                <div className="flex flex-wrap items-center gap-2">
                  {t.title && (
                    <p className="font-display text-xs font-bold text-[#142B46] leading-snug">
                      {t.title}
                    </p>
                  )}
                  {t.badge && (
                    <span className="rounded bg-[#142B46]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#142B46] whitespace-nowrap">
                      {t.badge}
                    </span>
                  )}
                </div>
              )}
              <p className="leading-relaxed text-slate-700">{t.message}</p>

              {(t.primaryAction || t.secondaryAction) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {t.primaryAction && (
                    <button
                      type="button"
                      data-testid="toast-primary-action"
                      onClick={() => {
                        const action = t.primaryAction;
                        removeToast(t.id, false);
                        action?.onClick();
                      }}
                      className="rounded-lg bg-[#142B46] px-3 py-1.5 text-[11px] font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] whitespace-nowrap shrink-0 transition-colors"
                    >
                      {t.primaryAction.label}
                    </button>
                  )}
                  {t.secondaryAction && (
                    <button
                      type="button"
                      data-testid="toast-secondary-action"
                      onClick={() => {
                        const action = t.secondaryAction;
                        removeToast(t.id, false);
                        action?.onClick();
                      }}
                      className="rounded-lg border border-[#D6B66D]/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#142B46] hover:bg-[#F3E6D8]/60 whitespace-nowrap shrink-0 transition-colors"
                    >
                      {t.secondaryAction.label}
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(t.id, true)}
              className="rounded p-0.5 text-slate-500 hover:text-slate-900 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
};
