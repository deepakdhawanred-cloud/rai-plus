import React, { useEffect, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react';

// ============================================================================
// CENTRAL RAI PLUS MOTION DESIGN SYSTEM
// Inspired by Disney's 12 Principles — calibrated for fast, purposeful SaaS UX
// ============================================================================

export const RAI_EASE = {
  standard: [0.2, 0, 0, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  spring: [0.22, 1, 0.36, 1] as const,
};

export const RAI_DURATION = {
  fast: 0.14,
  normal: 0.2,
  medium: 0.26,
  slow: 0.4,
};

export const RAI_TRANSITIONS: Record<
  'fast' | 'normal' | 'medium' | 'slow' | 'spring',
  Transition
> = {
  fast: { duration: RAI_DURATION.fast, ease: RAI_EASE.standard },
  normal: { duration: RAI_DURATION.normal, ease: RAI_EASE.enter },
  medium: { duration: RAI_DURATION.medium, ease: RAI_EASE.enter },
  slow: { duration: RAI_DURATION.slow, ease: RAI_EASE.standard },
  spring: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
};

export const RAI_VARIANTS: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: RAI_TRANSITIONS.normal },
    exit: { opacity: 0, transition: { duration: RAI_DURATION.fast, ease: RAI_EASE.exit } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: RAI_TRANSITIONS.normal },
    exit: { opacity: 0, y: -6, transition: { duration: RAI_DURATION.fast, ease: RAI_EASE.exit } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96, y: 6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: RAI_TRANSITIONS.medium },
    exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: RAI_DURATION.fast, ease: RAI_EASE.exit } },
  },
  dropdown: {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: RAI_EASE.spring } },
    exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12, ease: RAI_EASE.exit } },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.045, delayChildren: 0.02 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: RAI_EASE.enter } },
  },
  successPop: {
    hidden: { opacity: 0, scale: 0.82 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 480, damping: 24 },
    },
  },
};

/** Global provider respecting OS prefers-reduced-motion across every Rai Plus component */
export const RaiMotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user" transition={RAI_TRANSITIONS.normal}>
    {children}
  </MotionConfig>
);

/** Pose-to-pose page / tab transition (180-220ms, transform + opacity only, never blocks clicks) */
export const AnimatedPageTransition: React.FC<{
  routeKey: string;
  className?: string;
  children: React.ReactNode;
}> = ({ routeKey, className = '', children }) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      key={routeKey}
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.2, ease: RAI_EASE.enter }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Smooth count-up numeric KPI animation (Staging + Slow In/Out; instant under reduced-motion) */
export const AnimatedNumber: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  formatIndian?: boolean;
  className?: string;
}> = ({
  value,
  prefix = '',
  suffix = '',
  durationMs = 420,
  formatIndian = true,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState<number>(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced || typeof window === 'undefined') {
      setDisplay(value);
      return;
    }
    const startVal = display;
    const diff = value - startVal;
    if (diff === 0) return;
    let frameId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Ease-out cubic (slow out)
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(startVal + diff * eased));
      if (t < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, prefersReduced]);

  const formatted = formatIndian ? display.toLocaleString('en-IN') : String(display);
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

/** Animated progress bar (0% -> target %, GPU-accelerated scaleX or smooth width) */
export const AnimatedProgressBar: React.FC<{
  value: number;
  className?: string;
  barClassName?: string;
  heightClassName?: string;
}> = ({
  value,
  className = 'bg-slate-100',
  barClassName = 'bg-emerald-600',
  heightClassName = 'h-2',
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const prefersReduced = useReducedMotion();
  return (
    <div className={`w-full overflow-hidden rounded-full ${heightClassName} ${className}`}>
      <motion.div
        initial={prefersReduced ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: prefersReduced ? 0 : 0.42, ease: RAI_EASE.spring }}
        className={`h-full rounded-full ${barClassName}`}
      />
    </div>
  );
};

/** Staggered container & interactive card for dashboard metrics & lists */
export const StaggerGrid: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={RAI_VARIANTS.staggerContainer}
      initial={prefersReduced ? false : 'hidden'}
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerCard: React.FC<{
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ className = '', interactive = false, onClick, children }) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={RAI_VARIANTS.staggerItem}
      whileHover={interactive && !prefersReduced ? { y: -2, transition: RAI_TRANSITIONS.fast } : undefined}
      whileTap={interactive && !prefersReduced ? { scale: 0.985, transition: RAI_TRANSITIONS.fast } : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Animated SVG Checkmark (Follow-Through + Exaggerated Positive Feedback) */
export const AnimatedSuccessCheck: React.FC<{ className?: string }> = ({
  className = 'h-4 w-4 text-emerald-600',
}) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={prefersReduced ? false : { scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 460, damping: 24 }}
      aria-hidden="true"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={prefersReduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: prefersReduced ? 0 : 0.3, ease: RAI_EASE.enter }}
      />
    </motion.svg>
  );
};

/** Staged Modal Wrapper with backdrop dim + spring lift */
export const AnimatedModalShell: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ariaLabelledBy?: string;
  panelClassName?: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, ariaLabelledBy, panelClassName = '', children }) => {
  const prefersReduced = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          onClick={onClose}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: RAI_EASE.standard }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: RAI_EASE.spring }}
            className={panelClassName}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
