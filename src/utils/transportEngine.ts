import type {
  BusRoute,
  BusRouteStop,
  GeoPoint,
  GeoRouteOptimizationResult,
  RouteEfficiencyBreakdown,
  RouteRecommendationResult,
  StudentRecord,
  StudentTransportAllocation,
  TransportDailyAttendanceRecord,
  TransportWorkspaceBundle,
  UserRole,
} from '../types';

export const RAI_PLUS_LOGO_URL =
  '/assets/aistudio/Beige_and_Orange_Minimal_Design_Studio_Logo_846b232a.png';

export const SCHOOL_GEO_ANCHORS: Record<string, { lat: number; lng: number; label: string }> = {
  'school-vis-jjr': {
    lat: 28.6063,
    lng: 76.6565,
    label: 'Virat International School Campus, Jhajjar',
  },
  'school-nvh-rtk': {
    lat: 28.8955,
    lng: 76.6066,
    label: 'Navchetna Vidya Hub Campus, Rohtak',
  },
};

export function getSchoolGeoAnchor(schoolId: string): { lat: number; lng: number; label: string } {
  return (
    SCHOOL_GEO_ANCHORS[schoolId] || {
      lat: 28.6063,
      lng: 76.6565,
      label: 'Main School Campus',
    }
  );
}

export function createInitialBusRoutesForSchool(schoolId: string): BusRoute[] {
  const anchor = getSchoolGeoAnchor(schoolId);
  const nowIso = new Date().toISOString();
  const baseLat = anchor.lat;
  const baseLng = anchor.lng;

  const makeStop = (
    routeCode: string,
    seq: number,
    name: string,
    area: string,
    dLat: number,
    dLng: number,
    morningPickupTime: string,
    eveningDropTime: string,
  ): BusRouteStop => ({
    id: `stop-${schoolId}-${routeCode.toLowerCase()}-${seq}`,
    name,
    area,
    lat: Number((baseLat + dLat).toFixed(5)),
    lng: Number((baseLng + dLng).toFixed(5)),
    morningPickupTime,
    eveningDropTime,
    sequence: seq,
  });

  const r1Stops: BusRouteStop[] = [
    makeStop('R01', 1, 'Bahadurgarh Bypass Chowk', 'Bahadurgarh Road', 0.0195, 0.046, '07:10', '14:40'),
    makeStop('R01', 2, 'Sector 6 HUDA Market', 'Sector 6', 0.0112, 0.0255, '07:22', '14:28'),
    makeStop('R01', 3, 'Chhara Chungi Crossing', 'Chhara Road', 0.0068, 0.0145, '07:32', '14:20'),
    makeStop('R01', 4, 'Main School Campus Gate', 'School Campus', 0, 0, '07:45', '14:10'),
  ];

  const r2Stops: BusRouteStop[] = [
    makeStop('R02', 1, 'Rohtak Road Dighal Mor', 'Rohtak Road', 0.0365, -0.0045, '07:05', '14:45'),
    makeStop('R02', 2, 'Model Town Park Gate', 'Model Town', 0.0182, -0.0032, '07:20', '14:30'),
    makeStop('R02', 3, 'Civil Hospital Chowk', 'Civil Lines', 0.0085, -0.0018, '07:32', '14:18'),
    makeStop('R02', 4, 'Main School Campus Gate', 'School Campus', 0, 0, '07:45', '14:10'),
  ];

  const r3Stops: BusRouteStop[] = [
    makeStop('R03', 1, 'Badli Main Bus Stand', 'Badli Road', -0.0215, 0.0425, '07:08', '14:44'),
    makeStop('R03', 2, 'Gurugram Road Toll Point', 'Gurugram Road', -0.0142, 0.026, '07:20', '14:32'),
    makeStop('R03', 3, 'Silani Gate Market', 'Silani Gate', -0.0062, 0.011, '07:33', '14:20'),
    makeStop('R03', 4, 'Main School Campus Gate', 'School Campus', 0, 0, '07:45', '14:10'),
  ];

  const r4Stops: BusRouteStop[] = [
    makeStop('R04', 1, 'Kosli Road Machhrauli Stop', 'Kosli Road', -0.031, -0.026, '07:02', '14:48'),
    makeStop('R04', 2, 'Rewari Road Bypass', 'Rewari Road', -0.0175, -0.0125, '07:18', '14:34'),
    makeStop('R04', 3, 'Subhash Nagar Colony', 'Subhash Nagar', -0.0082, -0.0055, '07:31', '14:21'),
    makeStop('R04', 4, 'Main School Campus Gate', 'School Campus', 0, 0, '07:45', '14:10'),
  ];

  const r5Stops: BusRouteStop[] = [
    makeStop('R05', 1, 'Beri Main Bazaar', 'Beri Road', 0.0165, -0.0365, '07:06', '14:46'),
    makeStop('R05', 2, 'Matanhail Road Junction', 'Matanhail Road', 0.009, -0.022, '07:20', '14:32'),
    makeStop('R05', 3, 'Beri Gate Circular Road', 'Beri Gate', 0.0038, -0.0102, '07:33', '14:19'),
    makeStop('R05', 4, 'Main School Campus Gate', 'School Campus', 0, 0, '07:45', '14:10'),
  ];

  return [
    {
      id: `rt-${schoolId}-01`,
      schoolId,
      routeCode: 'R-01',
      routeName: 'Bahadurgarh Road – Sector 6 Express',
      busNumber: 'HR-14-S-2041',
      capacity: 42,
      driverName: 'Satish Kumar Dalal',
      driverPhone: '+91 98120 44101',
      driverLicenseNo: 'HR14-20160048219',
      driverExperienceYears: 11,
      attendantName: 'Mahender Singh',
      attendantPhone: '+91 98120 44111',
      gpsEnabled: true,
      gpsDeviceId: 'GPS-VIS-101',
      gpsStatus: 'Live',
      currentLat: r1Stops[1].lat,
      currentLng: r1Stops[1].lng,
      currentSpeedKmph: 28,
      headingDeg: 242,
      currentStopIndex: 1,
      activeShift: 'Morning',
      lastGpsPingAt: nowIso,
      monthlyFeeInr: 1100,
      areasCovered: ['Sector 6', 'Bahadurgarh Road', 'Chhara Road', 'HUDA Colony', 'Sector 9'],
      stops: r1Stops,
      routeColor: '#142B46',
      active: true,
    },
    {
      id: `rt-${schoolId}-02`,
      schoolId,
      routeCode: 'R-02',
      routeName: 'Model Town – Rohtak Road Corridor',
      busNumber: 'HR-14-S-2042',
      capacity: 40,
      driverName: 'Virender Singh Hooda',
      driverPhone: '+91 98120 44102',
      driverLicenseNo: 'HR14-20150039104',
      driverExperienceYears: 13,
      attendantName: 'Sunil Kumar',
      attendantPhone: '+91 98120 44112',
      gpsEnabled: true,
      gpsDeviceId: 'GPS-VIS-102',
      gpsStatus: 'Live',
      currentLat: r2Stops[1].lat,
      currentLng: r2Stops[1].lng,
      currentSpeedKmph: 24,
      headingDeg: 185,
      currentStopIndex: 1,
      activeShift: 'Morning',
      lastGpsPingAt: nowIso,
      monthlyFeeInr: 1050,
      areasCovered: ['Model Town', 'Rohtak Road', 'Civil Lines', 'Dighal', 'Old Bus Stand'],
      stops: r2Stops,
      routeColor: '#6E987A',
      active: true,
    },
    {
      id: `rt-${schoolId}-03`,
      schoolId,
      routeCode: 'R-03',
      routeName: 'Badli – Gurugram Road Shuttle',
      busNumber: 'HR-14-S-2043',
      capacity: 38,
      driverName: 'Rajbir Singh Gulia',
      driverPhone: '+91 98120 44103',
      driverLicenseNo: 'HR14-20170052988',
      driverExperienceYears: 9,
      attendantName: 'Pawan Kumar',
      attendantPhone: '+91 98120 44113',
      gpsEnabled: true,
      gpsDeviceId: 'GPS-VIS-103',
      gpsStatus: 'Live',
      currentLat: r3Stops[1].lat,
      currentLng: r3Stops[1].lng,
      currentSpeedKmph: 31,
      headingDeg: 312,
      currentStopIndex: 1,
      activeShift: 'Morning',
      lastGpsPingAt: nowIso,
      monthlyFeeInr: 1200,
      areasCovered: ['Badli Road', 'Badli', 'Gurugram Road', 'Silani Gate', 'Yadav Colony'],
      stops: r3Stops,
      routeColor: '#9A7422',
      active: true,
    },
    {
      id: `rt-${schoolId}-04`,
      schoolId,
      routeCode: 'R-04',
      routeName: 'Rewari – Kosli Road Express',
      busNumber: 'HR-14-S-2044',
      capacity: 36,
      driverName: 'Narender Kumar Yadav',
      driverPhone: '+91 98120 44104',
      driverLicenseNo: 'HR14-20180061233',
      driverExperienceYears: 8,
      attendantName: 'Devender Singh',
      attendantPhone: '+91 98120 44114',
      gpsEnabled: true,
      gpsDeviceId: 'GPS-VIS-104',
      gpsStatus: 'Live',
      currentLat: r4Stops[2].lat,
      currentLng: r4Stops[2].lng,
      currentSpeedKmph: 22,
      headingDeg: 42,
      currentStopIndex: 2,
      activeShift: 'Morning',
      lastGpsPingAt: nowIso,
      monthlyFeeInr: 1150,
      areasCovered: ['Rewari Road', 'Kosli Road', 'Subhash Nagar', 'Machhrauli', 'New Basti'],
      stops: r4Stops,
      routeColor: '#3B6E8C',
      active: true,
    },
    {
      id: `rt-${schoolId}-05`,
      schoolId,
      routeCode: 'R-05',
      routeName: 'Beri Gate – Matanhail Road Feeder',
      busNumber: 'HR-14-S-2045',
      capacity: 32,
      driverName: 'Bijender Singh Kadian',
      driverPhone: '+91 98120 44105',
      driverLicenseNo: 'HR14-20140028491',
      driverExperienceYears: 14,
      attendantName: 'Ramesh Kumar',
      attendantPhone: '+91 98120 44115',
      gpsEnabled: false,
      gpsStatus: 'No GPS',
      currentLat: r5Stops[2].lat,
      currentLng: r5Stops[2].lng,
      currentSpeedKmph: 0,
      headingDeg: 118,
      currentStopIndex: 2,
      activeShift: 'Idle',
      lastGpsPingAt: nowIso,
      monthlyFeeInr: 950,
      areasCovered: ['Beri Gate', 'Beri Road', 'Matanhail Road', 'Chhuchhakwas', 'Arya Nagar'],
      stops: r5Stops,
      routeColor: '#7C4D8B',
      active: true,
    },
  ];
}

