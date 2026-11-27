import type { Express, Request, Response, NextFunction } from 'express';
import type {
  BusRoute,
  BusRouteStop,
  StudentTransportAllocation,
  TransportAttendanceShift,
  TransportAttendanceStatus,
  TransportDailyAttendanceRecord,
  UserAccount,
  UserRole,
} from '../src/types';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  advanceBusGpsStep,
  buildTransportRoleBundle,
  createInitialBusRoutesForSchool,
  deriveInitialStudentAllocations,
  getSchoolGeoAnchor,
  optimizeBusRouteForAdmission,
} from '../src/utils/transportEngine.ts';
import { hasGoogleMapsAccess } from '../src/utils/subscriptionEntitlements.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface TransportRouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (roles: UserRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (entry: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

export function ensureSchoolTransportInitialized(
  db: DatabaseState,
  schoolId: string,
): {
  routes: BusRoute[];
  allocations: StudentTransportAllocation[];
  attendanceToday: TransportDailyAttendanceRecord[];
} {
  if (!Array.isArray(db.busRoutes)) db.busRoutes = [];
  if (!Array.isArray(db.studentTransportAllocations)) db.studentTransportAllocations = [];
  if (!Array.isArray(db.transportAttendance)) db.transportAttendance = [];

  let schoolRoutes = db.busRoutes.filter((r) => r.schoolId === schoolId);
  if (schoolRoutes.length === 0) {
    schoolRoutes = createInitialBusRoutesForSchool(schoolId);
    db.busRoutes.push(...schoolRoutes);
  }

  let schoolAllocs = db.studentTransportAllocations.filter((a) => a.schoolId === schoolId);
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);

  // Rebalance legacy baseline-seeded schools where routes were over-packed above seat capacity
  const routeCountMap: Record<string, number> = {};
  for (const a of schoolAllocs) {
    if (a.mode === 'Bus' && a.routeId) {
      routeCountMap[a.routeId] = (routeCountMap[a.routeId] || 0) + 1;
    }
  }
  const hasOverpackedBaseline = schoolRoutes.some(
    (r) => (routeCountMap[r.id] || 0) > r.capacity,
  );
  const allBaselineOnly =
    schoolAllocs.length > 0 &&
    schoolAllocs.every((a) => a.assignedBy === 'Transport Office Baseline');

  if (hasOverpackedBaseline && allBaselineOnly) {
    db.studentTransportAllocations = db.studentTransportAllocations.filter(
      (a) => a.schoolId !== schoolId,
    );
    const rebalanced = deriveInitialStudentAllocations(schoolStudents, schoolRoutes, schoolId);
    db.studentTransportAllocations.push(...rebalanced);
    schoolAllocs = rebalanced;
    saveDb();
  } else {
    const existingAllocStudentIds = new Set(schoolAllocs.map((a) => a.studentId));
    const missingStudents = schoolStudents.filter((s) => !existingAllocStudentIds.has(s.id));

    if (missingStudents.length > 0) {
      const generated = deriveInitialStudentAllocations(missingStudents, schoolRoutes, schoolId);
      db.studentTransportAllocations.push(...generated);
      schoolAllocs = db.studentTransportAllocations.filter((a) => a.schoolId === schoolId);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const attendanceToday = db.transportAttendance.filter(
    (att) => att.schoolId === schoolId && att.date === today,
  );

  return { routes: schoolRoutes, allocations: schoolAllocs, attendanceToday };
}

export function registerTransportRoutes(app: Express, deps: TransportRouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Public or authenticated Geospatial + Capacity Route Efficiency Optimizer for new admissions
  app.post('/api/transport/recommend-route', (req: Request, res: Response) => {
    const { schoolId, locality, address, lat, lng } = (req.body || {}) as {
      schoolId?: string;
      locality?: string;
      address?: string;
      lat?: number | string;
      lng?: number | string;
    };
    const db = getDb();
    const targetSchoolId = schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const { routes, allocations } = ensureSchoolTransportInitialized(db, targetSchoolId);

    const parsedLat = lat !== undefined && lat !== '' ? Number(lat) : Number.NaN;
    const parsedLng = lng !== undefined && lng !== '' ? Number(lng) : Number.NaN;
    const residentialGeo =
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
        ? { lat: parsedLat, lng: parsedLng }
        : null;

    const optimization = optimizeBusRouteForAdmission({
      residentialGeo,
      locality,
      address,
      routes,
      allocations,
      schoolLocation: getSchoolGeoAnchor(targetSchoolId),
    });

    res.json({
      recommendation: optimization.bestRoute,
      optimization,
    });
  });

  // Server-side Geocoding Proxy (Google Maps Platform Geocoding REST API — avoids browser CORS)
  // Protected by authentication + tenant scoping to prevent anonymous Maps billing abuse.
  // Falls back cleanly to matching the school's own operational route stops if no key or offline.
  app.post(
    '/api/transport/geocode-address',
    requireAuth,
    async (req: AuthedRequest, res: Response) => {
    const { address, locality, schoolId } = (req.body || {}) as {
      address?: string;
      locality?: string;
      schoolId?: string;
    };
    const db = getDb();
    const targetSchoolId =
      req.user?.role === 'super_admin' || req.user?.role === 'counsellor'
        ? schoolId || req.activeSchoolId || db.schools[0]?.id || 'school-vis-jjr'
        : req.activeSchoolId || db.schools[0]?.id || 'school-vis-jjr';
    const school = db.schools.find((s) => s.id === targetSchoolId) || db.schools[0];
    const query = [address, locality, school?.city, school?.state, 'India']
      .map((s) => (s || '').trim())
      .filter(Boolean)
      .join(', ');

    if (!address?.trim() && !locality?.trim()) {
      res.status(400).json({ error: 'Enter a residential address or locality to locate.' });
      return;
    }

    if (!hasGoogleMapsAccess(school)) {
      res.status(403).json({
        error: `Google Maps address geocoding is available exclusively on Premium Campus and Enterprise 360° packages. Your school is currently on ${school?.subscriptionPlan || 'Growth ERP'}.`,
        premiumRequired: true,
        currentPlan: school?.subscriptionPlan || 'Growth ERP',
        upgradeTargetPlan: 'Premium Campus',
      });
      return;
    }

    const mapsApiKey =
      process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (mapsApiKey) {
      try {
        // Replacement for deprecated google.maps.Geocoder JS class: server-side Geocoding REST API
        // Doc: https://developers.google.com/maps/documentation/geocoding/requests-geocoding?utm_campaign=gmp_mcp_codeassist_v1_aistudio
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query,
        )}&region=in&language=en&key=${encodeURIComponent(mapsApiKey)}`;
        const apiRes = await fetch(url);
        if (apiRes.status === 429) {
          res.status(429).json({
            error: 'Google Maps Geocoding quota reached.',
            quotaExceeded: true,
          });
          return;
        }
        const payload = (await apiRes.json()) as {
          status?: string;
          error_message?: string;
          results?: Array<{
            formatted_address?: string;
            geometry?: { location?: { lat?: number; lng?: number } };
          }>;
        };

        if (payload.status === 'OVER_QUERY_LIMIT' || payload.status === 'OVER_DAILY_LIMIT') {
          res.status(429).json({
            error: payload.error_message || 'Google Maps Geocoding quota reached.',
            quotaExceeded: true,
          });
          return;
        }

        const first = payload.results?.[0];
        const loc = first?.geometry?.location;
        if (
          payload.status === 'OK' &&
          loc &&
          Number.isFinite(loc.lat) &&
          Number.isFinite(loc.lng)
        ) {
          res.json({
            lat: Number(loc.lat!.toFixed(6)),
            lng: Number(loc.lng!.toFixed(6)),
            formattedAddress: first?.formatted_address || query,
            source: 'google_geocoding_api',
          });
          return;
        }
      } catch {
        // Fall through to school operational stop matcher if external API is unreachable
      }
    }

    // Operational fallback: match against the school's own configured bus route stops
    const { routes } = ensureSchoolTransportInitialized(db, targetSchoolId);
    const needle = `${locality || ''} ${address || ''}`.toLowerCase();
    for (const route of routes) {
      for (const stop of route.stops) {
        if (stop.area.toLowerCase() === 'school campus') continue;
        if (
          needle.includes(stop.area.toLowerCase()) ||
          needle.includes(stop.name.toLowerCase())
        ) {
          res.json({
            lat: stop.lat,
            lng: stop.lng,
            formattedAddress: `${stop.name}, ${stop.area} (School Corridor Reference)`,
            source: 'school_corridor_reference',
          });
          return;
        }
      }
    }

    res.status(404).json({
      error:
        'Could not automatically locate that address. Click directly on the map to drop the student’s home pin, or enter latitude & longitude.',
    });
  });

  // Role-scoped Live GPS telemetry polling endpoint
  app.get('/api/transport/live-gps', requireAuth, (req: AuthedRequest, res: Response) => {
    const db = getDb();
    const schoolId = req.activeSchoolId!;
    const user = req.user!;
    const { routes, allocations, attendanceToday } = ensureSchoolTransportInitialized(db, schoolId);

    const visibleStudentIds = new Set<string>(
      user.role === 'parent' || user.role === 'student'
        ? user.linkedStudentIds || []
        : db.students.filter((s) => s.schoolId === schoolId).map((s) => s.id),
    );

    const bundle = buildTransportRoleBundle({
      role: user.role,
      schoolId,
      routes,
      allocations,
      attendanceToday,
      visibleStudentIds,
    });

    const school = db.schools.find((s) => s.id === schoolId);
    const googleMapsEnabled = hasGoogleMapsAccess(school);

    res.json({
      gpsScope: bundle.gpsScope,
      schoolLocation: bundle.schoolLocation,
      googleMapsEnabled,
      subscriptionPlan: school?.subscriptionPlan || 'Growth ERP',
      routes: bundle.routes,
      timestamp: new Date().toISOString(),
    });
  });

  // Create or update a bus route & driver configuration
  app.post(
    '/api/transport/routes',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'transport_incharge']),
    (req: AuthedRequest, res: Response) => {
      const body = (req.body || {}) as Partial<BusRoute> & {
        areasCoveredText?: string;
      };
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureSchoolTransportInitialized(db, schoolId);

      const routeCode = String(body.routeCode || '').trim().toUpperCase();
      const routeName = String(body.routeName || '').trim();
      const busNumber = String(body.busNumber || '').trim().toUpperCase();
      const driverName = String(body.driverName || '').trim();
      const driverPhone = String(body.driverPhone || '').trim();

      if (!routeCode || !routeName || !busNumber || !driverName || !driverPhone) {
        res.status(400).json({
          error: 'Route code, route name, bus number, driver name, and driver phone are required.',
        });
        return;
      }

      const areasCovered = Array.isArray(body.areasCovered)
        ? body.areasCovered.map((a) => String(a).trim()).filter(Boolean)
        : typeof body.areasCoveredText === 'string'
          ? body.areasCoveredText
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : [];

      const existing = body.id
        ? (db.busRoutes || []).find((r) => r.id === body.id && r.schoolId === schoolId)
        : undefined;

      const nowIso = new Date().toISOString();
      const gpsEnabled = body.gpsEnabled !== undefined ? Boolean(body.gpsEnabled) : true;

      if (existing) {
        existing.routeCode = routeCode;
        existing.routeName = routeName;
        existing.busNumber = busNumber;
        existing.capacity = Math.max(10, Math.min(80, Math.round(Number(body.capacity) || existing.capacity)));
        existing.driverName = driverName;
        existing.driverPhone = driverPhone;
        existing.driverLicenseNo = String(body.driverLicenseNo || existing.driverLicenseNo).trim();
        existing.driverExperienceYears = Math.max(0, Math.round(Number(body.driverExperienceYears) || existing.driverExperienceYears));
        existing.attendantName = String(body.attendantName || existing.attendantName).trim();
        existing.attendantPhone = String(body.attendantPhone || existing.attendantPhone).trim();
        existing.gpsEnabled = gpsEnabled;
        existing.gpsDeviceId = gpsEnabled ? String(body.gpsDeviceId || existing.gpsDeviceId || `GPS-${routeCode}`).trim() : undefined;
        existing.gpsStatus = gpsEnabled ? (existing.gpsStatus === 'No GPS' ? 'Live' : existing.gpsStatus) : 'No GPS';
        existing.monthlyFeeInr = Math.max(0, Math.round(Number(body.monthlyFeeInr ?? existing.monthlyFeeInr)));
        if (areasCovered.length > 0) existing.areasCovered = areasCovered;
        if (Array.isArray(body.stops) && body.stops.length > 0) {
          existing.stops = body.stops as BusRouteStop[];
        }
        existing.lastGpsPingAt = nowIso;

        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'UPDATED_BUS_ROUTE',
          entityType: 'BusRoute',
          entityId: existing.id,
          detail: `Updated route ${existing.routeCode} (${existing.routeName}, Bus ${existing.busNumber}, Driver ${existing.driverName}, GPS ${existing.gpsEnabled ? 'Enabled' : 'Disabled'}).`,
        });
        saveDb();
        res.json({ route: existing });
        return;
      }

      const schoolRoutes = (db.busRoutes || []).filter((r) => r.schoolId === schoolId);
      const baseLat = schoolRoutes[0]?.stops[schoolRoutes[0].stops.length - 1]?.lat ?? 28.6063;
      const baseLng = schoolRoutes[0]?.stops[schoolRoutes[0].stops.length - 1]?.lng ?? 76.6565;
      const offsetAngle = (schoolRoutes.length + 1) * 1.1;
      const startLat = Number((baseLat + Math.sin(offsetAngle) * 0.022).toFixed(5));
      const startLng = Number((baseLng + Math.cos(offsetAngle) * 0.028).toFixed(5));
      const midLat = Number(((baseLat + startLat) / 2).toFixed(5));
      const midLng = Number(((baseLng + startLng) / 2).toFixed(5));

      const defaultStops: BusRouteStop[] =
        Array.isArray(body.stops) && body.stops.length > 0
          ? (body.stops as BusRouteStop[])
          : [
              {
                id: `stop-${Date.now()}-1`,
                name: `${areasCovered[0] || routeName} Pickup Point`,
                area: areasCovered[0] || routeName,
                lat: startLat,
                lng: startLng,
                morningPickupTime: '07:10',
                eveningDropTime: '14:40',
                sequence: 1,
              },
              {
                id: `stop-${Date.now()}-2`,
                name: `${areasCovered[1] || 'Mid Corridor'} Junction`,
                area: areasCovered[1] || areasCovered[0] || routeName,
                lat: midLat,
                lng: midLng,
                morningPickupTime: '07:25',
                eveningDropTime: '14:25',
                sequence: 2,
              },
              {
                id: `stop-${Date.now()}-3`,
                name: 'Main School Campus Gate',
                area: 'School Campus',
                lat: baseLat,
                lng: baseLng,
                morningPickupTime: '07:45',
                eveningDropTime: '14:10',
                sequence: 3,
              },
            ];

      const palette = ['#142B46', '#6E987A', '#9A7422', '#3B6E8C', '#7C4D8B', '#B85C38'];
      const created: BusRoute = {
        id: `rt-${schoolId}-${Date.now()}`,
        schoolId,
        routeCode,
        routeName,
        busNumber,
        capacity: Math.max(10, Math.min(80, Math.round(Number(body.capacity) || 40))),
        driverName,
        driverPhone,
        driverLicenseNo: String(body.driverLicenseNo || 'HR14-PENDING').trim(),
        driverExperienceYears: Math.max(0, Math.round(Number(body.driverExperienceYears) || 5)),
        attendantName: String(body.attendantName || 'School Bus Attendant').trim(),
        attendantPhone: String(body.attendantPhone || driverPhone).trim(),
        gpsEnabled,
        gpsDeviceId: gpsEnabled ? String(body.gpsDeviceId || `GPS-${routeCode}`).trim() : undefined,
        gpsStatus: gpsEnabled ? 'Live' : 'No GPS',
        currentLat: defaultStops[0].lat,
        currentLng: defaultStops[0].lng,
        currentSpeedKmph: gpsEnabled ? 25 : 0,
        headingDeg: 180,
        currentStopIndex: 0,
        activeShift: gpsEnabled ? 'Morning' : 'Idle',
        lastGpsPingAt: nowIso,
        monthlyFeeInr: Math.max(0, Math.round(Number(body.monthlyFeeInr) || 1050)),
        areasCovered: areasCovered.length > 0 ? areasCovered : [routeName],
        stops: defaultStops,
        routeColor: palette[schoolRoutes.length % palette.length],
        active: true,
      };

      db.busRoutes!.push(created);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CREATED_BUS_ROUTE',
        entityType: 'BusRoute',
        entityId: created.id,
        detail: `Created bus route ${created.routeCode} (${created.routeName}, Bus ${created.busNumber}, Driver ${created.driverName}).`,
      });
      saveDb();
      res.status(201).json({ route: created });
    },
  );

  // Allocate a student to Walker OR a mandatory Bus Route + Stop
  app.put(
    '/api/transport/allocations/:studentId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'transport_incharge', 'coordinator']),
    (req: AuthedRequest, res: Response) => {
      const { studentId } = req.params;
      const { mode, routeId, stopId, areaLocality, notes } = (req.body || {}) as {
        mode?: 'Bus' | 'Walker';
        routeId?: string;
        stopId?: string;
        areaLocality?: string;
        notes?: string;
      };

      if (mode !== 'Bus' && mode !== 'Walker') {
        res.status(400).json({ error: 'Transport mode must be either "Bus" or "Walker".' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const { routes } = ensureSchoolTransportInitialized(db, schoolId);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      let chosenRoute: BusRoute | undefined;
      let chosenStop: BusRouteStop | undefined;
      if (mode === 'Bus') {
        if (!routeId) {
          res.status(400).json({
            error: 'Non-walker students must be allotted an active bus route.',
          });
          return;
        }
        chosenRoute = routes.find((r) => r.id === routeId && r.active);
        if (!chosenRoute) {
          res.status(404).json({ error: 'Selected bus route not found in active school.' });
          return;
        }
        chosenStop =
          (stopId ? chosenRoute.stops.find((s) => s.id === stopId) : undefined) ||
          chosenRoute.stops.find((s) => s.area !== 'School Campus') ||
          chosenRoute.stops[0];
      }

      const nowIso = new Date().toISOString();
      const updated: StudentTransportAllocation = {
        studentId,
        schoolId,
        mode,
        routeId: mode === 'Bus' ? chosenRoute?.id : undefined,
        stopId: mode === 'Bus' ? chosenStop?.id : undefined,
        stopName: mode === 'Bus' ? chosenStop?.name : undefined,
        areaLocality:
          (areaLocality || '').trim() ||
          (mode === 'Bus' ? chosenStop?.area || chosenRoute?.areasCovered[0] : 'Campus Enclave (Walkable)') ||
          'Jhajjar',
        pickupTime: mode === 'Bus' ? chosenStop?.morningPickupTime : undefined,
        dropTime: mode === 'Bus' ? chosenStop?.eveningDropTime : undefined,
        assignedBy: req.user!.name,
        assignedAt: nowIso,
        notes: notes?.trim() || undefined,
      };

      const existingIdx = (db.studentTransportAllocations || []).findIndex(
        (a) => a.studentId === studentId && a.schoolId === schoolId,
      );
      if (existingIdx >= 0) {
        db.studentTransportAllocations![existingIdx] = updated;
      } else {
        db.studentTransportAllocations!.push(updated);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_STUDENT_TRANSPORT',
        entityType: 'StudentTransportAllocation',
        entityId: studentId,
        detail:
          mode === 'Walker'
            ? `Marked ${student.name} (${student.classSection}) as Walker / Self-Drop (${updated.areaLocality}).`
            : `Allotted ${student.name} (${student.classSection}) to ${chosenRoute!.routeCode} (${chosenRoute!.routeName}) at ${chosenStop?.name || 'assigned stop'}.`,
      });

      saveDb();
      res.json({ allocation: updated });
    },
  );

  // Mark Daily Morning / Evening Route Attendance
  app.post(
    '/api/transport/attendance/batch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'transport_incharge', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const { date, shift, routeId, entries } = (req.body || {}) as {
        date?: string;
        shift?: TransportAttendanceShift;
        routeId?: string;
        entries?: Array<{
          studentId: string;
          status: TransportAttendanceStatus;
          boardingStopName?: string;
        }>;
      };

      const cleanDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
      if (shift !== 'Morning' && shift !== 'Evening') {
        res.status(400).json({ error: 'Shift must be either Morning or Evening.' });
        return;
      }
      if (!routeId || !Array.isArray(entries) || entries.length === 0) {
        res.status(400).json({ error: 'Provide routeId and at least one student attendance entry.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const { routes } = ensureSchoolTransportInitialized(db, schoolId);
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        res.status(404).json({ error: 'Bus route not found in active school.' });
        return;
      }

      const nowIso = new Date().toISOString();
      const savedRecords: TransportDailyAttendanceRecord[] = [];

      for (const item of entries) {
        if (!item?.studentId || !['Boarded', 'Dropped', 'Absent', 'Walker'].includes(item.status)) {
          continue;
        }
        const recId = `tatt-${schoolId}-${cleanDate}-${shift.toLowerCase()}-${item.studentId}`;
        const rec: TransportDailyAttendanceRecord = {
          id: recId,
          schoolId,
          date: cleanDate,
          shift,
          routeId,
          studentId: item.studentId,
          status: item.status,
          boardingStopName: item.boardingStopName,
          markedAt: nowIso,
          markedBy: req.user!.name,
        };
        const idx = db.transportAttendance!.findIndex((r) => r.id === recId);
        if (idx >= 0) {
          db.transportAttendance![idx] = rec;
        } else {
          db.transportAttendance!.unshift(rec);
        }
        savedRecords.push(rec);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'MARKED_TRANSPORT_ATTENDANCE',
        entityType: 'TransportDailyAttendance',
        entityId: `${route.routeCode}-${cleanDate}-${shift}`,
        detail: `Marked ${shift} transport attendance for ${route.routeCode} (${route.routeName}) on ${cleanDate} across ${savedRecords.length} students.`,
      });

      saveDb();
      res.status(201).json({
        date: cleanDate,
        shift,
        routeId,
        count: savedRecords.length,
        records: savedRecords,
      });
    },
  );

  // Live GPS ping (hardware GPS update OR fleet step simulation)
  app.post(
    '/api/transport/gps/ping',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'transport_incharge', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const { routeId, lat, lng, speedKmph, headingDeg, shift, simulateStep } = (req.body || {}) as {
        routeId?: string;
        lat?: number;
        lng?: number;
        speedKmph?: number;
        headingDeg?: number;
        shift?: 'Morning' | 'Evening' | 'Idle';
        simulateStep?: boolean;
      };

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const { routes } = ensureSchoolTransportInitialized(db, schoolId);

      if (simulateStep) {
        const targets = routeId ? routes.filter((r) => r.id === routeId) : routes;
        const updatedRoutes: BusRoute[] = [];
        for (const rt of targets) {
          if (!rt.gpsEnabled) continue;
          const stepped = advanceBusGpsStep(rt);
          if (shift) stepped.activeShift = shift;
          Object.assign(rt, stepped);
          updatedRoutes.push(rt);
        }
        saveDb();
        res.json({ updatedCount: updatedRoutes.length, routes: routes });
        return;
      }

      if (!routeId || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
        res.status(400).json({ error: 'Provide routeId, lat, and lng (or simulateStep: true).' });
        return;
      }

      const target = routes.find((r) => r.id === routeId);
      if (!target) {
        res.status(404).json({ error: 'Bus route not found.' });
        return;
      }
      if (!target.gpsEnabled) {
        res.status(400).json({ error: `Bus ${target.busNumber} does not have GPS enabled.` });
        return;
      }

      target.currentLat = Number(lat);
      target.currentLng = Number(lng);
      if (Number.isFinite(Number(speedKmph))) target.currentSpeedKmph = Math.max(0, Math.round(Number(speedKmph)));
      if (Number.isFinite(Number(headingDeg))) target.headingDeg = Math.round(Number(headingDeg)) % 360;
      if (shift) target.activeShift = shift;
      target.gpsStatus = 'Live';
      target.lastGpsPingAt = new Date().toISOString();

      saveDb();
      res.json({ route: target });
    },
  );
}
