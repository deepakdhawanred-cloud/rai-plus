import test from 'node:test';
import assert from 'node:assert/strict';
import type { StudentRecord, StudentTransportAllocation, TransportDailyAttendanceRecord } from '../types';
import {
  advanceBusGpsStep,
  buildTransportRoleBundle,
  computeAreaWiseSegregation,
  computePointToSegmentMetrics,
  computeRouteWiseSegregation,
  createInitialBusRoutesForSchool,
  getSchoolGeoAnchor,
  haversineDistanceKm,
  optimizeBusRouteForAdmission,
  recommendRouteForLocality,
} from './transportEngine';

const SCHOOL_ID = 'school-vis-jjr';

function makeStudent(id: string, name: string, classSection: string, address: string): StudentRecord {
  return {
    id,
    schoolId: SCHOOL_ID,
    admissionNo: `ADM-${id}`,
    rollNo: '1',
    name,
    classSection,
    house: 'Arjuna',
    guardianName: 'Parent',
    guardianPhone: '+91 98120 00001',
    address,
    udiseStudentId: 'U1',
    haryanaMisId: 'M1',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 25000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  };
}

test('recommendRouteForLocality connects Housing Board admission enquiry to VIS R-02 (Sunil Yadav) with exact match', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const rec = recommendRouteForLocality('Housing Board, Dharuhera', 'Near Police Chowki', routes, []);

  assert.ok(rec, 'Expected a recommended bus route');
  assert.equal(rec.routeCode, 'R-02');
  assert.equal(rec.confidence, 'Exact Area Match');
  assert.equal(rec.gpsEnabled, true);
  assert.ok(rec.availableSeats > 0);
});

test('computeRouteWiseSegregation and computeAreaWiseSegregation isolate walkers, unallotted bus risks, and route consolidation tips', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const r1 = routes[0];
  const r2 = routes[1];

  const students: StudentRecord[] = [
    makeStudent('s1', 'Aarav', '6-A', 'Model Town'),
    makeStudent('s2', 'Diya', '6-A', 'Model Town'),
    makeStudent('s3', 'Kabir', '7-A', 'Campus Enclave'),
    makeStudent('s4', 'Meera', '8-A', 'Sector 6'),
  ];

  const allocations: StudentTransportAllocation[] = [
    {
      studentId: 's1',
      schoolId: SCHOOL_ID,
      mode: 'Bus',
      routeId: r1.id,
      stopId: r1.stops[0].id,
      stopName: r1.stops[0].name,
      areaLocality: 'Model Town',
      pickupTime: '07:10',
      dropTime: '14:40',
      assignedBy: 'Admin',
      assignedAt: '2026-11-22T00:00:00Z',
    },
    {
      studentId: 's2',
      schoolId: SCHOOL_ID,
      mode: 'Bus',
      routeId: r2.id,
      stopId: r2.stops[1].id,
      stopName: r2.stops[1].name,
      areaLocality: 'Model Town',
      pickupTime: '07:20',
      dropTime: '14:30',
      assignedBy: 'Admin',
      assignedAt: '2026-11-22T00:00:00Z',
    },
    {
      studentId: 's3',
      schoolId: SCHOOL_ID,
      mode: 'Walker',
      areaLocality: 'Campus Enclave',
      assignedBy: 'Admin',
      assignedAt: '2026-11-22T00:00:00Z',
    },
    // s4 intentionally missing allocation -> should be flagged as unallottedBusRisk
  ];

  const attendanceToday: TransportDailyAttendanceRecord[] = [
    {
      id: 'att-1',
      schoolId: SCHOOL_ID,
      date: '2026-11-22',
      shift: 'Morning',
      routeId: r1.id,
      studentId: 's1',
      status: 'Boarded',
      markedAt: '2026-11-22T07:15:00Z',
      markedBy: 'Driver',
    },
  ];

  const routeSeg = computeRouteWiseSegregation(routes, allocations, students, attendanceToday);
  assert.equal(routeSeg.walkers.length, 1);
  assert.equal(routeSeg.walkers[0].student.id, 's3');
  assert.equal(routeSeg.unallottedBusRisk.length, 1);
  assert.equal(routeSeg.unallottedBusRisk[0].student.id, 's4');
  assert.equal(routeSeg.routeRows[0].morningBoardedCount, 1);

  const areaSeg = computeAreaWiseSegregation(routes, allocations, students);
  const modelTown = areaSeg.find((a) => a.areaName === 'Model Town');
  assert.ok(modelTown);
  assert.equal(modelTown.busStudents, 2);
  assert.equal(modelTown.routesServing.length, 2);
  assert.match(modelTown.optimizationTip, /Consolidation opportunity/i);
});