function tokenizeLocation(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !['road', 'near', 'opp', 'gate', 'jhajjar', 'haryana', 'india', 'village', 'colony', 'sector'].includes(t));
}

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle Haversine distance in kilometers between two WGS84 coordinates.
 */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Computes the perpendicular distance from a student's residential point P
 * to a bus route segment [A -> B] and the marginal bus detour distance
 * (d(A,P) + d(P,B) - d(A,B)) if the bus were to deviate via P.
 */
export function computePointToSegmentMetrics(
  point: GeoPoint,
  segStart: GeoPoint,
  segEnd: GeoPoint,
): {
  corridorDistanceKm: number;
  marginalDetourKm: number;
  projectionPoint: GeoPoint;
} {
  const cosLat = Math.cos(toRadians((segStart.lat + segEnd.lat + point.lat) / 3));
  const ax = segStart.lng * cosLat;
  const ay = segStart.lat;
  const bx = segEnd.lng * cosLat;
  const by = segEnd.lat;
  const px = point.lng * cosLat;
  const py = point.lat;

  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby;

  let t = 0;
  if (abLenSq > 1e-12) {
    t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
  }

  const projectionPoint: GeoPoint = {
    lat: segStart.lat + t * (segEnd.lat - segStart.lat),
    lng: segStart.lng + t * (segEnd.lng - segStart.lng),
  };

  const corridorDistanceKm = haversineDistanceKm(point, projectionPoint);
  const directSegKm = haversineDistanceKm(segStart, segEnd);
  const viaPointKm =
    haversineDistanceKm(segStart, point) + haversineDistanceKm(point, segEnd);
  const marginalDetourKm = Math.max(0, viaPointKm - directSegKm);

  return {
    corridorDistanceKm,
    marginalDetourKm,
    projectionPoint,
  };
}

