import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Compass,
  Download,
  Footprints,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import type {
  BusRoute,
  StudentRecord,
  StudentTransportAllocation,
  TransportAttendanceShift,
  TransportAttendanceStatus,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { triggerCsvDownload } from '../../utils/csvExport';
import {
  RAI_PLUS_LOGO_URL,
  computeAreaWiseSegregation,
  computeRouteWiseSegregation,
} from '../../utils/transportEngine';
import { hasGoogleMapsAccess } from '../../utils/subscriptionEntitlements';
import { LiveBusGpsMap } from '../LiveBusGpsMap';
import { AdmissionRouteOptimizerPanel } from '../AdmissionRouteOptimizerPanel';

interface TransportManagementModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type TransportSubTab =
  | 'live_gps'
  | 'route_optimizer'
  | 'attendance'
  | 'allocations'
  | 'reports';

export const TransportManagementModule: React.FC<TransportManagementModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const bundle = data.transport;
  const isParentOrStudent = data.user.role === 'parent' || data.user.role === 'student';
  const canManageRoutes = Boolean(bundle?.canManageRoutes);
  const canAllocate = [
    'super_admin',
    'school_admin',
    'principal',
    'transport_incharge',
    'coordinator',
  ].includes(data.user.role);
  const canMarkAttendance = Boolean(bundle?.canMarkAttendance);
  const googleMapsEnabled = hasGoogleMapsAccess(data.activeSchool);
  const canUpgradePlan = data.user.role === 'super_admin';

  const [subTab, setSubTab] = useState<TransportSubTab>('live_gps');
  const [liveRoutes, setLiveRoutes] = useState<BusRoute[]>(bundle?.routes || []);
  const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync liveRoutes when workspace refreshes
  useEffect(() => {
    setLiveRoutes(bundle?.routes || []);
  }, [bundle?.routes]);

  // Daily Attendance State
  const todayIso = new Date().toISOString().slice(0, 10);
  const [attDate, setAttDate] = useState<string>(todayIso);
  const [attShift, setAttShift] = useState<TransportAttendanceShift>('Morning');
  const [attRouteId, setAttRouteId] = useState<string>(bundle?.routes[0]?.id || '');
  const [attDraft, setAttDraft] = useState<Record<string, TransportAttendanceStatus>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Student Allocation Editor State
  const [allocSearch, setAllocSearch] = useState('');
  const [allocFilter, setAllocFilter] = useState<'all' | 'Bus' | 'Walker' | 'unallotted'>('all');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'Bus' | 'Walker'>('Bus');
  const [editRouteId, setEditRouteId] = useState<string>('');
  const [editStopId, setEditStopId] = useState<string>('');
  const [editAreaLocality, setEditAreaLocality] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingAlloc, setSavingAlloc] = useState(false);

  // Add / Edit Route Modal State
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeDraftId, setRouteDraftId] = useState<string | undefined>(undefined);
  const [routeCode, setRouteCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [capacity, setCapacity] = useState('40');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [driverExperienceYears, setDriverExperienceYears] = useState('8');
  const [attendantName, setAttendantName] = useState('');
  const [attendantPhone, setAttendantPhone] = useState('');
  const [monthlyFeeInr, setMonthlyFeeInr] = useState('1100');
  const [areasCoveredText, setAreasCoveredText] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [savingRoute, setSavingRoute] = useState(false);

  // Segregation Report Expandable Rows
  const [expandedRouteReportId, setExpandedRouteReportId] = useState<string | null>(null);
  const [expandedAreaReportName, setExpandedAreaReportName] = useState<string | null>(null);

  const allocations = bundle?.allocations || [];
  const attendanceToday = bundle?.attendanceToday || [];
  const schoolLocation = bundle?.schoolLocation || {
    lat: 28.6063,
    lng: 76.6565,
    label: data.activeSchool.name,
  };

  useEffect(() => {
    if (!attRouteId && liveRoutes.length > 0) {
      setAttRouteId(liveRoutes[0].id);
    }
  }, [attRouteId, liveRoutes]);

  const routeSegregation = useMemo(
    () =>
      computeRouteWiseSegregation(liveRoutes, allocations, data.students, attendanceToday),
    [liveRoutes, allocations, data.students, attendanceToday],
  );

  const areaSegregation = useMemo(
    () => computeAreaWiseSegregation(liveRoutes, allocations, data.students),
    [liveRoutes, allocations, data.students],
  );

  const studentCountByRouteId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of routeSegregation.routeRows) {
      counts[row.route.id] = row.assignedCount;
    }
    return counts;
  }, [routeSegregation.routeRows]);

  const allocByStudentId = useMemo(() => {
    const map: Record<string, StudentTransportAllocation> = {};
    for (const a of allocations) map[a.studentId] = a;
    return map;
  }, [allocations]);

  const routeById = useMemo(() => {
    const map: Record<string, BusRoute> = {};
    for (const r of liveRoutes) map[r.id] = r;
    return map;
  }, [liveRoutes]);

  // Populate attendance draft whenever route or shift changes
  const selectedAttRouteRow = useMemo(
    () => routeSegregation.routeRows.find((r) => r.route.id === attRouteId) || routeSegregation.routeRows[0] || null,
    [routeSegregation.routeRows, attRouteId],
  );

  useEffect(() => {
    if (!selectedAttRouteRow) return;
    const next: Record<string, TransportAttendanceStatus> = {};
    for (const member of selectedAttRouteRow.assignedStudents) {
      const existing =
        attShift === 'Morning' ? member.morningStatus : member.eveningStatus;
      if (existing) {
        next[member.student.id] = existing;
      }
    }
    setAttDraft(next);
  }, [selectedAttRouteRow, attShift, attDate]);

  async function handleRefreshLiveGps() {
    try {
      const res = await apiRequest<{ routes: BusRoute[] }>('/api/transport/live-gps', {}, token);
      if (Array.isArray(res.routes)) {
        setLiveRoutes(res.routes);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to refresh live GPS coordinates.');
    }
  }

  async function handleSimulateStep() {
    try {
      const res = await apiRequest<{ routes: BusRoute[] }>(
        '/api/transport/gps/ping',
        { method: 'POST', body: JSON.stringify({ simulateStep: true }) },
        token,
      );
      if (Array.isArray(res.routes)) {
        setLiveRoutes(res.routes);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to step GPS telemetry.');
    }
  }

  async function handleUpgradeToPremium() {
    setErrorMsg(null);
    try {
      await apiRequest(
        `/api/schools/${data.activeSchool.id}/subscription`,
        {
          method: 'PATCH',
          body: JSON.stringify({ subscriptionPlan: 'Premium Campus' }),
        },
        token,
      );
      await onRefresh();
      setFeedback(
        `Upgraded ${data.activeSchool.name} to Premium Campus — Live Google Maps GPS & Address Geocoding are now enabled.`,
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to upgrade school subscription package.',
      );
    }
  }

  function openStudentAllocator(student: StudentRecord) {
    const current = allocByStudentId[student.id];
    setEditingStudentId(student.id);
    setEditMode(current?.mode || 'Bus');
    const defaultRouteId = current?.routeId || liveRoutes[0]?.id || '';
    setEditRouteId(defaultRouteId);
    const chosenRoute = routeById[defaultRouteId];
    setEditStopId(
      current?.stopId ||
        chosenRoute?.stops.find((s) => s.area !== 'School Campus')?.id ||
        chosenRoute?.stops[0]?.id ||
        '',
    );
    setEditAreaLocality(current?.areaLocality || student.address || '');
    setEditNotes(current?.notes || '');
    setErrorMsg(null);
  }

  async function handleSaveAllocation(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudentId) return;
    setErrorMsg(null);

    if (editMode === 'Bus' && !editRouteId) {
      setErrorMsg('Non-walker students must be allotted an active bus route.');
      return;
    }

    setSavingAlloc(true);
    try {
      await apiRequest(
        `/api/transport/allocations/${editingStudentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            mode: editMode,
            routeId: editMode === 'Bus' ? editRouteId : undefined,
            stopId: editMode === 'Bus' ? editStopId : undefined,
            areaLocality: editAreaLocality,
            notes: editNotes,
          }),
        },
        token,
      );
      setEditingStudentId(null);
      await onRefresh();
      setFeedback('Student transport allotment saved and synced across parent & driver rosters.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update student transport allotment.');
    } finally {
      setSavingAlloc(false);
    }
  }

  async function handleSaveRouteAttendance() {
    if (!selectedAttRouteRow) return;
    setErrorMsg(null);
    const defaultPresent: TransportAttendanceStatus =
      attShift === 'Morning' ? 'Boarded' : 'Dropped';

    const entries = selectedAttRouteRow.assignedStudents.map((m) => ({
      studentId: m.student.id,
      status: attDraft[m.student.id] || defaultPresent,
      boardingStopName: m.allocation.stopName,
    }));

    if (entries.length === 0) {
      setErrorMsg('No students are allotted to this route yet.');
      return;
    }

    setSavingAttendance(true);
    try {
      await apiRequest(
        '/api/transport/attendance/batch',
        {
          method: 'POST',
          body: JSON.stringify({
            date: attDate,
            shift: attShift,
            routeId: selectedAttRouteRow.route.id,
            entries,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback(
        `Saved ${attShift} route attendance for ${selectedAttRouteRow.route.routeCode} (${entries.length} students on ${attDate}).`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save daily route attendance.');
    } finally {
      setSavingAttendance(false);
    }
  }

  function handleMarkAllAttendance(status: TransportAttendanceStatus) {
    if (!selectedAttRouteRow) return;
    const next: Record<string, TransportAttendanceStatus> = {};
    for (const m of selectedAttRouteRow.assignedStudents) {
      next[m.student.id] = status;
    }
    setAttDraft(next);
  }

  function openNewRouteModal() {
    setRouteDraftId(undefined);
    setRouteCode(`R-0${liveRoutes.length + 1}`);
    setRouteName('');
    setBusNumber('HR-14-S-');
    setCapacity('40');
    setDriverName('');
    setDriverPhone('+91 ');
    setDriverLicenseNo('');
    setDriverExperienceYears('8');
    setAttendantName('');
    setAttendantPhone('+91 ');
    setMonthlyFeeInr('1100');
    setAreasCoveredText('');
    setGpsEnabled(true);
    setErrorMsg(null);
    setRouteModalOpen(true);
  }

  function openEditRouteModal(route: BusRoute) {
    setRouteDraftId(route.id);
    setRouteCode(route.routeCode);
    setRouteName(route.routeName);
    setBusNumber(route.busNumber);
    setCapacity(String(route.capacity));
    setDriverName(route.driverName);
    setDriverPhone(route.driverPhone);
    setDriverLicenseNo(route.driverLicenseNo);
    setDriverExperienceYears(String(route.driverExperienceYears));
    setAttendantName(route.attendantName);
    setAttendantPhone(route.attendantPhone);
    setMonthlyFeeInr(String(route.monthlyFeeInr));
    setAreasCoveredText(route.areasCovered.join(', '));
    setGpsEnabled(route.gpsEnabled);
    setErrorMsg(null);
    setRouteModalOpen(true);
  }

  async function handleSaveRoute(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSavingRoute(true);
    try {
      await apiRequest(
        '/api/transport/routes',
        {
          method: 'POST',
          body: JSON.stringify({
            id: routeDraftId,
            routeCode,
            routeName,
            busNumber,
            capacity: Number(capacity) || 40,
            driverName,
            driverPhone,
            driverLicenseNo,
            driverExperienceYears: Number(driverExperienceYears) || 5,
            attendantName,
            attendantPhone,
            monthlyFeeInr: Number(monthlyFeeInr) || 1050,
            areasCoveredText,
            gpsEnabled,
          }),
        },
        token,
      );
      setRouteModalOpen(false);
      await onRefresh();
      setFeedback(
        routeDraftId
          ? `Updated route ${routeCode} (${routeName}).`
          : `Created new bus route ${routeCode} (${routeName}).`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save bus route.');
    } finally {
      setSavingRoute(false);
    }
  }

  const filteredAllocStudents = useMemo(() => {
    const q = allocSearch.trim().toLowerCase();
    const unallottedIds = new Set(routeSegregation.unallottedBusRisk.map((u) => u.student.id));
    return data.students.filter((st) => {
      const alloc = allocByStudentId[st.id];
      if (allocFilter === 'Bus' && alloc?.mode !== 'Bus') return false;
      if (allocFilter === 'Walker' && alloc?.mode !== 'Walker') return false;
      if (allocFilter === 'unallotted' && !unallottedIds.has(st.id)) return false;
      if (q) {
        const route = alloc?.routeId ? routeById[alloc.routeId] : undefined;
        const hay = `${st.name} ${st.classSection} ${st.admissionNo} ${alloc?.areaLocality || ''} ${alloc?.stopName || ''} ${route?.routeCode || ''} ${route?.routeName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.students, allocByStudentId, allocSearch, allocFilter, routeById, routeSegregation.unallottedBusRisk]);

  if (!bundle) {
    return (
      <div className="rounded-xl border border-[#D9C9B6] bg-white p-8 text-center text-sm text-slate-600">
        Transport module data is loading for {data.activeSchool.name}.
      </div>
    );
  }

  // =========================================================================
  // DEDICATED PARENT / STUDENT VIEW (STRICTLY ASSIGNED BUS & DRIVER DETAILS)
  // =========================================================================
  if (isParentOrStudent) {
    return (
      <div className="space-y-6" data-testid="parent-transport-view">
        <div className="border-b border-[#E5D7C3] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus"
              className="h-10 w-10 rounded-lg border border-[#D6B66D]/60 object-cover bg-[#F3E6D8]"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-[#142B46]">
                Student Bus Transport, Driver Details &amp; Live GPS
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                View your child’s allotted school bus route, morning/evening boarding status, driver
                credentials, and live bus location.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-[#D6B66D] bg-[#FAF4EC] px-3.5 py-2 text-xs text-[#142B46] whitespace-nowrap">
            <span className="font-semibold text-[#7B5D1C]">Transport Desk:</span>{' '}
            <span className="font-mono font-bold">{bundle.transportHelpline}</span>
          </div>
        </div>

        {/* Linked Student Cards */}
        <div className="space-y-5">
          {data.students.map((student) => {
            const alloc = allocByStudentId[student.id];
            const route = alloc?.routeId ? routeById[alloc.routeId] : undefined;
            const morningRec = attendanceToday.find(
              (a) => a.studentId === student.id && a.shift === 'Morning',
            );
            const eveningRec = attendanceToday.find(
              (a) => a.studentId === student.id && a.shift === 'Evening',
            );

            if (!alloc || alloc.mode === 'Walker') {
              return (
                <div
                  key={student.id}
                  className="rounded-xl border border-[#C6DCCC] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-[#F0F6F2] border border-[#C6DCCC] flex items-center justify-center shrink-0">
                      <Footprints className="h-5 w-5 text-[#3D6349]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#3D6349]">
                        Registered Walker / Self-Drop
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#142B46] mt-0.5">
                        {student.name} · Class {student.classSection}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Area: <strong>{alloc?.areaLocality || student.address || 'Near Campus'}</strong>{' '}
                        · No bus route required. To opt into school bus service, contact the
                        Transport Incharge desk.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#F0F6F2] border border-[#C6DCCC] px-3 py-1.5 text-xs font-bold text-[#2D5139] whitespace-nowrap self-start sm:self-center">
                    Walker Verified
                  </span>
                </div>
              );
            }

            return (
              <div
                key={student.id}
                className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden shadow-xs"
              >
                <div className="bg-[#142B46] text-[#F3E6D8] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6B66D]">
                      Allotted School Bus Route · {student.name} ({student.classSection})
                    </p>
                    <h2 className="font-display text-lg font-bold text-white mt-0.5">
                      {route
                        ? `${route.routeCode} · ${route.routeName}`
                        : 'Bus Route Assignment Pending'}
                    </h2>
                  </div>
                  {route && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold rounded-lg bg-[#1E3B5C] border border-[#D6B66D]/50 px-3 py-1.5 text-[#D6B66D]">
                        Bus {route.busNumber}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                          route.gpsEnabled
                            ? 'bg-[#6E987A] text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {route.gpsEnabled ? 'GPS Live' : 'No GPS Hardware'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Stop & Daily Boarding Status */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[#E6D8C6] bg-[#FAF4EC] p-3.5">
                        <p className="text-[11px] font-semibold text-slate-500">Assigned Stop</p>
                        <p className="text-sm font-bold text-[#142B46] mt-0.5">
                          {alloc.stopName || 'Designated Corridor Stop'}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{alloc.areaLocality}</p>
                      </div>
                      <div className="rounded-lg border border-[#E6D8C6] bg-[#FAF4EC] p-3.5">
                        <p className="text-[11px] font-semibold text-slate-500">Pickup &amp; Drop Timings</p>
                        <p className="font-mono text-sm font-bold text-[#142B46] mt-0.5 tabular-nums">
                          {alloc.pickupTime || '07:20'} / {alloc.dropTime || '14:30'}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Monthly Fee: ₹{route?.monthlyFeeInr ?? 1050}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                      <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#7B5D1C]" />
                        Today’s Route Boarding &amp; Drop Attendance ({todayIso})
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-[11px] text-slate-500">Morning Pickup</p>
                          <p
                            className={`font-bold mt-0.5 ${
                              morningRec?.status === 'Boarded'
                                ? 'text-[#2D5139]'
                                : morningRec?.status === 'Absent'
                                  ? 'text-rose-700'
                                  : 'text-slate-600'
                            }`}
                          >
                            {morningRec ? morningRec.status : 'Awaiting Roll Call'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-[11px] text-slate-500">Evening Drop</p>
                          <p
                            className={`font-bold mt-0.5 ${
                              eveningRec?.status === 'Dropped'
                                ? 'text-[#2D5139]'
                                : eveningRec?.status === 'Absent'
                                  ? 'text-rose-700'
                                  : 'text-slate-600'
                            }`}
                          >
                            {eveningRec ? eveningRec.status : 'Scheduled Afternoon'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Particular Driver & Attendant Details Card */}
                  {route && (
                    <div
                      data-testid="parent-driver-details-card"
                      className="lg:col-span-6 rounded-xl border border-[#D6B66D] bg-[#FAF4EC] p-5 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#D6B66D]/50 pb-2.5">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
                            Verified Bus Driver &amp; Attendant Details
                          </p>
                          <h3 className="font-display text-base font-bold text-[#142B46] mt-0.5">
                            {route.driverName}
                          </h3>
                        </div>
                        <a
                          href={`tel:${route.driverPhone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#D6B66D]" />
                          Call Driver
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[11px] text-slate-500">Driver Mobile</p>
                          <p className="font-mono font-bold text-[#142B46] mt-0.5">
                            {route.driverPhone}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500">Driving License No.</p>
                          <p className="font-mono font-semibold text-[#142B46] mt-0.5">
                            {route.driverLicenseNo}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500">Verified Experience</p>
                          <p className="font-semibold text-[#142B46] mt-0.5">
                            {route.driverExperienceYears} Years (Heavy School Bus)
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500">Bus Attendant / Helper</p>
                          <p className="font-semibold text-[#142B46] mt-0.5">
                            {route.attendantName} ·{' '}
                            <span className="font-mono">{route.attendantPhone}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strictly Allotted Bus Live GPS Map (Premium Package Gated) */}
        {liveRoutes.length > 0 && (
          <LiveBusGpsMap
            routes={liveRoutes}
            schoolLocation={schoolLocation}
            gpsScope="assigned_bus_only"
            canSimulateGps={false}
            onRefreshLiveGps={handleRefreshLiveGps}
            googleMapsEnabled={googleMapsEnabled}
            subscriptionPlan={data.activeSchool.subscriptionPlan}
            canUpgradePlan={false}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // STAFF / PRINCIPAL / TRANSPORT INCHARGE / COORDINATOR / TEACHER VIEW
  // =========================================================================
  const totalBusRiders = routeSegregation.routeRows.reduce((s, r) => s + r.assignedCount, 0);
  const totalCapacity = liveRoutes.reduce((s, r) => s + r.capacity, 0);
  const gpsEquippedCount = liveRoutes.filter((r) => r.gpsEnabled).length;
  const totalMorningBoarded = routeSegregation.routeRows.reduce(
    (s, r) => s + r.morningBoardedCount,
    0,
  );
  const totalEveningDropped = routeSegregation.routeRows.reduce(
    (s, r) => s + r.eveningDroppedCount,
    0,
  );

  const selectedEditRoute = editRouteId ? routeById[editRouteId] : undefined;

  return (
    <div className="space-y-6" data-testid="staff-transport-module">
      {/* Header */}
      <div className="border-b border-[#E5D7C3] pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={RAI_PLUS_LOGO_URL}
            alt="Rai Plus"
            className="h-11 w-11 rounded-lg border border-[#D6B66D]/60 object-cover bg-[#F3E6D8]"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
              Rai Plus Transport Operations · {data.activeSchool.subscriptionPlan} · Google Maps{' '}
              {googleMapsEnabled ? 'Active (Premium)' : 'Locked (Premium Only)'}
            </p>
            <h1 className="font-display text-2xl font-bold text-[#142B46]">
              Route Management, Daily Bus Attendance &amp; Live GPS
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Monitor all GPS-equipped buses at once, enforce walker vs. bus allotment, record
              morning/evening route roll calls, and optimise routes by locality.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageRoutes && (
            <button
              type="button"
              onClick={openNewRouteModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />
              Add Bus Route
            </button>
          )}
        </div>
      </div>

      {/* Feedback / Error Strip */}
      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-800 hover:text-emerald-950 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-900 flex items-center justify-between gap-3"
        >
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0" />
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-800 hover:text-rose-950 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#D9C9B6] bg-white px-5 py-4">
          <p className="text-xs font-medium text-slate-500">Active Fleet &amp; GPS</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#142B46] tabular-nums">
            {gpsEquippedCount}/{liveRoutes.length} GPS
          </p>
          <p className="mt-1 text-xs text-slate-600 tabular-nums">
            {totalCapacity} total seats across {liveRoutes.length} routes
          </p>
        </div>

        <div className="rounded-xl border border-[#D9C9B6] bg-white px-5 py-4">
          <p className="text-xs font-medium text-slate-500">Bus Riders vs Walkers</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#142B46] tabular-nums">
            {totalBusRiders} / {routeSegregation.walkers.length}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {totalBusRiders} bus riders · {routeSegregation.walkers.length} verified walkers
          </p>
        </div>

        <div
          className={`rounded-xl border px-5 py-4 ${
            routeSegregation.unallottedBusRisk.length > 0
              ? 'border-amber-300 bg-amber-50'
              : 'border-[#C6DCCC] bg-white'
          }`}
        >
          <p className="text-xs font-medium text-slate-500">Unallotted Non-Walkers</p>
          <p
            className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
              routeSegregation.unallottedBusRisk.length > 0
                ? 'text-amber-800'
                : 'text-[#3D6349]'
            }`}
          >
            {routeSegregation.unallottedBusRisk.length}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {routeSegregation.unallottedBusRisk.length > 0
              ? 'Action required: assign bus route'
              : '100% students allotted or walker'}
          </p>
        </div>

        <div className="rounded-xl border border-[#D9C9B6] bg-white px-5 py-4">
          <p className="text-xs font-medium text-slate-500">Today’s Route Roll Call</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#3D6349] tabular-nums">
            {totalMorningBoarded} AM · {totalEveningDropped} PM
          </p>
          <p className="mt-1 text-xs text-slate-600">Morning boarded &amp; evening dropped</p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F3E6D8] p-1.5 w-fit">
        {(
          [
            { id: 'live_gps', label: 'Live GPS Fleet Map', icon: Radio },
            { id: 'route_optimizer', label: 'Admission Route Optimizer', icon: Compass },
            { id: 'attendance', label: 'Daily Morning & Evening Attendance', icon: ClipboardCheck },
            { id: 'allocations', label: 'Student Allotment & Fleet', icon: Bus },
            { id: 'reports', label: 'Route-Wise & Area-Wise Reports', icon: MapPin },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              data-testid={`transport-tab-${tab.id}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                active
                  ? 'bg-[#142B46] text-white shadow-xs'
                  : 'text-[#142B46]/80 hover:bg-white/70 hover:text-[#142B46]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#D6B66D]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1B: ADMISSION ROUTE OPTIMIZER ==================== */}
      {subTab === 'route_optimizer' && (
        <AdmissionRouteOptimizerPanel
          routes={liveRoutes}
          allocations={allocations}
          schoolLocation={schoolLocation}
          schoolId={data.activeSchool.id}
          leads={data.admissionLeads || []}
          token={token}
          googleMapsEnabled={googleMapsEnabled}
          subscriptionPlan={data.activeSchool.subscriptionPlan}
          canUpgradePlan={canUpgradePlan}
          onUpgradeToPremium={canUpgradePlan ? handleUpgradeToPremium : undefined}
        />
      )}

      {/* ==================== TAB 1: LIVE GPS FLEET MAP ==================== */}
      {subTab === 'live_gps' && (
        <div className="space-y-5">
          <LiveBusGpsMap
            routes={liveRoutes}
            schoolLocation={schoolLocation}
            gpsScope="all_buses"
            studentCountByRouteId={studentCountByRouteId}
            canSimulateGps={true}
            onSimulateStep={handleSimulateStep}
            onRefreshLiveGps={handleRefreshLiveGps}
            focusedRouteId={focusedRouteId}
            onSelectRoute={setFocusedRouteId}
            googleMapsEnabled={googleMapsEnabled}
            subscriptionPlan={data.activeSchool.subscriptionPlan}
            canUpgradePlan={canUpgradePlan}
            onUpgradeToPremium={canUpgradePlan ? handleUpgradeToPremium : undefined}
          />

          {/* Fleet Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {routeSegregation.routeRows.map((row) => {
              const { route } = row;
              const currentStop = route.stops[route.currentStopIndex] || route.stops[0];
              const isFocused = focusedRouteId === route.id;
              return (
                <div
                  key={route.id}
                  className={`rounded-xl border bg-white p-4 space-y-3 transition-colors ${
                    isFocused ? 'border-[#142B46] ring-2 ring-[#142B46]/15' : 'border-[#D9C9B6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: route.routeColor }}
                        />
                        <p className="font-mono text-xs font-extrabold text-[#142B46]">
                          {route.routeCode} · {route.busNumber}
                        </p>
                      </div>
                      <h3 className="font-display text-sm font-bold text-[#142B46] mt-0.5">
                        {route.routeName}
                      </h3>
                    </div>
                    {route.gpsEnabled ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 whitespace-nowrap">
                        <Navigation className="h-3 w-3" />
                        {route.currentSpeedKmph} km/h
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-600 whitespace-nowrap">
                        <WifiOff className="h-3 w-3" />
                        No GPS
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <span className="font-semibold text-[#142B46]">Driver:</span>{' '}
                      {route.driverName} ·{' '}
                      <a
                        href={`tel:${route.driverPhone.replace(/\s+/g, '')}`}
                        className="font-mono text-blue-900 underline"
                      >
                        {route.driverPhone}
                      </a>
                    </p>
                    <p>
                      <span className="font-semibold text-[#142B46]">Attendant:</span>{' '}
                      {route.attendantName} ({route.attendantPhone})
                    </p>
                    <p>
                      <span className="font-semibold text-[#142B46]">Current Stop:</span>{' '}
                      {currentStop?.name || 'En Route'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#142B46] tabular-nums">
                      {row.assignedCount}/{route.capacity} Seats ({row.utilizationPct}%)
                    </span>
                    {route.gpsEnabled ? (
                      <button
                        type="button"
                        onClick={() => setFocusedRouteId(isFocused ? null : route.id)}
                        className="rounded-lg border border-[#142B46] px-2.5 py-1 text-[11px] font-semibold text-[#142B46] hover:bg-[#142B46] hover:text-white transition-colors"
                      >
                        {isFocused ? 'Show All Buses' : 'Locate on Map'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Manual Roll Call Only</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DAILY ROUTE ATTENDANCE (MORNING & EVENING) ==================== */}
      {subTab === 'attendance' && (
        <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden">
          <div className="border-b border-[#E5D7C3] bg-[#FAF4EC] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#142B46]">
                Daily Route Attendance Register (Morning Pickup &amp; Evening Drop)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Mark daily bus boarding in the morning and safe drop-off in the evening. Parents see
                today’s live boarding status on their Rai Plus portal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="date"
                aria-label="Transport attendance date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
              />

              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
                {(['Morning', 'Evening'] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => setAttShift(sh)}
                    data-testid={`shift-btn-${sh.toLowerCase()}`}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      attShift === sh
                        ? 'bg-[#142B46] text-white'
                        : 'text-slate-600 hover:text-[#142B46]'
                    }`}
                  >
                    {sh === 'Morning' ? 'Morning Pickup' : 'Evening Drop'}
                  </button>
                ))}
              </div>

              <select
                aria-label="Select bus route for attendance"
                value={selectedAttRouteRow?.route.id || ''}
                onChange={(e) => setAttRouteId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46]"
              >
                {routeSegregation.routeRows.map((row) => (
                  <option key={row.route.id} value={row.route.id}>
                    {row.route.routeCode} · {row.route.routeName} ({row.assignedCount} students)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAttRouteRow && (
            <>
              <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-700">
                  <span>
                    <strong className="text-[#142B46]">Bus:</strong>{' '}
                    <span className="font-mono">{selectedAttRouteRow.route.busNumber}</span>
                  </span>
                  <span>
                    <strong className="text-[#142B46]">Driver:</strong>{' '}
                    {selectedAttRouteRow.route.driverName} ({selectedAttRouteRow.route.driverPhone})
                  </span>
                  <span>
                    <strong className="text-[#142B46]">Attendant:</strong>{' '}
                    {selectedAttRouteRow.route.attendantName}
                  </span>
                </div>

                {canMarkAttendance && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAllAttendance(attShift === 'Morning' ? 'Boarded' : 'Dropped')
                      }
                      className="rounded-lg border border-[#6E987A] bg-[#F0F6F2] px-3 py-1.5 text-xs font-semibold text-[#2D5139] hover:bg-[#E1EFE6]"
                    >
                      Mark All {attShift === 'Morning' ? 'Boarded' : 'Dropped'}
                    </button>
                    <button
                      type="button"
                      disabled={savingAttendance}
                      onClick={() => void handleSaveRouteAttendance()}
                      data-testid="save-route-attendance-btn"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D6B66D]" />
                      {savingAttendance ? 'Saving...' : `Save ${attShift} Attendance`}
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student &amp; Class</th>
                      <th className="px-5 py-3 font-semibold">Boarding Stop &amp; Area</th>
                      <th className="px-5 py-3 font-semibold">
                        {attShift === 'Morning' ? 'Pickup Time' : 'Drop Time'}
                      </th>
                      <th className="px-5 py-3 font-semibold">Parent Contact</th>
                      <th className="px-5 py-3 font-semibold text-right">
                        {attShift} Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedAttRouteRow.assignedStudents.map((member) => {
                      const primaryStatus: TransportAttendanceStatus =
                        attShift === 'Morning' ? 'Boarded' : 'Dropped';
                      const currentVal = attDraft[member.student.id] || primaryStatus;
                      return (
                        <tr key={member.student.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-[#142B46]">{member.student.name}</p>
                            <p className="text-slate-500">
                              Class {member.student.classSection} · Adm {member.student.admissionNo}
                            </p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-800">
                              {member.allocation.stopName || 'Route Stop'}
                            </p>
                            <p className="text-slate-500">{member.allocation.areaLocality}</p>
                          </td>
                          <td className="px-5 py-3 font-mono font-semibold text-[#142B46] tabular-nums">
                            {attShift === 'Morning'
                              ? member.allocation.pickupTime || '07:20'
                              : member.allocation.dropTime || '14:30'}
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-slate-700">{member.student.guardianName}</p>
                            <p className="font-mono text-slate-500">{member.student.guardianPhone}</p>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={!canMarkAttendance}
                                onClick={() =>
                                  setAttDraft((prev) => ({
                                    ...prev,
                                    [member.student.id]: primaryStatus,
                                  }))
                                }
                                className={`rounded-md px-3 py-1 text-xs font-semibold border transition-colors ${
                                  currentVal === primaryStatus
                                    ? 'bg-[#6E987A] border-[#6E987A] text-white'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {primaryStatus}
                              </button>
                              <button
                                type="button"
                                disabled={!canMarkAttendance}
                                onClick={() =>
                                  setAttDraft((prev) => ({
                                    ...prev,
                                    [member.student.id]: 'Absent',
                                  }))
                                }
                                className={`rounded-md px-3 py-1 text-xs font-semibold border transition-colors ${
                                  currentVal === 'Absent'
                                    ? 'bg-rose-700 border-rose-700 text-white'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedAttRouteRow.assignedStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No students are currently allotted to {selectedAttRouteRow.route.routeCode}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB 3: STUDENT ALLOTMENT (BUS VS WALKER) & FLEET ROUTES ==================== */}
      {subTab === 'allocations' && (
        <div className="space-y-6">
          {/* Mandatory Non-Walker Rule Banner */}
          {routeSegregation.unallottedBusRisk.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {routeSegregation.unallottedBusRisk.length} Non-Walker Student(s) Without Bus
                    Route
                  </p>
                  <p className="mt-0.5">
                    School policy requires every non-walker student to be allotted a verified bus
                    route and driver.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllocFilter('unallotted')}
                className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
              >
                Show Unallotted Students
              </button>
            </div>
          )}

          {/* Student Allotment Roster */}
          <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden">
            <div className="border-b border-[#E5D7C3] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  Student Transport Allotment Roster (Walker vs. Mandatory Bus Route)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Walkers require no bus route. All non-walkers must be allotted an active bus route
                  so parents receive verified driver details &amp; GPS tracking.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="search"
                    value={allocSearch}
                    onChange={(e) => setAllocSearch(e.target.value)}
                    placeholder="Search student, class, area, route..."
                    className="rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs w-56"
                  />
                </div>
                <select
                  aria-label="Filter student transport mode"
                  value={allocFilter}
                  onChange={(e) =>
                    setAllocFilter(e.target.value as 'all' | 'Bus' | 'Walker' | 'unallotted')
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
                >
                  <option value="all">All Students ({data.students.length})</option>
                  <option value="Bus">Bus Riders ({totalBusRiders})</option>
                  <option value="Walker">Walkers ({routeSegregation.walkers.length})</option>
                  <option value="unallotted">
                    Unallotted ({routeSegregation.unallottedBusRisk.length})
                  </option>
                </select>
              </div>
            </div>

            {/* Inline Editor Panel when a student is chosen */}
            {editingStudentId && (
              <form
                onSubmit={handleSaveAllocation}
                className="border-b border-[#D6B66D] bg-[#FAF4EC] px-6 py-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#142B46]">
                    Update Transport Allotment:{' '}
                    {data.students.find((s) => s.id === editingStudentId)?.name} (
                    {data.students.find((s) => s.id === editingStudentId)?.classSection})
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingStudentId(null)}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <label className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-700">
                      Transport Mode *
                    </span>
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value as 'Bus' | 'Walker')}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Bus">School Bus (Route Mandatory)</option>
                      <option value="Walker">Walker / Self-Drop (No Bus Needed)</option>
                    </select>
                  </label>

                  {editMode === 'Bus' && (
                    <>
                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          Allotted Bus Route *
                        </span>
                        <select
                          value={editRouteId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setEditRouteId(nextId);
                            const rt = routeById[nextId];
                            const firstStop =
                              rt?.stops.find((s) => s.area !== 'School Campus') || rt?.stops[0];
                            setEditStopId(firstStop?.id || '');
                            if (firstStop?.area) setEditAreaLocality(firstStop.area);
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                        >
                          <option value="">-- Select Active Bus Route --</option>
                          {liveRoutes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.routeCode} · {r.routeName} ({r.busNumber})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          Boarding Stop
                        </span>
                        <select
                          value={editStopId}
                          onChange={(e) => {
                            setEditStopId(e.target.value);
                            const stp = selectedEditRoute?.stops.find((s) => s.id === e.target.value);
                            if (stp?.area && stp.area !== 'School Campus') {
                              setEditAreaLocality(stp.area);
                            }
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                        >
                          {(selectedEditRoute?.stops || [])
                            .filter((s) => s.area !== 'School Campus')
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.morningPickupTime})
                              </option>
                            ))}
                        </select>
                      </label>
                    </>
                  )}

                  <label className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-700">
                      Area / Locality
                    </span>
                    <input
                      type="text"
                      value={editAreaLocality}
                      onChange={(e) => setEditAreaLocality(e.target.value)}
                      placeholder="e.g. Model Town, Sector 6"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-[11px] font-semibold text-slate-700">
                      Remarks / Pickup Note
                    </span>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Optional parent note"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                  </label>
                </div>

                {editMode === 'Bus' && selectedEditRoute && (
                  <p className="text-[11px] text-[#142B46]">
                    <strong>Driver Shown to Parents:</strong> {selectedEditRoute.driverName} ·{' '}
                    <span className="font-mono">{selectedEditRoute.driverPhone}</span> · Lic:{' '}
                    <span className="font-mono">{selectedEditRoute.driverLicenseNo}</span> ·{' '}
                    {selectedEditRoute.gpsEnabled ? 'GPS Live Enabled' : 'No GPS Hardware'}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudentId(null)}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAlloc}
                    className="rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                  >
                    {savingAlloc ? 'Saving...' : 'Save Allotment'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Mode</th>
                    <th className="px-5 py-3 font-semibold">Allotted Route &amp; Stop</th>
                    <th className="px-5 py-3 font-semibold">Area / Locality</th>
                    <th className="px-5 py-3 font-semibold">Assigned Driver</th>
                    {canAllocate && <th className="px-5 py-3 font-semibold text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllocStudents.slice(0, 60).map((student) => {
                    const alloc = allocByStudentId[student.id];
                    const route = alloc?.routeId ? routeById[alloc.routeId] : undefined;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#142B46]">{student.name}</p>
                          <p className="text-slate-500">
                            Class {student.classSection} · {student.guardianPhone}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          {alloc?.mode === 'Walker' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#F0F6F2] border border-[#C6DCCC] px-2 py-0.5 text-[11px] font-semibold text-[#2D5139]">
                              <Footprints className="h-3 w-3" />
                              Walker
                            </span>
                          ) : route ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#142B46] px-2 py-0.5 text-[11px] font-semibold text-white">
                              <Bus className="h-3 w-3 text-[#D6B66D]" />
                              Bus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                              Unallotted
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {alloc?.mode === 'Walker' ? (
                            <span className="text-slate-500">Self-Drop / Walkable</span>
                          ) : route ? (
                            <div>
                              <p className="font-semibold text-[#142B46]">
                                {route.routeCode} · {route.busNumber}
                              </p>
                              <p className="text-slate-500">
                                {alloc?.stopName} ({alloc?.pickupTime || '07:20'})
                              </p>
                            </div>
                          ) : (
                            <span className="text-rose-700 font-semibold">Route Allotment Needed</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {alloc?.areaLocality || student.address || '—'}
                        </td>
                        <td className="px-5 py-3">
                          {route ? (
                            <div>
                              <p className="font-medium text-[#142B46]">{route.driverName}</p>
                              <p className="font-mono text-slate-500">{route.driverPhone}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        {canAllocate && (
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => openStudentAllocator(student)}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                            >
                              Change / Allot
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bus Route & Driver Master Directory */}
          <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden">
            <div className="border-b border-[#E5D7C3] px-6 py-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  Fleet Routes, Drivers &amp; GPS Hardware Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure route corridors, covered localities, driver credentials, and GPS
                  transponder availability.
                </p>
              </div>
              {canManageRoutes && (
                <button
                  type="button"
                  onClick={openNewRouteModal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />
                  New Route
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Route &amp; Bus</th>
                    <th className="px-5 py-3 font-semibold">Driver &amp; License</th>
                    <th className="px-5 py-3 font-semibold">Attendant</th>
                    <th className="px-5 py-3 font-semibold">Areas Covered</th>
                    <th className="px-5 py-3 font-semibold">GPS</th>
                    <th className="px-5 py-3 font-semibold text-right">Fee / Mo</th>
                    {canManageRoutes && <th className="px-5 py-3 font-semibold text-right">Edit</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <p className="font-bold text-[#142B46]">
                          {route.routeCode} · {route.routeName}
                        </p>
                        <p className="font-mono text-slate-500">
                          {route.busNumber} · Cap {route.capacity}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[#142B46]">{route.driverName}</p>
                        <p className="font-mono text-slate-500">
                          {route.driverPhone} · {route.driverLicenseNo}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-slate-700">{route.attendantName}</p>
                        <p className="font-mono text-slate-500">{route.attendantPhone}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-xs">
                        {route.areasCovered.join(', ')}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            route.gpsEnabled
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {route.gpsEnabled ? 'GPS Live' : 'No GPS'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-[#142B46]">
                        ₹{route.monthlyFeeInr}
                      </td>
                      {canManageRoutes && (
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEditRouteModal(route)}
                            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: ROUTE-WISE & AREA-WISE SEGREGATION REPORTS ==================== */}
      {subTab === 'reports' && (
        <div className="space-y-6">
          {/* REPORT A: ROUTE-WISE STUDENT SEGREGATION */}
          <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden">
            <div className="border-b border-[#E5D7C3] bg-[#FAF4EC] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  Route-Wise Student Segregation &amp; Seat Utilization Report
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Evaluate bus load balance, vacant seats, morning/evening boarding counts, and
                  expand any route to inspect its student manifest.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerCsvDownload(
                    `${data.activeSchool.code.toLowerCase()}-route-wise-segregation.csv`,
                    [
                      'Route Code',
                      'Route Name',
                      'Bus Number',
                      'Driver',
                      'Driver Phone',
                      'GPS Equipped',
                      'Capacity',
                      'Allotted Students',
                      'Vacant Seats',
                      'Utilization %',
                      'Morning Boarded',
                      'Evening Dropped',
                      'Student Manifest',
                    ],
                    routeSegregation.routeRows.map((row) => [
                      row.route.routeCode,
                      row.route.routeName,
                      row.route.busNumber,
                      row.route.driverName,
                      row.route.driverPhone,
                      row.route.gpsEnabled ? 'Yes' : 'No',
                      row.route.capacity,
                      row.assignedCount,
                      row.vacantSeats,
                      `${row.utilizationPct}%`,
                      row.morningBoardedCount,
                      row.eveningDroppedCount,
                      row.assignedStudents
                        .map((m) => `${m.student.name} (${m.student.classSection} - ${m.allocation.stopName || ''})`)
                        .join('; '),
                    ]),
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3.5 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#142B46] hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export Route-Wise CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Route &amp; Bus</th>
                    <th className="px-5 py-3 font-semibold">Driver</th>
                    <th className="px-5 py-3 font-semibold text-right">Allotted / Cap</th>
                    <th className="px-5 py-3 font-semibold">Utilization</th>
                    <th className="px-5 py-3 font-semibold text-right">Vacant</th>
                    <th className="px-5 py-3 font-semibold text-right">Today AM / PM</th>
                    <th className="px-5 py-3 font-semibold text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routeSegregation.routeRows.map((row) => {
                    const expanded = expandedRouteReportId === row.route.id;
                    return (
                      <React.Fragment key={row.route.id}>
                        <tr className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#142B46]">
                              {row.route.routeCode} · {row.route.routeName}
                            </p>
                            <p className="font-mono text-slate-500">
                              {row.route.busNumber} · {row.route.gpsEnabled ? 'GPS Live' : 'No GPS'}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800">{row.route.driverName}</p>
                            <p className="font-mono text-slate-500">{row.route.driverPhone}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-[#142B46] tabular-nums">
                            {row.assignedCount} / {row.route.capacity}
                          </td>
                          <td className="px-5 py-3.5 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.isOverloaded
                                      ? 'bg-rose-600'
                                      : row.utilizationPct >= 80
                                        ? 'bg-amber-600'
                                        : 'bg-[#6E987A]'
                                  }`}
                                  style={{ width: `${Math.min(100, row.utilizationPct)}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold tabular-nums">
                                {row.utilizationPct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums">
                            {row.isOverloaded ? (
                              <span className="text-rose-700 font-bold">Overloaded</span>
                            ) : (
                              <span className="text-[#3D6349]">{row.vacantSeats}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700">
                            {row.morningBoardedCount} / {row.eveningDroppedCount}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRouteReportId(expanded ? null : row.route.id)
                              }
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                            >
                              {expanded ? 'Hide List' : `View (${row.assignedCount})`}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-[#FAF4EC]/60">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {row.assignedStudents.map((m) => (
                                  <div
                                    key={m.student.id}
                                    className="rounded-lg border border-[#E5D7C3] bg-white px-3 py-2 flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-semibold text-[#142B46] truncate">
                                        {m.student.name} ({m.student.classSection})
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate">
                                        {m.allocation.stopName} · {m.allocation.areaLocality}
                                      </p>
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-slate-600 shrink-0">
                                      {m.allocation.pickupTime}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* REPORT B: AREA / LOCALITY-WISE STUDENT SEGREGATION */}
          <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden">
            <div className="border-b border-[#E5D7C3] bg-[#FAF4EC] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#142B46]">
                  Area / Locality-Wise Student Segregation &amp; Route Planning Insights
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Group students by residential area/sector to eliminate overlapping routes, spot
                  consolidation opportunities, and design high-efficiency corridors.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerCsvDownload(
                    `${data.activeSchool.code.toLowerCase()}-area-wise-segregation.csv`,
                    [
                      'Area / Locality',
                      'Total Students',
                      'Bus Riders',
                      'Walkers',
                      'Unallotted Risk',
                      'Serving Routes',
                      'Optimization Tip',
                    ],
                    areaSegregation.map((row) => [
                      row.areaName,
                      row.totalStudents,
                      row.busStudents,
                      row.walkerStudents,
                      row.unallottedBusStudents,
                      row.routesServing.join(' | ') || 'None',
                      row.optimizationTip,
                    ]),
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3.5 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#142B46] hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export Area-Wise CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Area / Locality</th>
                    <th className="px-5 py-3 font-semibold text-right">Total</th>
                    <th className="px-5 py-3 font-semibold text-right">Bus Riders</th>
                    <th className="px-5 py-3 font-semibold text-right">Walkers</th>
                    <th className="px-5 py-3 font-semibold">Serving Routes</th>
                    <th className="px-5 py-3 font-semibold">Route Effectiveness Recommendation</th>
                    <th className="px-5 py-3 font-semibold text-right">Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {areaSegregation.map((row) => {
                    const expanded = expandedAreaReportName === row.areaName;
                    return (
                      <React.Fragment key={row.areaName}>
                        <tr className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5 font-bold text-[#142B46]">{row.areaName}</td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums">
                            {row.totalStudents}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-[#142B46] tabular-nums">
                            {row.busStudents}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-[#3D6349] tabular-nums">
                            {row.walkerStudents}
                          </td>
                          <td className="px-5 py-3.5">
                            {row.routesServing.length > 0 ? (
                              <span className="font-mono font-semibold text-[#142B46]">
                                {row.routesServing.join(', ')}
                              </span>
                            ) : (
                              <span className="text-slate-500">Walkable / None</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 max-w-md">
                            {row.optimizationTip}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAreaReportName(expanded ? null : row.areaName)
                              }
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC]"
                            >
                              {expanded ? 'Hide' : `Students (${row.totalStudents})`}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-[#FAF4EC]/60">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {row.students.map((st) => (
                                  <div
                                    key={st.studentId}
                                    className="rounded-lg border border-[#E5D7C3] bg-white px-3 py-2 flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-semibold text-[#142B46] truncate">
                                        {st.studentName} ({st.classSection})
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate">
                                        {st.mode === 'Walker'
                                          ? 'Verified Walker'
                                          : `${st.routeCode || 'Unallotted'} · ${st.stopName || ''}`}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                                        st.mode === 'Walker'
                                          ? 'bg-[#F0F6F2] text-[#2D5139]'
                                          : 'bg-[#142B46] text-white'
                                      }`}
                                    >
                                      {st.mode}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT BUS ROUTE MODAL ==================== */}
      {routeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="route-modal-title"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-[#142B46] text-[#F3E6D8] px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6B66D]">
                  Fleet Configuration
                </p>
                <h3 id="route-modal-title" className="font-display text-lg font-bold text-white">
                  {routeDraftId ? `Edit Bus Route ${routeCode}` : 'Add New School Bus Route'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRouteModalOpen(false)}
                aria-label="Close bus route modal"
                className="rounded-lg p-1.5 text-[#A9C5D8] hover:bg-[#1E3B5C] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">Route Code *</span>
                  <input
                    type="text"
                    required
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    placeholder="e.g. R-06"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="block text-xs font-semibold text-slate-700">Route Name *</span>
                  <input
                    type="text"
                    required
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. Bahadurgarh – Sector 9 Express"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">Bus Number *</span>
                  <input
                    type="text"
                    required
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="HR-14-S-2046"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">Seat Capacity</span>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Monthly Bus Fee (₹)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={monthlyFeeInr}
                    onChange={(e) => setMonthlyFeeInr(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">Driver Name *</span>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">Driver Phone *</span>
                  <input
                    type="tel"
                    required
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Driver License No.
                  </span>
                  <input
                    type="text"
                    value={driverLicenseNo}
                    onChange={(e) => setDriverLicenseNo(e.target.value)}
                    placeholder="HR14-201700..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Experience (Years)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={45}
                    value={driverExperienceYears}
                    onChange={(e) => setDriverExperienceYears(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Bus Attendant Name
                  </span>
                  <input
                    type="text"
                    value={attendantName}
                    onChange={(e) => setAttendantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-semibold text-slate-700">
                    Attendant Phone
                  </span>
                  <input
                    type="tel"
                    value={attendantPhone}
                    onChange={(e) => setAttendantPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="block text-xs font-semibold text-slate-700">
                  Areas / Localities Covered (comma-separated — used for Admission Enquiry Route
                  Recommendations)
                </span>
                <input
                  type="text"
                  value={areasCoveredText}
                  onChange={(e) => setAreasCoveredText(e.target.value)}
                  placeholder="Sector 6, Bahadurgarh Road, Chhara Road, HUDA Colony"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </label>

              <label className="flex items-center gap-2.5 rounded-lg border border-[#D9C9B6] bg-[#FAF4EC] px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gpsEnabled}
                  onChange={(e) => setGpsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-xs font-semibold text-[#142B46]">
                  Bus is equipped with live GPS tracking hardware (visible to Principal, Transport
                  Incharge, Coordinators, Teachers &amp; allotted Parents)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRoute}
                  className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                >
                  {savingRoute ? 'Saving...' : routeDraftId ? 'Save Route Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