test('buildTransportRoleBundle enforces strict parent single-bus isolation while staff see all buses at once', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const allocations: StudentTransportAllocation[] = [
    {
      studentId: 'stu-vis-601',
      schoolId: SCHOOL_ID,
      mode: 'Bus',
      routeId: routes[0].id,
      stopId: routes[0].stops[1].id,
      stopName: routes[0].stops[1].name,
      areaLocality: 'Sector 6',
      pickupTime: '07:22',
      dropTime: '14:28',
      assignedBy: 'Transport Office',
      assignedAt: '2026-11-22T00:00:00Z',
    },
    {
      studentId: 'stu-vis-602',
      schoolId: SCHOOL_ID,
      mode: 'Bus',
      routeId: routes[1].id,
      stopId: routes[1].stops[1].id,
      stopName: routes[1].stops[1].name,
      areaLocality: 'Model Town',
      pickupTime: '07:20',
      dropTime: '14:30',
      assignedBy: 'Transport Office',
      assignedAt: '2026-11-22T00:00:00Z',
    },
  ];

  const parentBundle = buildTransportRoleBundle({
    role: 'parent',
    schoolId: SCHOOL_ID,
    routes,
    allocations,
    attendanceToday: [],
    visibleStudentIds: new Set(['stu-vis-601']),
  });

  assert.equal(parentBundle.gpsScope, 'assigned_bus_only');
  assert.equal(parentBundle.routes.length, 1);
  assert.equal(parentBundle.routes[0].id, routes[0].id);
  assert.equal(parentBundle.canManageRoutes, false);

  for (const staffRole of ['principal', 'transport_incharge', 'coordinator', 'teacher'] as const) {
    const staffBundle = buildTransportRoleBundle({
      role: staffRole,
      schoolId: SCHOOL_ID,
      routes,
      allocations,
      attendanceToday: [],
      visibleStudentIds: new Set(['stu-vis-601', 'stu-vis-602']),
    });
    assert.equal(staffBundle.gpsScope, 'all_buses');
    assert.equal(staffBundle.routes.length, routes.length);
  }
});

test('advanceBusGpsStep moves GPS-equipped bus coordinates while leaving non-GPS buses untouched', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const gpsBus = routes.find((r) => r.gpsEnabled)!;
  const nonGpsBus = { ...gpsBus, id: 'rt-non-gps', gpsEnabled: false, gpsStatus: 'No GPS' as const };

  const steppedGps = advanceBusGpsStep(gpsBus);
  assert.ok(
    steppedGps.currentLat !== gpsBus.currentLat || steppedGps.currentLng !== gpsBus.currentLng,
    'GPS bus should move toward next stop',
  );

  const steppedNonGps = advanceBusGpsStep(nonGpsBus);
  assert.equal(steppedNonGps.currentLat, nonGpsBus.currentLat);
  assert.equal(steppedNonGps.currentLng, nonGpsBus.currentLng);
});

test('haversineDistanceKm and computePointToSegmentMetrics accurately measure distance and marginal detour', () => {
  const campus = { lat: 28.6063, lng: 76.6565 };
  const modelTown = { lat: 28.6245, lng: 76.6533 };

  // Distance between two points ~2.05 km apart
  const distKm = haversineDistanceKm(campus, modelTown);
  assert.ok(distKm > 1.9 && distKm < 2.2, `Expected ~2.05 km, got ${distKm}`);
  assert.equal(haversineDistanceKm(campus, campus), 0);

  // Midpoint directly on segment A->B should have ~0 perpendicular distance and ~0 marginal detour
  const segA = { lat: 28.60, lng: 76.65 };
  const segB = { lat: 28.62, lng: 76.65 };
  const onLine = { lat: 28.61, lng: 76.65 };
  const onLineMetrics = computePointToSegmentMetrics(onLine, segA, segB);
  assert.ok(
    onLineMetrics.corridorDistanceKm < 0.01,
    `Expected ~0 km corridor distance, got ${onLineMetrics.corridorDistanceKm}`,
  );
  assert.ok(
    onLineMetrics.marginalDetourKm < 0.01,
    `Expected ~0 km detour, got ${onLineMetrics.marginalDetourKm}`,
  );

  // Point ~1 km off the segment should produce a measurable positive detour
  const offLine = { lat: 28.61, lng: 76.66 };
  const offLineMetrics = computePointToSegmentMetrics(offLine, segA, segB);
  assert.ok(offLineMetrics.corridorDistanceKm > 0.8 && offLineMetrics.corridorDistanceKm < 1.2);
  assert.ok(
    offLineMetrics.marginalDetourKm > 0.4,
    `Expected positive detour, got ${offLineMetrics.marginalDetourKm}`,
  );
});

test('optimizeBusRouteForAdmission ranks all routes by residential geolocation and capacity', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const r2Stop = routes.find((r) => r.routeCode === 'R-02')!.stops[1];
  const result = optimizeBusRouteForAdmission({
    residentialGeo: { lat: r2Stop.lat + 0.0001, lng: r2Stop.lng + 0.0001 },
    routes,
    allocations: [],
    schoolLocation: getSchoolGeoAnchor(SCHOOL_ID),
  });

  assert.equal(result.algorithmMode, 'geolocation_and_capacity');
  assert.equal(result.rankedCandidates.length, routes.length);
  assert.ok(result.bestRoute);
  assert.equal(result.bestRoute.routeCode, 'R-02');
  assert.equal(result.bestRoute.confidence, 'Geolocation Optimal');
  assert.equal(result.bestRoute.rank, 1);
  assert.ok((result.bestRoute.efficiencyScore ?? 0) >= 85);
  assert.ok((result.bestRoute.distanceToStopKm ?? 99) < 0.1);
  assert.equal(result.capacityOverflowTriggered, false);
  assert.equal(result.walkableCampusZone, false);
  assert.ok(result.bestRoute.scoreBreakdown);
});