function roundKm(val: number): number {
  return Math.round(val * 100) / 100;
}

function isValidGeoPoint(pt?: GeoPoint | null): pt is GeoPoint {
  return Boolean(
    pt &&
      Number.isFinite(pt.lat) &&
      Number.isFinite(pt.lng) &&
      pt.lat >= -90 &&
      pt.lat <= 90 &&
      pt.lng >= -180 &&
      pt.lng <= 180 &&
      !(pt.lat === 0 && pt.lng === 0),
  );
}

function computeCapacityScore(assigned: number, capacity: number): {
  score: number;
  status: NonNullable<RouteRecommendationResult['capacityStatus']>;
  availableSeats: number;
  utilizationPct: number;
  postAdmissionUtilizationPct: number;
} {
  const safeCap = Math.max(1, capacity);
  const availableSeats = Math.max(0, safeCap - assigned);
  const utilizationPct = Math.round((assigned / safeCap) * 100);
  const postAdmissionUtilizationPct = Math.round(((assigned + 1) / safeCap) * 100);

  if (availableSeats <= 0) {
    return {
      score: 0,
      status: 'Full',
      availableSeats: 0,
      utilizationPct,
      postAdmissionUtilizationPct,
    };
  }

  // Load-balancing curve:
  // <= 75% utilization => 92..100 pts (balanced fleet headroom)
  // 76..90% => 72..92 pts (filling fast)
  // 91..100% => 38..72 pts (near full, prefer balanced neighbor if close)
  if (postAdmissionUtilizationPct <= 75) {
    const headroomRatio = availableSeats / safeCap;
    return {
      score: Math.round(92 + Math.min(8, headroomRatio * 10)),
      status: 'Open',
      availableSeats,
      utilizationPct,
      postAdmissionUtilizationPct,
    };
  }
  if (postAdmissionUtilizationPct <= 90) {
    const t = (postAdmissionUtilizationPct - 75) / 15;
    return {
      score: Math.round(92 - t * 20),
      status: 'Filling Fast',
      availableSeats,
      utilizationPct,
      postAdmissionUtilizationPct,
    };
  }
  const t = Math.min(1, (postAdmissionUtilizationPct - 90) / 10);
  return {
    score: Math.round(72 - t * 34),
    status: 'Near Full',
    availableSeats,
    utilizationPct,
    postAdmissionUtilizationPct,
  };
}

export interface RouteOptimizationOptions {
  maxWalkableCampusKm?: number;
  maxComfortableStopWalkKm?: number;
  avgBusSpeedKmph?: number;
}

/**
 * Multi-criteria Geospatial + Capacity Efficiency Algorithm for New Student Admissions.
 *
 * Ranks every active bus route by combining:
 *  1. Great-circle proximity to the nearest existing boarding stop (45%)
 *  2. Marginal bus corridor detour cost along ordered route segments (25%)
 *  3. Real-time seat capacity & load-balancing headroom with hard full-bus overflow (25%)
 *  4. Operational readiness (GPS tracking + locality affinity) (5%)
 *
 * When residential geolocation is unavailable, falls back seamlessly to locality/address
 * token matching combined with real-time capacity load balancing.
 */
