import React from 'react';
import type { WorkspaceTab } from '../types/workspace';
import type { RoleQuickDockItem } from '../utils/roleNavigationConfig';

interface RoleNavigationDockProps {
  items: RoleQuickDockItem[];
  activeTab: WorkspaceTab;
  isOneGoAttendanceActive: boolean;
  onSelect: (item: RoleQuickDockItem) => void;
}

export const RoleNavigationDock: React.FC<RoleNavigationDockProps> = ({
  items,
  activeTab,
  isOneGoAttendanceActive,
  onSelect,
}) => {
  if (items.length <= 1) return null;

  return (
    <div
      data-testid="role-quick-navigation-dock"
      className="hidden md:block border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 print:hidden"
    >
      <nav
        aria-label="Daily quick navigation"
        className="flex items-center gap-1 overflow-x-auto max-w-7xl mx-auto"
      >
        {items.map((item) => {
          const isActive =
            item.actionMode === 'one_go_attendance'
              ? activeTab === 'today_workspace' && isOneGoAttendanceActive
              : item.tab === 'today_workspace'
                ? activeTab === 'today_workspace' && !isOneGoAttendanceActive
                : activeTab === item.tab ||
                  (item.tab === 'academics' && activeTab === 'academic_resources');

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(item)}
              className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                isActive
                  ? 'border-[#142B46] text-[#142B46]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isActive ? 'text-[#937024] font-bold' : 'text-slate-400 font-medium'
                  }`}
                >
                  ({item.count})
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
