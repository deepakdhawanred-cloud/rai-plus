import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Circle,
  Clock,
  ListChecks,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import {
  buildRoleOptimizedTodos,
  loadRoleTodoDailyState,
  optimizeTodoOrder,
  saveRoleTodoDailyState,
  type RoleTodoDailyState,
  type RoleTodoItem,
  type TodoPriority,
  type TodoSortMode,
} from '../utils/roleTodoEngine';
import { AnimatePresence, motion } from 'motion/react';
import {
  AnimatedProgressBar,
  AnimatedSuccessCheck,
  RAI_EASE,
} from './motion/RaiMotionSystem';
import { resolveTodayIsoDate } from '../utils/visAcademicProgressEngine';

interface RoleTodoOptimizerPanelProps {
  data: WorkspaceData;
  onNavigate: (tab: WorkspaceTab) => void;
  compact?: boolean;
}

const PRIORITY_STYLES: Record<TodoPriority, string> = {
  critical: 'bg-rose-100 text-rose-800 border-rose-200',
  high: 'bg-amber-100 text-amber-900 border-amber-200',
  normal: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const RoleTodoOptimizerPanel: React.FC<RoleTodoOptimizerPanelProps> = ({
  data,
  onNavigate,
  compact = false,
}) => {
  const todayIso = resolveTodayIsoDate();
  const schoolId = data.activeSchool.id;
  const userId = data.user.id;

  const [state, setState] = useState<RoleTodoDailyState>(() =>
    loadRoleTodoDailyState(schoolId, userId, todayIso),
  );
  const [sortMode, setSortMode] = useState<TodoSortMode>('smart');
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'done'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TodoPriority>('high');
  const [newMinutes, setNewMinutes] = useState(5);

  const persist = (next: RoleTodoDailyState) => {
    setState(next);
    saveRoleTodoDailyState(schoolId, userId, next);
  };

  const baseItems = useMemo(() => buildRoleOptimizedTodos(data), [data]);
  const allItems = useMemo(
    () => [...baseItems, ...state.customItems],
    [baseItems, state.customItems],
  );

  const completedSet = useMemo(() => new Set(state.completedIds), [state.completedIds]);
  const snoozedSet = useMemo(() => new Set(state.snoozedIds), [state.snoozedIds]);

  const orderedItems = useMemo(
    () =>
      optimizeTodoOrder({
        items: allItems,
        completedIds: completedSet,
        snoozedIds: snoozedSet,
        mode: sortMode,
      }),
    [allItems, completedSet, snoozedSet, sortMode],
  );

  const visibleItems = useMemo(() => {
    return orderedItems.filter((item) => {
      const done = completedSet.has(item.id);
      if (filter === 'pending') return !done;
      if (filter === 'done') return done;
      if (filter === 'urgent') return !done && (item.priority === 'critical' || item.priority === 'high');
      return true;
    });
  }, [orderedItems, completedSet, filter]);

  const completedCount = allItems.filter((i) => completedSet.has(i.id)).length;
  const remainingMinutes = allItems
    .filter((i) => !completedSet.has(i.id))
    .reduce((acc, i) => acc + i.estimatedMinutes, 0);
  const pct = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 100;

  function toggleComplete(id: string) {
    const nextDone = completedSet.has(id)
      ? state.completedIds.filter((x) => x !== id)
      : [...state.completedIds, id];
    const nextSnoozed = state.snoozedIds.filter((x) => x !== id);
    persist({ ...state, completedIds: nextDone, snoozedIds: nextSnoozed });
  }

  function toggleSnooze(id: string) {
    const nextSnoozed = snoozedSet.has(id)
      ? state.snoozedIds.filter((x) => x !== id)
      : [...state.snoozedIds, id];
    persist({ ...state, snoozedIds: nextSnoozed });
  }

  function removeCustom(id: string) {
    persist({
      ...state,
      customItems: state.customItems.filter((c) => c.id !== id),
      completedIds: state.completedIds.filter((x) => x !== id),
      snoozedIds: state.snoozedIds.filter((x) => x !== id),
    });
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    const clean = newTitle.trim();
    if (!clean) return;
    const item: RoleTodoItem = {
      id: `custom-${Date.now().toString(36)}`,
      title: clean,
      detail: 'Personal daily action item',
      priority: newPriority,
      estimatedMinutes: Math.max(1, Math.min(60, Number(newMinutes) || 5)),
      category: 'Personal',
      targetTab: 'overview',
      actionLabel: 'Overview',
      isCustom: true,
    };
    persist({ ...state, customItems: [...state.customItems, item] });
    setNewTitle('');
    setShowAddForm(false);
  }

  function handleResetDay() {
    persist({
      dateIso: todayIso,
      completedIds: [],
      snoozedIds: [],
      customItems: state.customItems,
    });
  }

  const roleLabel = data.user.role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <section
      data-testid="role-todo-optimizer"
      className={`rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden ${
        compact ? '' : ''
      }`}
    >
      {/* Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#FAF4EC] via-white to-slate-50 px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#142B46] text-[#D6B66D]">
            <ListChecks className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-sm font-bold text-[#142B46]">
                Optimized Daily To-Do · {roleLabel}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {completedCount}/{allItems.length} done ({pct}%)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono tabular-nums">
                <Clock className="h-3 w-3" />~{remainingMinutes}m left
              </span>
            </div>
            <div className="mt-1.5 w-48 max-w-full">
              <AnimatedProgressBar
                value={pct}
                heightClassName="h-1.5"
                className="bg-slate-200"
                barClassName="bg-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label="Optimize to-do order"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-[11px]"
          >
            <button
              type="button"
              onClick={() => setSortMode('smart')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                sortMode === 'smart' ? 'bg-[#142B46] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Smart Order
            </button>
            <button
              type="button"
              onClick={() => setSortMode('quick_wins')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                sortMode === 'quick_wins'
                  ? 'bg-[#142B46] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="h-3 w-3" />
              Quick Wins
            </button>
            <button
              type="button"
              onClick={() => setSortMode('priority')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                sortMode === 'priority'
                  ? 'bg-[#142B46] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Urgency
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={handleResetDay}
              title="Reset today’s checklist"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills + Optional Custom Task Form */}
      <div className="px-5 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {(
            [
              ['all', `All (${allItems.length})`],
              ['pending', `Pending (${allItems.length - completedCount})`],
              [
                'urgent',
                `Urgent (${allItems.filter((i) => !completedSet.has(i.id) && (i.priority === 'critical' || i.priority === 'high')).length})`,
              ],
              ['done', `Completed (${completedCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors ${
                filter === key
                  ? 'bg-[#142B46] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          Auto-prioritized for {data.user.name} · {todayIso}
        </span>
      </div>

      <AnimatePresence initial={false}>
      {showAddForm && (
        <motion.form
          key="add-task-form"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: RAI_EASE.spring }}
          onSubmit={handleAddCustom}
          className="mx-5 mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center gap-2 text-xs"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a personal task for today..."
            aria-label="New task title"
            className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
          />
          <select
            aria-label="Priority"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Routine</option>
          </select>
          <label className="inline-flex items-center gap-1 text-slate-600">
            <input
              type="number"
              min={1}
              max={60}
              value={newMinutes}
              onChange={(e) => setNewMinutes(Number(e.target.value))}
              className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
            />
            min
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C]"
          >
            Save
          </button>
        </motion.form>
      )}
      </AnimatePresence>

      {/* Task List */}
      <div className="divide-y divide-slate-100 px-5 pb-3">
        {visibleItems.length === 0 ? (
          <div className="py-5 text-center text-xs text-slate-500">
            {filter === 'done'
              ? 'No completed items yet — check off a quick win above!'
              : 'All caught up in this filter!'}
          </div>
        ) : (
          visibleItems.map((item) => {
            const done = completedSet.has(item.id);
            const snoozed = snoozedSet.has(item.id);
            return (
              <motion.div
                key={item.id}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: done ? 0.55 : snoozed ? 0.72 : 1, y: 0 }}
                transition={{ duration: 0.18, ease: RAI_EASE.enter }}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleComplete(item.id)}
                    aria-label={done ? `Mark "${item.title}" pending` : `Mark "${item.title}" done`}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {done ? (
                      <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <AnimatedSuccessCheck className="h-3.5 w-3.5 text-emerald-700" />
                      </span>
                    ) : (
                      <Circle className="h-4.5 w-4.5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          done ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                      {item.countBadge != null && item.countBadge > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[#142B46] px-1.5 py-0.2 text-[10px] font-bold text-[#FAF4EC] font-mono tabular-nums">
                          {item.countBadge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{item.estimatedMinutes}m · {item.category}
                      </span>
                      {snoozed && !done && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5">
                          Later today
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{item.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                  {!done && (
                    <button
                      type="button"
                      onClick={() => toggleSnooze(item.id)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    >
                      {snoozed ? 'Unsnooze' : 'Later'}
                    </button>
                  )}
                  {item.isCustom ? (
                    <button
                      type="button"
                      onClick={() => removeCustom(item.id)}
                      aria-label="Delete custom task"
                      className="rounded-md border border-slate-200 p-1 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.targetTab)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#F3E6D8] px-2.5 py-1 text-[11px] font-bold text-[#142B46] hover:bg-[#e8d6c2] transition-colors whitespace-nowrap"
                    >
                      {item.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};