export function optimizeBusRouteForAdmission(params: {
  residentialGeo?: GeoPoint | null;
  locality?: string;
  address?: string;
  routes: BusRoute[];
  allocations: StudentTransportAllocation[];
  schoolLocation?: GeoPoint;
  options?: RouteOptimizationOptions;
}): GeoRouteOptimizationResult {
  const {
    residentialGeo,
    locality,
    address,
    routes,
    allocations,
    schoolLocation,
    options,
  } = params;

  const activeRoutes = routes.filter((r) => r.active);
  const maxWalkableCampusKm = options?.maxWalkableCampusKm ?? 0.65;
  const maxComfortableStopWalkKm = options?.maxComfortableStopWalkKm ?? 0.85;
  const avgBusSpeedKmph = options?.avgBusSpeedKmph ?? 24;

  const validGeo = isValidGeoPoint(residentialGeo) ? residentialGeo : null;
  const campusAnchor =
    schoolLocation ||
    (activeRoutes[0] ? getSchoolGeoAnchor(activeRoutes[0].schoolId) : null);
  const distanceToCampusKm =
    validGeo && campusAnchor ? roundKm(haversineDistanceKm(validGeo, campusAnchor)) : null;
  const walkableCampusZone =
    distanceToCampusKm !== null && distanceToCampusKm <= maxWalkableCampusKm;

  if (activeRoutes.length === 0) {
    return {
      bestRoute: null,
      rankedCandidates: [],
      studentLocation: validGeo,
      distanceToCampusKm,
      walkableCampusZone,
      capacityOverflowTriggered: false,
      algorithmMode: validGeo ? 'geolocation_and_capacity' : 'hybrid_text_and_capacity',
      summaryExplanation: 'No active bus routes are configured for this school yet.',
    };
  }

  const countByRoute: Record<string, number> = {};
  for (const a of allocations) {
    if (a.mode === 'Bus' && a.routeId) {
      countByRoute[a.routeId] = (countByRoute[a.routeId] || 0) + 1;
    }
  }

  const queryText = `${locality || ''} ${address || ''}`.trim().toLowerCase();
  const queryTokens = tokenizeLocation(queryText);

  const scored: Array<{
    result: RouteRecommendationResult;
    sortKey: number;
    hasCapacity: boolean;
    rawGeoDistKm: number;
  }> = [];

  for (const route of activeRoutes) {
    const assignedCount = countByRoute[route.id] || 0;
    const cap = computeCapacityScore(assignedCount, route.capacity);
    const hasCapacity = cap.availableSeats > 0;

    const pickupStops = route.stops.filter(
      (s) => s.area.toLowerCase() !== 'school campus',
    );
    const candidateStops = pickupStops.length > 0 ? pickupStops : route.stops;
    const fallbackStop: BusRouteStop = candidateStops[0] || {
      id: 'default',
      name: route.routeName,
      area: route.areasCovered[0] || 'Main Corridor',
      lat: route.currentLat,
      lng: route.currentLng,
      morningPickupTime: '07:20',
      eveningDropTime: '14:30',
      sequence: 1,
    };

    // Text affinity check (helps both hybrid mode and readiness tie-breaking)
    let textAffinityScore = 0;
    let textMatchedArea = route.areasCovered[0] || fallbackStop.area;
    let textMatchedStop = fallbackStop;
    let textConfidence: RouteRecommendationResult['confidence'] = 'Nearest Available';
    let textReason = `Available seats (${cap.availableSeats}/${route.capacity}) along ${route.routeName}`;

    if (queryText.length > 0) {
      for (const area of route.areasCovered) {
        const aLow = area.toLowerCase();
        if (queryText.includes(aLow) || (aLow.length >= 4 && aLow.includes(queryText))) {
          const matchingStop =
            candidateStops.find(
              (s) =>
                s.area.toLowerCase().includes(aLow) ||
                s.name.toLowerCase().includes(aLow),
            ) || fallbackStop;
          textAffinityScore = 100;
          textMatchedArea = area;
          textMatchedStop = matchingStop;
          textConfidence = 'Exact Area Match';
          textReason = `Direct coverage for "${area}" via ${matchingStop.name} (${cap.availableSeats} seats open)`;
          break;
        }
      }

      if (textAffinityScore < 100) {
        for (const stop of candidateStops) {
          const stopHay = `${stop.name} ${stop.area}`.toLowerCase();
          if (
            queryText.includes(stop.area.toLowerCase()) ||
            queryText.includes(stop.name.toLowerCase())
          ) {
            textAffinityScore = 92;
            textMatchedStop = stop;
            textMatchedArea = stop.area;
            textConfidence = 'Exact Area Match';
            textReason = `Matched stop "${stop.name}" (${stop.area}) with ${cap.availableSeats} seats open`;
            break;
          }
          const matchedTokens = queryTokens.filter((t) => stopHay.includes(t));
          if (matchedTokens.length > 0) {
            const candidatePts = Math.min(82, 52 + matchedTokens.length * 16);
            if (candidatePts > textAffinityScore) {
              textAffinityScore = candidatePts;
              textMatchedStop = stop;
              textMatchedArea = stop.area;
              textConfidence = 'Nearby Corridor';
              textReason = `Corridor match ("${matchedTokens.join(', ')}") near ${stop.name}`;
            }
          }
        }
      }

      if (textAffinityScore === 0 && queryTokens.length > 0) {
        const routeHay = `${route.routeName} ${route.areasCovered.join(' ')}`.toLowerCase();
        const matchedTokens = queryTokens.filter((t) => routeHay.includes(t));
        if (matchedTokens.length > 0) {
          textAffinityScore = Math.min(76, 48 + matchedTokens.length * 14);
          textConfidence = 'Nearby Corridor';
          textReason = `Matches corridor "${matchedTokens.join(', ')}" on ${route.routeName}`;
        }
      }
    }

    if (validGeo) {
      // 1. Find nearest boarding stop by Haversine distance
      let nearestStop = fallbackStop;
      let minStopDistKm = Number.POSITIVE_INFINITY;
      for (const stop of candidateStops) {
        const d = haversineDistanceKm(validGeo, { lat: stop.lat, lng: stop.lng });
        if (d < minStopDistKm) {
          minStopDistKm = d;
          nearestStop = stop;
        }
      }

      // 2. Find minimum corridor distance & marginal bus detour along consecutive route segments
      const orderedStops = [...route.stops].sort((a, b) => a.sequence - b.sequence);
      let minCorridorDistKm = minStopDistKm;
      let minDetourKm = minStopDistKm * 1.4;

      if (orderedStops.length >= 2) {
        minCorridorDistKm = Number.POSITIVE_INFINITY;
        minDetourKm = Number.POSITIVE_INFINITY;
        for (let i = 0; i < orderedStops.length - 1; i += 1) {
          const m = computePointToSegmentMetrics(
            validGeo,
            { lat: orderedStops[i].lat, lng: orderedStops[i].lng },
            { lat: orderedStops[i + 1].lat, lng: orderedStops[i + 1].lng },
          );
          if (m.corridorDistanceKm < minCorridorDistKm) {
            minCorridorDistKm = m.corridorDistanceKm;
          }
          if (m.marginalDetourKm < minDetourKm) {
            minDetourKm = m.marginalDetourKm;
          }
        }
      }

      const distanceToStopKm = roundKm(minStopDistKm);
      const corridorDistanceKm = roundKm(minCorridorDistKm);
      // If student can comfortably walk to an existing stop, bus needs 0 detour!
      const needsFeederStop = distanceToStopKm > maxComfortableStopWalkKm;
      const effectiveDetourKm = needsFeederStop ? roundKm(minDetourKm) : 0;
      const estimatedDetourMinutes = needsFeederStop
        ? Math.max(1, Math.round((effectiveDetourKm / avgBusSpeedKmph) * 60 + 1.5))
        : 0;

      // 3. Weighted Efficiency Sub-Scores (0-100 each)
      // Proximity score: exponential decay (0 km => 100, 0.5 km => 87, 1.5 km => 66, 3 km => 43, 6 km => 19)
      const proximityScore = Math.round(100 * Math.exp(-0.28 * distanceToStopKm));
      // Detour score: rewards routes passing close to home (0 km detour => 100, 1.5 km => 67, 4 km => 34)
      const detourBasisKm = Math.min(corridorDistanceKm, effectiveDetourKm + corridorDistanceKm * 0.5);
      const detourScore = Math.round(100 * Math.exp(-0.32 * detourBasisKm));
      const capacityScore = cap.score;
      const readinessScore = Math.min(
        100,
        (route.gpsEnabled ? 70 : 40) + Math.round(textAffinityScore * 0.3),
      );

      const rawComposite = Math.round(
        proximityScore * 0.45 +
          detourScore * 0.25 +
          capacityScore * 0.25 +
          readinessScore * 0.05,
      );
      const efficiencyScore = hasCapacity
        ? Math.max(1, Math.min(100, rawComposite))
        : Math.max(0, Math.min(35, Math.round(rawComposite * 0.35)));

      const boardingRecommendation: NonNullable<
        RouteRecommendationResult['boardingRecommendation']
      > = !hasCapacity
        ? 'Full Capacity — Overflow'
        : needsFeederStop
          ? 'Proposed Feeder Stop'
          : 'Existing Stop';

      const confidence: RouteRecommendationResult['confidence'] =
        distanceToStopKm <= 1.25
          ? 'Geolocation Optimal'
          : distanceToStopKm <= 3.0
            ? 'Nearby Corridor'
            : 'Nearest Available';

      const reason = !hasCapacity
        ? `${distanceToStopKm} km from ${nearestStop.name}, but bus is at 100% capacity (${assignedCount}/${route.capacity}) — overflowed to next available route.`
        : needsFeederStop
          ? `${distanceToStopKm} km to ${nearestStop.name} (${corridorDistanceKm} km from route corridor · ~${effectiveDetourKm} km / +${estimatedDetourMinutes} min detour) · ${cap.availableSeats}/${route.capacity} seats open.`
          : `${distanceToStopKm} km walk to existing stop "${nearestStop.name}" (0 min bus detour) · ${cap.availableSeats}/${route.capacity} seats open (${cap.postAdmissionUtilizationPct}% load after admission).`;

      const scoreBreakdown: RouteEfficiencyBreakdown = {
        proximityScore,
        detourScore,
        capacityScore,
        readinessScore,
      };

      const result: RouteRecommendationResult = {
        routeId: route.id,
        routeCode: route.routeCode,
        routeName: route.routeName,
        busNumber: route.busNumber,
        stopId: nearestStop.id,
        stopName: nearestStop.name,
        stopLat: nearestStop.lat,
        stopLng: nearestStop.lng,
        areaMatched: nearestStop.area,
        pickupTime: nearestStop.morningPickupTime,
        dropTime: nearestStop.eveningDropTime,
        monthlyFeeInr: route.monthlyFeeInr,
        driverName: route.driverName,
        driverPhone: route.driverPhone,
        gpsEnabled: route.gpsEnabled,
        capacity: route.capacity,
        assignedCount,
        availableSeats: cap.availableSeats,
        utilizationPct: cap.utilizationPct,
        postAdmissionUtilizationPct: cap.postAdmissionUtilizationPct,
        capacityStatus: cap.status,
        efficiencyScore,
        distanceToStopKm,
        corridorDistanceKm,
        marginalDetourKm: effectiveDetourKm,
        estimatedDetourMinutes,
        boardingRecommendation,
        scoreBreakdown,
        confidence,
        reason,
      };

      // Hard feasibility tier: routes with open seats ALWAYS outrank full routes
      const sortKey = (hasCapacity ? 1000 : 0) + efficiencyScore + cap.availableSeats * 0.01;
      scored.push({
        result,
        sortKey,
        hasCapacity,
        rawGeoDistKm: distanceToStopKm,
      });
    } else {
      // Hybrid Text + Capacity mode when lat/lng not provided yet
      const proximityScore = textAffinityScore > 0 ? textAffinityScore : 45;
      const detourScore = textAffinityScore >= 90 ? 95 : textAffinityScore >= 50 ? 72 : 50;
      const capacityScore = cap.score;
      const readinessScore = route.gpsEnabled ? 85 : 55;

      const rawComposite = Math.round(
        proximityScore * 0.5 +
          detourScore * 0.15 +
          capacityScore * 0.3 +
          readinessScore * 0.05,
      );
      const efficiencyScore = hasCapacity
        ? Math.max(1, Math.min(100, rawComposite))
        : Math.max(0, Math.min(35, Math.round(rawComposite * 0.35)));

      const result: RouteRecommendationResult = {
        routeId: route.id,
        routeCode: route.routeCode,
        routeName: route.routeName,
        busNumber: route.busNumber,
        stopId: textMatchedStop.id,
        stopName: textMatchedStop.name,
        stopLat: textMatchedStop.lat,
        stopLng: textMatchedStop.lng,
        areaMatched: textMatchedArea,
        pickupTime: textMatchedStop.morningPickupTime,
        dropTime: textMatchedStop.eveningDropTime,
        monthlyFeeInr: route.monthlyFeeInr,
        driverName: route.driverName,
        driverPhone: route.driverPhone,
        gpsEnabled: route.gpsEnabled,
        capacity: route.capacity,
        assignedCount,
        availableSeats: cap.availableSeats,
        utilizationPct: cap.utilizationPct,
        postAdmissionUtilizationPct: cap.postAdmissionUtilizationPct,
        capacityStatus: cap.status,
        efficiencyScore,
        boardingRecommendation: !hasCapacity ? 'Full Capacity — Overflow' : 'Existing Stop',
        scoreBreakdown: {
          proximityScore,
          detourScore,
          capacityScore,
          readinessScore,
        },
        confidence: textConfidence,
        reason: hasCapacity
          ? textReason
          : `${textMatchedArea} route is full (${assignedCount}/${route.capacity}) — overflowed to next available bus.`,
      };

      const sortKey = (hasCapacity ? 1000 : 0) + efficiencyScore + cap.availableSeats * 0.01;
      scored.push({
        result,
        sortKey,
        hasCapacity,
        rawGeoDistKm: Number.POSITIVE_INFINITY,
      });
    }
  }

  scored.sort((a, b) => b.sortKey - a.sortKey);

  const rankedCandidates = scored.map((entry, idx) => ({
    ...entry.result,
    rank: idx + 1,
  }));
  const bestRoute = rankedCandidates[0] || null;

  // Detect if the geographically closest route was skipped because it had 0 open seats
  let capacityOverflowTriggered = false;
  let overflowedClosestRouteCode: string | undefined;
  if (validGeo && scored.length > 1) {
    const geoClosest = [...scored].sort((a, b) => a.rawGeoDistKm - b.rawGeoDistKm)[0];
    if (geoClosest && !geoClosest.hasCapacity && bestRoute && bestRoute.availableSeats > 0) {
      capacityOverflowTriggered = true;
      overflowedClosestRouteCode = geoClosest.result.routeCode;
    }
  } else if (!validGeo && scored.length > 1) {
    const fullExactMatch = scored.find(
      (s) => !s.hasCapacity && s.result.confidence === 'Exact Area Match',
    );
    if (fullExactMatch && bestRoute && bestRoute.availableSeats > 0) {
      capacityOverflowTriggered = true;
      overflowedClosestRouteCode = fullExactMatch.result.routeCode;
    }
  }

  let summaryExplanation = 'No eligible routes available.';
  if (bestRoute) {
    if (bestRoute.availableSeats <= 0) {
      summaryExplanation = `All active buses are currently at 100% capacity. Nearest route is ${bestRoute.routeCode} (${bestRoute.stopName}) — consider adding capacity or launching a feeder van.`;
    } else if (capacityOverflowTriggered && overflowedClosestRouteCode) {
      summaryExplanation = `Closest route ${overflowedClosestRouteCode} is at full capacity. Intelligently rerouted to ${bestRoute.routeCode} (${bestRoute.stopName}${bestRoute.distanceToStopKm !== undefined ? `, ${bestRoute.distanceToStopKm} km` : ''}) with ${bestRoute.availableSeats} open seats (Efficiency ${bestRoute.efficiencyScore}/100).`;
    } else if (walkableCampusZone && distanceToCampusKm !== null) {
      summaryExplanation = `Residence is ${distanceToCampusKm} km from campus (walkable zone). If bus transport is requested, ${bestRoute.routeCode} (${bestRoute.stopName}) is most efficient (${bestRoute.efficiencyScore}/100).`;
    } else if (validGeo) {
      summaryExplanation = `${bestRoute.routeCode} (${bestRoute.routeName}) ranked #1 with Efficiency ${bestRoute.efficiencyScore}/100 — ${bestRoute.distanceToStopKm} km to ${bestRoute.stopName}, ${bestRoute.marginalDetourKm} km detour, ${bestRoute.availableSeats}/${bestRoute.capacity} seats open.`;
    } else {
      summaryExplanation = `${bestRoute.routeCode} (${bestRoute.routeName}) matched via ${bestRoute.confidence} with ${bestRoute.availableSeats}/${bestRoute.capacity} seats open (Efficiency ${bestRoute.efficiencyScore}/100).`;
    }
  }

  return {
    bestRoute,
    rankedCandidates,
    studentLocation: validGeo,
    distanceToCampusKm,
    walkableCampusZone,
    capacityOverflowTriggered,
    overflowedClosestRouteCode,
    algorithmMode: validGeo ? 'geolocation_and_capacity' : 'hybrid_text_and_capacity',
    summaryExplanation,
  };
}

