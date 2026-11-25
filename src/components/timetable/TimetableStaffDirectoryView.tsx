import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  computeStaffTypeCounts,
  filterTimetableStaff,
  type StaffAccessStatus,
  type TimetableStaffMember,
  type TimetableStaffTypeRecord,
} from '../../utils/smartTimetableMasterEngine';

interface TimetableStaffDirectoryViewProps {
  staffMembers: TimetableStaffMember[];
  staffTypes: TimetableStaffTypeRecord[];
  onSaveStaffMember: (member: TimetableStaffMember) => void;
  onAddStaffMember: (member: TimetableStaffMember) => void;
  onDeleteStaffMember: (memberId: string) => void;
  onAddStaffType: (st: TimetableStaffTypeRecord) => void;
}

const ALL_STATUSES: StaffAccessStatus[] = [
  'Joined',
  'Awaiting Sign-Up',
  'No Sign-In',
  'No Access',
];

export const TimetableStaffDirectoryView: React.FC<
  TimetableStaffDirectoryViewProps
> = ({
  staffMembers,
  staffTypes,
  onSaveStaffMember,
  onAddStaffMember,
  onDeleteStaffMember,
  onAddStaffType,
}) => {
  const [innerTab, setInnerTab] = useState<'staff' | 'staff_types'>('staff');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StaffAccessStatus>('All');
  const [typeSearch, setTypeSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Slide-over Edit Staff Drawer (Reference Screenshot 064806)
  const [editingMember, setEditingMember] = useState<TimetableStaffMember | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffSubtitle, setNewStaffSubtitle] = useState('Subject Teacher');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // Add Staff Type Modal (Reference Screenshot 064839)
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeTeaches, setNewTypeTeaches] = useState(true);
  const [newTypeSupervises, setNewTypeSupervises] = useState(true);

  const filteredStaff = useMemo(
    () => filterTimetableStaff(staffMembers, staffTypes, search, statusFilter),
    [staffMembers, staffTypes, search, statusFilter],
  );

  const staffTypeCounts = useMemo(
    () => computeStaffTypeCounts(staffMembers, staffTypes),
    [staffMembers, staffTypes],
  );

  const filteredTypes = useMemo(() => {
    const q = typeSearch.trim().toLowerCase();
    if (!q) return staffTypes;
    return staffTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.shortCode.toLowerCase().includes(q),
    );
  }, [staffTypes, typeSearch]);

  const typeNameById = useMemo(
    () => new Map(staffTypes.map((st) => [st.id, `${st.name} (${st.shortCode})`])),
    [staffTypes],
  );

  function handleSaveDrawer() {
    if (!editingMember) return;
    onSaveStaffMember(editingMember);
    setEditingMember(null);
  }

  function handleAddStaffSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    onAddStaffMember({
      id: `tt-staff-${Date.now().toString(36)}`,
      name: newStaffName.trim(),
      subtitle: newStaffSubtitle.trim() || 'Teacher',
      email:
        newStaffEmail.trim() ||
        `${newStaffName.trim().toLowerCase().replace(/\s+/g, '.')}@school.edu.in`,
      staffTypeIds: ['st-teacher'],
      role: 'Member',
      status: 'Awaiting Sign-Up',
      includeInCover: true,
      workingHoursMode: 'Full Time',
      timeOffPeriodsPerWeek: 0,
      avatarColor: '#4f46e5',
    });
    setNewStaffName('');
    setNewStaffEmail('');
    setShowAddStaff(false);
  }

  function handleAddTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTypeName.trim() || !newTypeCode.trim()) return;
    onAddStaffType({
      id: `st-${Date.now().toString(36)}`,
      name: newTypeName.trim(),
      shortCode: newTypeCode.trim(),
      teaches: newTypeTeaches,
      supervisesAlone: newTypeSupervises,
    });
    setNewTypeName('');
    setNewTypeCode('');
    setShowAddType(false);
  }

  return (
    <div className="space-y-5" data-testid="timetable-staff-directory">
      {/* Sub-tabs: Staff | Staff Types */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setInnerTab('staff')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
            innerTab === 'staff'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff
        </button>
        <button
          type="button"
          onClick={() => setInnerTab('staff_types')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
            innerTab === 'staff_types'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff Types
        </button>
      </div>

      {/* TAB 1: Staff Directory (Screenshots 064656, 064742, 064806, 064823) */}
      {innerTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-slate-900">Staff</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-600 tabular-nums">
                  {staffMembers.length}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Everyone who works here: teachers, support and office staff. Their staff types decide what the timetable can give them.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaff(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Add Staff
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or staff type..."
                aria-label="Search staff by name, email or staff type"
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>

            <select
              aria-label="Filter staff by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'All' | StaffAccessStatus)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Staff Types</th>
                  <th className="py-3 px-4 font-semibold">Cover &amp; Hours</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase"
                          style={{ backgroundColor: member.avatarColor }}
                        >
                          {member.name.slice(0, 1)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {member.subtitle} · {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {member.staffTypeIds.length > 0
                        ? member.staffTypeIds
                            .map((id) => typeNameById.get(id) || id)
                            .join(', ')
                        : 'None'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">
                        {member.includeInCover ? 'Cover Eligible' : 'No Cover'}
                      </span>
                      <span className="text-slate-400"> · </span>
                      <span>{member.workingHoursMode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          member.role === 'Owner'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {member.role === 'Owner' ? (
                          <Star className="h-3 w-3" />
                        ) : (
                          <Users className="h-3 w-3" />
                        )}
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          member.status === 'Joined'
                            ? 'bg-emerald-50 text-emerald-700'
                            : member.status === 'Awaiting Sign-Up'
                              ? 'bg-blue-50 text-blue-800'
                              : member.status === 'No Access'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        type="button"
                        aria-label={`Manage ${member.name}`}
                        onClick={() =>
                          setOpenMenuId(openMenuId === member.id ? null : member.id)
                        }
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === member.id && (
                        <div className="absolute right-4 top-11 z-20 w-40 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember({ ...member });
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSaveStaffMember({ ...member, status: 'No Access' });
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Remove Access
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteStaffMember(member.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Staff Types (Reference Screenshot 064839) */}
      {innerTab === 'staff_types' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-slate-900">Staff Types</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-600">
                  {staffTypes.length}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                The types of people your timetable can schedule: teachers, technicians, support staff.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddType(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Add Staff Type
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              placeholder="Search staff types..."
              aria-label="Search staff types"
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Staff</th>
                  <th className="py-3 px-4 font-semibold">Teaches</th>
                  <th className="py-3 px-4 font-semibold">Supervises Alone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTypes.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {st.name}{' '}
                      <span className="font-normal text-slate-400">({st.shortCode})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 tabular-nums">
                      {staffTypeCounts[st.id] || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          st.teaches
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.teaches ? 'Teaching' : 'Non-Teaching'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {st.supervisesAlone ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over Edit Staff Drawer (Reference Screenshot 064806) */}
      {editingMember && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${editingMember.name}`}
        >
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Pencil className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {editingMember.name}
                    </h3>
                    <p className="text-xs text-slate-500">{editingMember.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close staff editor"
                  onClick={() => setEditingMember(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Role</label>
                <select
                  value={editingMember.role}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      role: e.target.value as TimetableStaffMember['role'],
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  What they can see and change in Smart Timetable. It does not affect their timetable.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-700">
                  {editingMember.status === 'No Access'
                    ? 'Sign-in access removed.'
                    : 'Can sign in to Smart Timetable.'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingMember({
                      ...editingMember,
                      status:
                        editingMember.status === 'No Access' ? 'Joined' : 'No Access',
                    })
                  }
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  {editingMember.status === 'No Access' ? 'Restore Access' : 'Remove Access'}
                </button>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">Teaching</p>

                {/* Staff Types Multi-Select Checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Staff Types <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {staffTypes.map((st) => {
                      const active = editingMember.staffTypeIds.includes(st.id);
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            setEditingMember({
                              ...editingMember,
                              staffTypeIds: active
                                ? editingMember.staffTypeIds.filter((id) => id !== st.id)
                                : [...editingMember.staffTypeIds, st.id],
                            })
                          }
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            active
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {st.name} ({st.shortCode})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Include in Cover Toggle */}
                <div className="flex items-center justify-between gap-3 py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Include in Cover</p>
                    <p className="text-[11px] text-slate-500">
                      Can be chosen as a substitute for other people&apos;s lessons
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingMember.includeInCover}
                    aria-label="Include in Cover"
                    onClick={() =>
                      setEditingMember({
                        ...editingMember,
                        includeInCover: !editingMember.includeInCover,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editingMember.includeInCover ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editingMember.includeInCover ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Working Hours Toggle: Full Time | Set Hours */}
                <div className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Working Hours</p>
                      <p className="text-[11px] text-slate-500">When they are in the building</p>
                    </div>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      {(['Full Time', 'Set Hours'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() =>
                            setEditingMember({
                              ...editingMember,
                              workingHoursMode: mode,
                              timeOffPeriodsPerWeek:
                                mode === 'Full Time'
                                  ? 0
                                  : Math.max(6, editingMember.timeOffPeriodsPerWeek),
                            })
                          }
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            editingMember.workingHoursMode === mode
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  {editingMember.workingHoursMode === 'Set Hours' && (
                    <label className="block text-xs text-slate-700 pt-1">
                      <span className="font-semibold">Weekly Time-Off Periods:</span>
                      <input
                        type="number"
                        min={0}
                        max={48}
                        value={editingMember.timeOffPeriodsPerWeek}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            timeOffPeriodsPerWeek: Number(e.target.value) || 0,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDrawer}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Staff Member"
        >
          <form
            onSubmit={handleAddStaffSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">Add Staff Member</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role / Subject</label>
                <input
                  type="text"
                  value={newStaffSubtitle}
                  onChange={(e) => setNewStaffSubtitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="name@school.edu.in"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Add Staff
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Staff Type Modal */}
      {showAddType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Staff Type"
        >
          <form
            onSubmit={handleAddTypeSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">Add Staff Type</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Type Name</label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Sports Coach"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Short Code</label>
                <input
                  type="text"
                  required
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value)}
                  placeholder="e.g. Coach"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={newTypeTeaches}
                  onChange={(e) => setNewTypeTeaches(e.target.checked)}
                />
                Teaching Staff
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={newTypeSupervises}
                  onChange={(e) => setNewTypeSupervises(e.target.checked)}
                />
                Can Supervise Class Alone
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddType(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Staff Type
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