test('optimizeBusRouteForAdmission enforces capacity overflow hard constraint when closest route is 100% full', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const r2 = routes.find((r) => r.routeCode === 'R-02')!;

  // Fill R-02 completely to its capacity
  const fullR2Allocations: StudentTransportAllocation[] = Array.from(
    { length: r2.capacity },
    (_, idx) => ({
      studentId: `stu-fill-${idx}`,
      schoolId: SCHOOL_ID,
      mode: 'Bus',
      routeId: r2.id,
      stopId: r2.stops[0].id,
      stopName: r2.stops[0].name,
      areaLocality: 'Housing Board',
      assignedBy: 'System',
      assignedAt: '2026-11-22T00:00:00Z',
    }),
  );

  // Student lives right beside R-02 stop, but R-02 is 100% full
  const result = optimizeBusRouteForAdmission({
    residentialGeo: { lat: r2.stops[1].lat, lng: r2.stops[1].lng },
    routes,
    allocations: fullR2Allocations,
    schoolLocation: getSchoolGeoAnchor(SCHOOL_ID),
  });

  assert.ok(result.bestRoute);
  assert.notEqual(
    result.bestRoute.routeCode,
    'R-02',
    'Full route R-02 must NOT be selected when other routes have open seats',
  );
  assert.ok(result.bestRoute.availableSeats > 0);
  assert.equal(result.capacityOverflowTriggered, true);
  assert.equal(result.overflowedClosestRouteCode, 'R-02');

  // R-02 must be ranked below all routes with available seats
  const r2Candidate = result.rankedCandidates.find((c) => c.routeCode === 'R-02')!;
  assert.equal(r2Candidate.capacityStatus, 'Full');
  assert.equal(r2Candidate.availableSeats, 0);
  assert.equal(r2Candidate.rank, routes.length);
});

test('optimizeBusRouteForAdmission prefers lower-utilization bus when two routes are equidistant', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const r1 = routes[0];
  const r2 = {
    ...routes[1],
    // Clone identical stops & GPS status so only utilization differentiates r1 and r2
    stops: r1.stops.map((s) => ({ ...s, id: `${s.id}-clone` })),
    gpsEnabled: r1.gpsEnabled,
    capacity: 40,
  };
  const r1Normalized = { ...r1, capacity: 40 };

  // Load r1 to 38/40 (95% full -> post-admission 97.5%) and r2 to 10/40 (25% full)
  const allocations: StudentTransportAllocation[] = [
    ...Array.from({ length: 38 }, (_, i) => ({
      studentId: `r1-stu-${i}`,
      schoolId: SCHOOL_ID,
      mode: 'Bus' as const,
      routeId: r1Normalized.id,
      stopId: r1Normalized.stops[0].id,
      stopName: r1Normalized.stops[0].name,
      areaLocality: 'Sector 6',
      assignedBy: 'System',
      assignedAt: '2026-11-22T00:00:00Z',
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      studentId: `r2-stu-${i}`,
      schoolId: SCHOOL_ID,
      mode: 'Bus' as const,
      routeId: r2.id,
      stopId: r2.stops[0].id,
      stopName: r2.stops[0].name,
      areaLocality: 'Sector 6',
      assignedBy: 'System',
      assignedAt: '2026-11-22T00:00:00Z',
    })),
  ];

  const result = optimizeBusRouteForAdmission({
    residentialGeo: { lat: r1Normalized.stops[1].lat, lng: r1Normalized.stops[1].lng },
    routes: [r1Normalized, r2],
    allocations,
  });

  assert.ok(result.bestRoute);
  assert.equal(result.bestRoute.routeId, r2.id, 'Route with healthy seat headroom should outrank near-full route');
  assert.ok(
    (result.rankedCandidates[0].efficiencyScore ?? 0) >
      (result.rankedCandidates[1].efficiencyScore ?? 0),
  );
});

test('optimizeBusRouteForAdmission flags Walkable Campus Zone when residence is within 0.65 km of school', () => {
  const routes = createInitialBusRoutesForSchool(SCHOOL_ID);
  const campus = getSchoolGeoAnchor(SCHOOL_ID);
  // Pick point ~200m away from VIS Kapriwas campus
  const result = optimizeBusRouteForAdmission({
    residentialGeo: { lat: campus.lat + 0.0012, lng: campus.lng + 0.0007 },
    routes,
    allocations: [],
    schoolLocation: campus,
  });

  assert.equal(result.walkableCampusZone, true);
  assert.ok((result.distanceToCampusKm ?? 99) <= 0.65);
  assert.ok(result.bestRoute);
});