export function recommendRouteForLocality(
  localityRaw: string | undefined,
  addressRaw: string | undefined,
  routes: BusRoute[],
  allocations: StudentTransportAllocation[],
  residentialGeo?: GeoPoint | null,
): RouteRecommendationResult | null {
  return optimizeBusRouteForAdmission({
    residentialGeo,
    locality: localityRaw,
    address: addressRaw,
    routes,
    allocations,
  }).bestRoute;
}

export function deriveInitialStudentAllocations(
  students: StudentRecord[],
  routes: BusRoute[],
  schoolId: string,
): StudentTransportAllocation[] {
  const schoolStudents = students.filter((s) => s.schoolId === schoolId);
  const activeRoutes = routes.filter((r) => r.schoolId === schoolId && r.active);
  const nowIso = new Date().toISOString();

  if (activeRoutes.length === 0) return [];

  const sampleAreas = [
    'Sector 6',
    'Model Town',
    'Badli Road',
    'Rewari Road',
    'Beri Gate',
    'Civil Lines',
    'Bahadurgarh Road',
    'Subhash Nagar',
    'Gurugram Road',
    'Rohtak Road',
    'Campus Enclave (Walkable)',
  ];

  const allocations: StudentTransportAllocation[] = [];
  const baselineCounts: Record<string, number> = {};
  const baselineCapForRoute = (route: BusRoute): number =>
    Math.max(1, Math.floor(route.capacity * 0.8));

  schoolStudents.forEach((student, idx) => {
    // Guarantee key demo parent accounts have live GPS bus routes allotted
    if (student.id === 'stu-vis-601') {
      const r1 = activeRoutes[0];
      const stop = r1.stops[1] || r1.stops[0];
      baselineCounts[r1.id] = (baselineCounts[r1.id] || 0) + 1;
      allocations.push({
        studentId: student.id,
        schoolId,
        mode: 'Bus',
        routeId: r1.id,
        stopId: stop.id,
        stopName: stop.name,
        areaLocality: stop.area,
        pickupTime: stop.morningPickupTime,
        dropTime: stop.eveningDropTime,
        assignedBy: 'Transport Office Baseline',
        assignedAt: nowIso,
      });
      return;
    }
    if (student.id === 'stu-vis-602' || student.id === 'stu-vis-902') {
      const r2 = activeRoutes[1] || activeRoutes[0];
      const stop = r2.stops[1] || r2.stops[0];
      baselineCounts[r2.id] = (baselineCounts[r2.id] || 0) + 1;
      allocations.push({
        studentId: student.id,
        schoolId,
        mode: 'Bus',
        routeId: r2.id,
        stopId: stop.id,
        stopName: stop.name,
        areaLocality: stop.area,
        pickupTime: stop.morningPickupTime,
        dropTime: stop.eveningDropTime,
        assignedBy: 'Transport Office Baseline',
        assignedAt: nowIso,
      });
      return;
    }

    // ~20% walkers near campus, plus students beyond realistic 80% baseline bus capacity
    const routesWithHeadroom = activeRoutes.filter(
      (r) => (baselineCounts[r.id] || 0) < baselineCapForRoute(r),
    );
    const isWalker = idx % 5 === 4 || routesWithHeadroom.length === 0;
    if (isWalker) {
      allocations.push({
        studentId: student.id,
        schoolId,
        mode: 'Walker',
        areaLocality: student.address?.trim() || 'Campus Enclave (Walkable)',
        assignedBy: 'Transport Office Baseline',
        assignedAt: nowIso,
        notes: 'Self-drop / Pedestrian walker verified by parent',
      });
      return;
    }

    // Try matching student's existing address against routes with realistic headroom
    const addressHint = student.address?.trim() || sampleAreas[idx % (sampleAreas.length - 1)];
    const rec = recommendRouteForLocality(
      addressHint,
      student.address,
      routesWithHeadroom,
      allocations,
    );
    const chosenRoute =
      (rec && routesWithHeadroom.find((r) => r.id === rec.routeId)) ||
      routesWithHeadroom[idx % routesWithHeadroom.length];
    const pickupStops = chosenRoute.stops.filter((s) => s.area !== 'School Campus');
    const chosenStop =
      (rec && pickupStops.find((s) => s.id === rec.stopId)) ||
      pickupStops[idx % Math.max(1, pickupStops.length)] ||
      chosenRoute.stops[0];

    baselineCounts[chosenRoute.id] = (baselineCounts[chosenRoute.id] || 0) + 1;
    allocations.push({
      studentId: student.id,
      schoolId,
      mode: 'Bus',
      routeId: chosenRoute.id,
      stopId: chosenStop.id,
      stopName: chosenStop.name,
      areaLocality: chosenStop.area,
      pickupTime: chosenStop.morningPickupTime,
      dropTime: chosenStop.eveningDropTime,
      assignedBy: 'Transport Office Baseline',
      assignedAt: nowIso,
    });
  });

  return allocations;
}

export interface RouteSegregationRow {
  route: BusRoute;
  assignedStudents: Array<{
    student: StudentRecord;
    allocation: StudentTransportAllocation;
    morningStatus?: TransportDailyAttendanceRecord['status'];
    eveningStatus?: TransportDailyAttendanceRecord['status'];
  }>;
  assignedCount: number;
  vacantSeats: number;
  utilizationPct: number;
  isOverloaded: boolean;
  morningBoardedCount: number;
  eveningDroppedCount: number;
}

export interface AreaSegregationRow {
  areaName: string;
  totalStudents: number;
  busStudents: number;
  walkerStudents: number;
  unallottedBusStudents: number;
  routesServing: string[];
  optimizationTip: string;
  students: Array<{
    studentId: string;
    studentName: string;
    classSection: string;
    mode: 'Bus' | 'Walker';
    routeCode?: string;
    stopName?: string;
  }>;
}

export function computeRouteWiseSegregation(
  routes: BusRoute[],
  allocations: StudentTransportAllocation[],
  students: StudentRecord[],
  attendanceToday: TransportDailyAttendanceRecord[],
): {
  routeRows: RouteSegregationRow[];
  walkers: Array<{ student: StudentRecord; allocation?: StudentTransportAllocation }>;
  unallottedBusRisk: Array<{ student: StudentRecord; allocation?: StudentTransportAllocation }>;
} {
  const studentById: Record<string, StudentRecord> = {};
  for (const s of students) studentById[s.id] = s;

  const allocByStudentId: Record<string, StudentTransportAllocation> = {};
  for (const a of allocations) allocByStudentId[a.studentId] = a;

  const morningByStudent: Record<string, TransportDailyAttendanceRecord['status']> = {};
  const eveningByStudent: Record<string, TransportDailyAttendanceRecord['status']> = {};
  for (const att of attendanceToday) {
    if (att.shift === 'Morning') morningByStudent[att.studentId] = att.status;
    if (att.shift === 'Evening') eveningByStudent[att.studentId] = att.status;
  }

  const routeRows: RouteSegregationRow[] = routes.map((route) => {
    const members = allocations
      .filter((a) => a.mode === 'Bus' && a.routeId === route.id && studentById[a.studentId])
      .map((allocation) => ({
        student: studentById[allocation.studentId],
        allocation,
        morningStatus: morningByStudent[allocation.studentId],
        eveningStatus: eveningByStudent[allocation.studentId],
      }))
      .sort((a, b) => a.student.name.localeCompare(b.student.name));

    const assignedCount = members.length;
    const vacantSeats = Math.max(0, route.capacity - assignedCount);
    const utilizationPct = route.capacity > 0 ? Math.round((assignedCount / route.capacity) * 100) : 0;
    const morningBoardedCount = members.filter((m) => m.morningStatus === 'Boarded').length;
    const eveningDroppedCount = members.filter((m) => m.eveningStatus === 'Dropped').length;

    return {
      route,
      assignedStudents: members,
      assignedCount,
      vacantSeats,
      utilizationPct,
      isOverloaded: assignedCount > route.capacity,
      morningBoardedCount,
      eveningDroppedCount,
    };
  });

  const walkers: Array<{ student: StudentRecord; allocation?: StudentTransportAllocation }> = [];
  const unallottedBusRisk: Array<{ student: StudentRecord; allocation?: StudentTransportAllocation }> = [];

  const validRouteIds = new Set(routes.map((r) => r.id));
  for (const st of students) {
    const alloc = allocByStudentId[st.id];
    if (!alloc) {
      unallottedBusRisk.push({ student: st });
    } else if (alloc.mode === 'Walker') {
      walkers.push({ student: st, allocation: alloc });
    } else if (!alloc.routeId || !validRouteIds.has(alloc.routeId)) {
      unallottedBusRisk.push({ student: st, allocation: alloc });
    }
  }

  return { routeRows, walkers, unallottedBusRisk };
}

export function computeAreaWiseSegregation(
  routes: BusRoute[],
  allocations: StudentTransportAllocation[],
  students: StudentRecord[],
): AreaSegregationRow[] {
  const routeCodeById: Record<string, string> = {};
  for (const r of routes) routeCodeById[r.id] = r.routeCode;

  const allocByStudentId: Record<string, StudentTransportAllocation> = {};
  for (const a of allocations) allocByStudentId[a.studentId] = a;

  const groups: Record<string, AreaSegregationRow> = {};

  for (const st of students) {
    const alloc = allocByStudentId[st.id];
    const areaName = (alloc?.areaLocality || st.address || 'Area Not Specified').trim() || 'Area Not Specified';
    const key = areaName.toLowerCase();

    if (!groups[key]) {
      groups[key] = {
        areaName,
        totalStudents: 0,
        busStudents: 0,
        walkerStudents: 0,
        unallottedBusStudents: 0,
        routesServing: [],
        optimizationTip: '',
        students: [],
      };
    }

    const row = groups[key];
    row.totalStudents += 1;
    const mode: 'Bus' | 'Walker' = alloc?.mode === 'Walker' ? 'Walker' : 'Bus';
    const routeCode = alloc?.routeId ? routeCodeById[alloc.routeId] : undefined;

    if (mode === 'Walker') {
      row.walkerStudents += 1;
    } else {
      row.busStudents += 1;
      if (!routeCode) {
        row.unallottedBusStudents += 1;
      } else if (!row.routesServing.includes(routeCode)) {
        row.routesServing.push(routeCode);
      }
    }

    row.students.push({
      studentId: st.id,
      studentName: st.name,
      classSection: st.classSection,
      mode,
      routeCode,
      stopName: alloc?.stopName,
    });
  }

  return Object.values(groups)
    .map((row) => {
      if (row.unallottedBusStudents > 0) {
        row.optimizationTip = `Action needed: ${row.unallottedBusStudents} non-walker student(s) require bus route allotment.`;
      } else if (row.routesServing.length >= 2) {
        row.optimizationTip = `Consolidation opportunity: ${row.busStudents} riders split across ${row.routesServing.join(', ')} — consider merging into 1 primary bus.`;
      } else if (row.busStudents >= 28) {
        row.optimizationTip = `High-density pocket (${row.busStudents} riders) — eligible for dedicated express feeder stop.`;
      } else if (row.walkerStudents === row.totalStudents) {
        row.optimizationTip = `All ${row.walkerStudents} students are verified walkers — no bus stop required.`;
      } else {
        row.optimizationTip = `Well-balanced corridor served cleanly by ${row.routesServing[0] || 'assigned bus'}.`;
      }
      return row;
    })
    .sort((a, b) => b.totalStudents - a.totalStudents);
}

export function advanceBusGpsStep(route: BusRoute): BusRoute {
  if (!route.gpsEnabled || route.stops.length < 2) {
    return route;
  }

  const nextStopIdx = (route.currentStopIndex + 1) % route.stops.length;
  const targetStop = route.stops[nextStopIdx];
  const dLat = targetStop.lat - route.currentLat;
  const dLng = targetStop.lng - route.currentLng;
  const dist = Math.hypot(dLat, dLng);

  let newLat = targetStop.lat;
  let newLng = targetStop.lng;
  let newStopIndex = route.currentStopIndex;

  if (dist > 0.004) {
    // Move 45% closer to next stop along real coordinates
    newLat = Number((route.currentLat + dLat * 0.45).toFixed(5));
    newLng = Number((route.currentLng + dLng * 0.45).toFixed(5));
  } else {
    newLat = targetStop.lat;
    newLng = targetStop.lng;
    newStopIndex = nextStopIdx;
  }

  const headingRad = Math.atan2(dLng, dLat);
  const headingDeg = Math.round(((headingRad * 180) / Math.PI + 360) % 360);

  return {
    ...route,
    gpsStatus: 'Live',
    activeShift: route.activeShift === 'Idle' ? 'Morning' : route.activeShift,
    currentLat: newLat,
    currentLng: newLng,
    currentSpeedKmph: Math.max(18, Math.min(38, 22 + Math.round((dist * 1000) % 14))),
    headingDeg,
    currentStopIndex: newStopIndex,
    lastGpsPingAt: new Date().toISOString(),
  };
}

export function canRoleViewAllBuses(role: UserRole): boolean {
  return [
    'super_admin',
    'school_admin',
    'principal',
    'transport_incharge',
    'coordinator',
    'teacher',
  ].includes(role);
}

export function canRoleManageTransport(role: UserRole): boolean {
  return ['super_admin', 'school_admin', 'principal', 'transport_incharge'].includes(role);
}

export function canRoleMarkTransportAttendance(role: UserRole): boolean {
  return [
    'super_admin',
    'school_admin',
    'principal',
    'transport_incharge',
    'coordinator',
    'teacher',
  ].includes(role);
}

export function buildTransportRoleBundle(params: {
  role: UserRole;
  schoolId: string;
  routes: BusRoute[];
  allocations: StudentTransportAllocation[];
  attendanceToday: TransportDailyAttendanceRecord[];
  visibleStudentIds: Set<string>;
}): TransportWorkspaceBundle {
  const { role, schoolId, routes, allocations, attendanceToday, visibleStudentIds } = params;
  const schoolLocation = getSchoolGeoAnchor(schoolId);
  const allAccess = canRoleViewAllBuses(role);

  if (allAccess) {
    return {
      routes,
      allocations,
      attendanceToday,
      schoolLocation,
      gpsScope: 'all_buses',
      canManageRoutes: canRoleManageTransport(role),
      canMarkAttendance: canRoleMarkTransportAttendance(role),
      transportHelpline: '+91 98120 44100 (Transport Control Desk)',
    };
  }

  // Strict Parent / Student isolation: ONLY their linked student(s) and ONLY the allotted bus route(s)
  const myAllocations = allocations.filter((a) => visibleStudentIds.has(a.studentId));
  const myRouteIds = new Set(
    myAllocations
      .filter((a) => a.mode === 'Bus' && a.routeId)
      .map((a) => a.routeId as string),
  );
  const myRoutes = routes.filter((r) => myRouteIds.has(r.id));
  const myAttendance = attendanceToday.filter((a) => visibleStudentIds.has(a.studentId));

  return {
    routes: myRoutes,
    allocations: myAllocations,
    attendanceToday: myAttendance,
    schoolLocation,
    gpsScope: 'assigned_bus_only',
    canManageRoutes: false,
    canMarkAttendance: false,
    transportHelpline: '+91 98120 44100 (Transport Control Desk)',
  };
}
