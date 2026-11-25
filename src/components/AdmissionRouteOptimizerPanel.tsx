import React, { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Compass,
  Crosshair,
  Crown,
  Footprints,
  Gauge,
  Lock,
  MapPin,
  Navigation,
  Phone,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type {
  AdmissionLead,
  BusRoute,
  GeoPoint,
  RouteRecommendationResult,
  StudentTransportAllocation,
} from '../types';
import { apiRequest } from '../utils/api';
import {
  RAI_PLUS_LOGO_URL,
  optimizeBusRouteForAdmission,
} from '../utils/transportEngine';

interface AdmissionRouteOptimizerPanelProps {
  routes: BusRoute[];
  allocations: StudentTransportAllocation[];
  schoolLocation: { lat: number; lng: number; label: string };
  schoolId: string;
  leads?: AdmissionLead[];
  token?: string;
  initialGeo?: GeoPoint | null;
  initialLocality?: string;
  initialAddress?: string;
  compact?: boolean;
  googleMapsEnabled?: boolean;
  subscriptionPlan?: string;
  canUpgradePlan?: boolean;
  onUpgradeToPremium?: () => Promise<void>;
  onSelectLocationAndRoute?: (payload: {
    lat: number;
    lng: number;
    recommendation: RouteRecommendationResult | null;
  }) => void;
}

interface GoogleMapsPolylineInstance {
  setMap: (map: unknown | null) => void;
}

interface GoogleMapsRuntime {
  maps?: {
    Polyline?: new (opts: {
      path: Array<{ lat: number; lng: number }>;
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      icons?: Array<{
        icon: { path: string; strokeOpacity: number; scale: number };
        offset: string;
        repeat: string;
      }>;
      map: unknown;
    }) => GoogleMapsPolylineInstance;
  };
}

/**
 * Renders all active bus route polylines plus a gold dashed walking/connector line
 * from the student's residential pin to the #1 optimal boarding stop.
 */
const OptimizerMapOverlay: React.FC<{
  routes: BusRoute[];
  bestRoute: RouteRecommendationResult | null;
  studentGeo: GeoPoint | null;
}> = ({ routes, bestRoute, studentGeo }) => {
  const map = useMap();

  useEffect(() => {
    const gMaps = (window as unknown as { google?: GoogleMapsRuntime }).google?.maps;
    const PolylineCtor = gMaps?.Polyline;
    if (!map || !PolylineCtor) return;

    const polylines: GoogleMapsPolylineInstance[] = [];

    for (const route of routes) {
      if (!route.stops || route.stops.length < 2) continue;
      const isWinner = bestRoute?.routeId === route.id;
      const poly = new PolylineCtor({
        path: route.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
        geodesic: true,
        strokeColor: route.routeColor || '#142B46',
        strokeOpacity: isWinner ? 0.92 : 0.32,
        strokeWeight: isWinner ? 5 : 2.5,
        map,
      });
      polylines.push(poly);
    }

    if (
      studentGeo &&
      bestRoute &&
      Number.isFinite(bestRoute.stopLat) &&
      Number.isFinite(bestRoute.stopLng)
    ) {
      const connector = new PolylineCtor({
        path: [
          { lat: studentGeo.lat, lng: studentGeo.lng },
          { lat: bestRoute.stopLat!, lng: bestRoute.stopLng! },
        ],
        geodesic: true,
        strokeColor: '#D6B66D',
        strokeOpacity: 0,
        strokeWeight: 3,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 3,
            },
            offset: '0',
            repeat: '12px',
          },
        ],
        map,
      });
      polylines.push(connector);
    }

    return () => {
      for (const p of polylines) p.setMap(null);
    };
  }, [map, routes, bestRoute, studentGeo]);

  useEffect(() => {
    if (!map || !studentGeo) return;
    map.panTo(studentGeo);
  }, [map, studentGeo]);

  return null;
};

export const AdmissionRouteOptimizerPanel: React.FC<AdmissionRouteOptimizerPanelProps> = ({
  routes,
  allocations,
  schoolLocation,
  schoolId,
  leads = [],
  token,
  initialGeo = null,
  initialLocality = '',
  initialAddress = '',
  compact = false,
  googleMapsEnabled = true,
  subscriptionPlan = 'Growth ERP',
  canUpgradePlan = false,
  onUpgradeToPremium,
  onSelectLocationAndRoute,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';

  const [studentGeo, setStudentGeo] = useState<GeoPoint | null>(initialGeo);
  const [latInput, setLatInput] = useState<string>(
    initialGeo ? initialGeo.lat.toFixed(5) : '',
  );
  const [lngInput, setLngInput] = useState<string>(
    initialGeo ? initialGeo.lng.toFixed(5) : '',
  );
  const [addressQuery, setAddressQuery] = useState<string>(
    [initialAddress, initialLocality].filter(Boolean).join(', '),
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [simulateFullRouteId, setSimulateFullRouteId] = useState<string>('');
  const [geocodingBusy, setGeocodingBusy] = useState<boolean>(false);
  const [upgradingPlan, setUpgradingPlan] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGeo) {
      setStudentGeo(initialGeo);
      setLatInput(initialGeo.lat.toFixed(5));
      setLngInput(initialGeo.lng.toFixed(5));
    }
  }, [initialGeo?.lat, initialGeo?.lng]);

  // Apply optional "What-If Capacity Full" simulation so admins can verify overflow rerouting live
  const effectiveAllocations = useMemo(() => {
    if (!simulateFullRouteId) return allocations;
    const targetRoute = routes.find((r) => r.id === simulateFullRouteId);
    if (!targetRoute) return allocations;
    const currentAssigned = allocations.filter(
      (a) => a.mode === 'Bus' && a.routeId === targetRoute.id,
    ).length;
    const needed = Math.max(0, targetRoute.capacity - currentAssigned);
    if (needed === 0) return allocations;
    const synthetic: StudentTransportAllocation[] = Array.from({ length: needed }).map((_, i) => ({
      studentId: `sim-cap-${targetRoute.id}-${i}`,
      schoolId,
      mode: 'Bus',
      routeId: targetRoute.id,
      areaLocality: targetRoute.areasCovered[0] || 'Simulated',
      assignedBy: 'Capacity Simulator',
      assignedAt: new Date().toISOString(),
    }));
    return [...allocations, ...synthetic];
  }, [allocations, routes, simulateFullRouteId, schoolId]);

  const optimization = useMemo(
    () =>
      optimizeBusRouteForAdmission({
        residentialGeo: studentGeo,
        locality: initialLocality || addressQuery,
        address: initialAddress || addressQuery,
        routes,
        allocations: effectiveAllocations,
        schoolLocation,
      }),
    [
      studentGeo,
      initialLocality,
      initialAddress,
      addressQuery,
      routes,
      effectiveAllocations,
      schoolLocation,
    ],
  );

  const commitPoint = (pt: GeoPoint, notice?: string) => {
    const clean = {
      lat: Number(pt.lat.toFixed(5)),
      lng: Number(pt.lng.toFixed(5)),
    };
    setStudentGeo(clean);
    setLatInput(clean.lat.toFixed(5));
    setLngInput(clean.lng.toFixed(5));
    setGeoError(null);
    if (notice) setGeoNotice(notice);

    const freshOpt = optimizeBusRouteForAdmission({
      residentialGeo: clean,
      locality: initialLocality || addressQuery,
      address: initialAddress || addressQuery,
      routes,
      allocations: effectiveAllocations,
      schoolLocation,
    });
    if (onSelectLocationAndRoute) {
      onSelectLocationAndRoute({
        lat: clean.lat,
        lng: clean.lng,
        recommendation: freshOpt.bestRoute,
      });
    }
  };

  const handleGeocodeSearch = async () => {
    if (!googleMapsEnabled) {
      setGeoError(
        `Google Maps address geocoding requires a Premium package (current plan: ${subscriptionPlan}). Enter latitude/longitude manually or use Quick Corridor Test Pins below.`,
      );
      return;
    }
    if (!addressQuery.trim()) {
      setGeoError('Enter a residential sector, landmark, or street address to locate.');
      return;
    }
    setGeoError(null);
    setGeoNotice(null);
    setGeocodingBusy(true);
    try {
      const res = await apiRequest<{
        lat: number;
        lng: number;
        formattedAddress?: string;
        source?: string;
        quotaExceeded?: boolean;
      }>(
        '/api/transport/geocode-address',
        {
          method: 'POST',
          body: JSON.stringify({
            schoolId,
            address: addressQuery.trim(),
            locality: initialLocality || addressQuery.trim(),
          }),
        },
        token || undefined,
      );
      if (res.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (Number.isFinite(res.lat) && Number.isFinite(res.lng)) {
        commitPoint(
          { lat: res.lat, lng: res.lng },
          `Located: ${res.formattedAddress || addressQuery} (${res.lat.toFixed(5)}, ${res.lng.toFixed(5)})`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Address lookup failed.';
      if (message.toLowerCase().includes('quota')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      setGeoError(message);
    } finally {
      setGeocodingBusy(false);
    }
  };

  const handleUseBrowserGps = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Browser geolocation is unavailable. Click directly on the map instead.');
      return;
    }
    setGeocodingBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeocodingBusy(false);
        commitPoint(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          'Captured current device GPS coordinates.',
        );
      },
      () => {
        setGeocodingBusy(false);
        setGeoError('Location permission denied or unavailable. Click anywhere on the map to drop the home pin.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleApplyManualCoords = () => {
    const la = Number(latInput);
    const ln = Number(lngInput);
    if (!Number.isFinite(la) || !Number.isFinite(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setGeoError('Enter valid decimal latitude (-90..90) and longitude (-180..180).');
      return;
    }
    commitPoint({ lat: la, lng: ln }, `Applied residential coordinates (${la.toFixed(5)}, ${ln.toFixed(5)}).`);
  };

  const handlePickAdmissionLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setAddressQuery([lead.address, lead.locality].filter(Boolean).join(', '));
    if (Number.isFinite(lead.residentialLat) && Number.isFinite(lead.residentialLng)) {
      commitPoint(
        { lat: lead.residentialLat!, lng: lead.residentialLng! },
        `Loaded saved residential pin for ${lead.studentName} (${lead.applyingClass}).`,
      );
    } else {
      setStudentGeo(null);
      setLatInput('');
      setLngInput('');
      setGeoNotice(
        `Loaded ${lead.studentName} (${lead.locality || 'No locality'}). Click "Locate" or drop a pin on the map to compute exact geolocation efficiency.`,
      );
    }
  };

  const best = optimization.bestRoute;

  return (
    <div className="space-y-4">
      {/* Header & Controls Card */}
      <div className="rounded-2xl border border-[#142B46]/15 bg-[#FAF4EC] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#142B46]">
              <Compass className="h-3.5 w-3.5 text-[#D6B66D]" />
              Geolocation + Capacity Efficiency Engine
            </div>
            <h3 className="mt-0.5 font-display text-base sm:text-lg font-bold text-[#142B46]">
              {compact
                ? 'Pin Student Residence for Exact Route Efficiency'
                : 'New Admission Bus Route Efficiency Optimizer'}
            </h3>
            <p className="text-xs text-slate-600">
              Scores every active bus using Haversine proximity to stops (45%), route-corridor detour cost (25%), live seat capacity load-balancing with full-bus overflow (25%), and GPS readiness (5%).
            </p>
          </div>

          {!compact && leads.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <select
                aria-label="Load an admission enquiry"
                value={selectedLeadId}
                onChange={(e) => handlePickAdmissionLead(e.target.value)}
                className="rounded-xl border border-[#142B46]/20 bg-white px-3 py-2 text-xs font-semibold text-[#142B46]"
              >
                <option value="">Test Custom Residence or Pick Lead…</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.studentName} ({l.applyingClass}) · {l.locality || 'Unspecified'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Address Lookup + Manual Lat/Lng + Device GPS */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-12">
          <div className="flex gap-2 lg:col-span-5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Residential address or locality for geocoding"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Search home address, sector, or landmark..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs"
              />
            </div>
            <button
              type="button"
              disabled={geocodingBusy}
              onClick={() => void handleGeocodeSearch()}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold disabled:opacity-60 whitespace-nowrap ${
                googleMapsEnabled
                  ? 'bg-[#142B46] text-white hover:bg-[#1e3d63]'
                  : 'border border-[#D6B66D] bg-[#F3E6D8] text-[#142B46] hover:bg-[#EAD9C4]'
              }`}
            >
              {googleMapsEnabled ? (
                <MapPin className="h-3.5 w-3.5 text-[#D6B66D]" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-[#7B5D1C]" />
              )}
              {geocodingBusy ? 'Locating…' : googleMapsEnabled ? 'Locate' : 'Locate (Premium)'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:col-span-7">
            <input
              type="number"
              step="0.00001"
              aria-label="Residential latitude"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="Latitude (e.g. 28.6245)"
              className="w-36 rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs"
            />
            <input
              type="number"
              step="0.00001"
              aria-label="Residential longitude"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              placeholder="Longitude (e.g. 76.6533)"
              className="w-36 rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleApplyManualCoords}
              className="rounded-xl border border-[#142B46]/25 bg-white px-3 py-2 text-xs font-bold text-[#142B46] hover:bg-[#F3E6D8]"
            >
              Apply Pin
            </button>
            <button
              type="button"
              onClick={handleUseBrowserGps}
              className="inline-flex items-center gap-1 rounded-xl border border-[#6E987A] bg-[#6E987A]/15 px-3 py-2 text-xs font-bold text-[#142B46] hover:bg-[#6E987A]/25"
            >
              <Crosshair className="h-3.5 w-3.5 text-[#3D6349]" />
              Use GPS
            </button>
          </div>
        </div>

        {/* Quick Corridor Reference Pins (from school's own operational route stops) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-semibold text-slate-600">Quick Corridor Test Pins:</span>
          {routes.slice(0, 5).map((r) => {
            const sampleStop = r.stops.find((s) => s.area !== 'School Campus') || r.stops[0];
            if (!sampleStop) return null;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() =>
                  commitPoint(
                    {
                      lat: Number((sampleStop.lat + 0.0018).toFixed(5)),
                      lng: Number((sampleStop.lng - 0.0014).toFixed(5)),
                    },
                    `Pinned residence near ${sampleStop.name} (${sampleStop.area}).`,
                  )
                }
                className="rounded-lg border border-[#142B46]/15 bg-white px-2.5 py-1 font-semibold text-[#142B46] hover:border-[#D6B66D] hover:bg-[#F3E6D8]"
              >
                Near {sampleStop.area} ({r.routeCode})
              </button>
            );
          })}

          {!compact && routes.length > 1 && (
            <label className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
              <span>Simulate Full Bus:</span>
              <select
                aria-label="Simulate bus at full capacity"
                value={simulateFullRouteId}
                onChange={(e) => setSimulateFullRouteId(e.target.value)}
                className="rounded bg-white px-1.5 py-0.5 text-[11px] font-bold text-amber-950"
              >
                <option value="">Live Capacities</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Fill {r.routeCode} to 100%
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {geoNotice && (
          <div className="rounded-lg border border-[#6E987A]/40 bg-white px-3 py-2 text-xs font-medium text-[#142B46]">
            {geoNotice}
          </div>
        )}
        {geoError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
            {geoError}
          </div>
        )}
      </div>

      {/* Interactive Google Map Pin-Drop Surface — Premium Packages Only */}
      {!googleMapsEnabled ? (
        <div
          data-testid="optimizer-maps-premium-gate"
          className="rounded-2xl border border-[#D6B66D] bg-[#FAF4EC] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#142B46] text-[#D6B66D] flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
                Google Maps Pin-Drop &amp; Geocoding · Premium Package Only ({subscriptionPlan})
              </p>
              <p className="text-xs font-semibold text-[#142B46]">
                Interactive Google Maps pin-drop is unlocked on Premium Campus &amp; Enterprise 360° plans.
              </p>
              <p className="text-xs text-slate-600">
                You can still compute exact Haversine + Capacity efficiency scores right now using
                manual Latitude/Longitude, Device GPS, or Quick Corridor Test Pins above.
              </p>
            </div>
          </div>

          {canUpgradePlan && onUpgradeToPremium && (
            <button
              type="button"
              disabled={upgradingPlan}
              onClick={async () => {
                setUpgradingPlan(true);
                try {
                  await onUpgradeToPremium();
                } finally {
                  setUpgradingPlan(false);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Crown className="h-3.5 w-3.5 text-[#D6B66D]" />
              {upgradingPlan ? 'Upgrading...' : 'Upgrade to Premium'}
            </button>
          )}
        </div>
      ) : apiKey ? (
        <div className="rounded-2xl border border-[#D9C9B6] bg-white overflow-hidden shadow-xs">
          <div className="bg-[#142B46] px-4 py-2.5 text-xs text-[#FAF4EC] flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-[#D6B66D]" />
              Click anywhere on the map to place the student&apos;s residential pin
            </span>
            {studentGeo && (
              <span className="font-mono text-[11px] text-[#D6B66D]">
                Home Pin: {studentGeo.lat.toFixed(5)}, {studentGeo.lng.toFixed(5)}
              </span>
            )}
          </div>
          <div className={compact ? 'h-[300px] w-full' : 'h-[380px] w-full'}>
            <APIProvider apiKey={apiKey} libraries={['marker']} language="en" region="IN">
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={studentGeo || schoolLocation}
                defaultZoom={12}
                gestureHandling="greedy"
                streetViewControl={false}
                mapTypeControl={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                onClick={(ev) => {
                  const latLng = ev.detail?.latLng;
                  if (latLng && Number.isFinite(latLng.lat) && Number.isFinite(latLng.lng)) {
                    commitPoint(
                      { lat: latLng.lat, lng: latLng.lng },
                      `Dropped residential pin at ${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}.`,
                    );
                  }
                }}
              >
                <OptimizerMapOverlay
                  routes={routes}
                  bestRoute={best}
                  studentGeo={studentGeo}
                />

                {/* School Campus Marker */}
                <AdvancedMarker position={schoolLocation} title={schoolLocation.label}>
                  <div className="flex items-center gap-1 rounded-lg border-2 border-[#D6B66D] bg-[#142B46] px-2 py-1 text-white shadow-md">
                    <img
                      src={RAI_PLUS_LOGO_URL}
                      alt="School Campus"
                      className="h-4 w-4 rounded object-cover bg-[#F3E6D8]"
                    />
                    <span className="text-[10px] font-bold whitespace-nowrap">Campus</span>
                  </div>
                </AdvancedMarker>

                {/* Recommended Boarding Stop Marker */}
                {best && Number.isFinite(best.stopLat) && Number.isFinite(best.stopLng) && (
                  <AdvancedMarker
                    position={{ lat: best.stopLat!, lng: best.stopLng! }}
                    title={`Optimal Stop: ${best.stopName} (${best.routeCode})`}
                  >
                    <div className="flex items-center gap-1 rounded-lg border-2 border-white bg-[#6E987A] px-2.5 py-1 text-white shadow-md">
                      <Bus className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold whitespace-nowrap">
                        {best.routeCode}: {best.stopName}
                      </span>
                    </div>
                  </AdvancedMarker>
                )}

                {/* Student Residential Pin */}
                {studentGeo && (
                  <AdvancedMarker
                    position={studentGeo}
                    title="Student Residential Geolocation"
                  >
                    <div className="flex items-center gap-1 rounded-lg border-2 border-[#142B46] bg-[#D6B66D] px-2.5 py-1 text-[#142B46] shadow-lg">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-extrabold whitespace-nowrap">
                        Student Home
                      </span>
                    </div>
                  </AdvancedMarker>
                )}
              </GoogleMap>
            </APIProvider>
          </div>
        </div>
      ) : null}

      {/* Algorithm Decision Summary + Overflow / Walkable Alerts */}
      {best && (
        <div className="space-y-3">
          {optimization.capacityOverflowTriggered && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Capacity Overflow Protection Triggered:</span>{' '}
                Geographically closest route{' '}
                <strong>{optimization.overflowedClosestRouteCode}</strong> is at 100% capacity.
                Automatically rerouted to the next most efficient route with open seats (
                <strong>{best.routeCode}</strong>).
              </div>
            </div>
          )}

          {optimization.walkableCampusZone && optimization.distanceToCampusKm !== null && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#6E987A] bg-[#6E987A]/10 px-4 py-3 text-xs text-[#142B46]">
              <Footprints className="h-4 w-4 shrink-0 text-[#3D6349] mt-0.5" />
              <div>
                <span className="font-bold">Walkable Campus Zone Detected:</span> Residence is only{' '}
                <strong className="font-mono">{optimization.distanceToCampusKm} km</strong> from
                campus. Eligible for <strong>Walker / Self-Drop</strong> (zero transport fee), or
                allot <strong>{best.routeCode}</strong> below if parent requests school bus service.
              </div>
            </div>
          )}

          {/* #1 Optimal Route Spotlight Card */}
          <div className="rounded-2xl border-2 border-[#D6B66D] bg-[#142B46] p-5 text-[#FAF4EC] shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#D6B66D] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#142B46]">
                    <Sparkles className="h-3 w-3" />
                    #1 Most Efficient Route
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#A9C5D8]">
                    {best.confidence}
                  </span>
                  {best.boardingRecommendation && (
                    <span className="rounded-md bg-[#6E987A]/25 px-2 py-0.5 text-[10px] font-semibold text-[#A8D5B5]">
                      {best.boardingRecommendation}
                    </span>
                  )}
                </div>
                <h4 className="font-display text-lg font-bold text-white">
                  {best.routeCode} · {best.routeName}
                </h4>
                <p className="text-xs text-[#FAF4EC]/90">
                  Nearest Stop: <strong>{best.stopName}</strong> (AM{' '}
                  <span className="font-mono">{best.pickupTime}</span> / PM{' '}
                  <span className="font-mono">{best.dropTime}</span>) · Bus{' '}
                  <span className="font-mono">{best.busNumber}</span> · Driver:{' '}
                  <strong>{best.driverName}</strong> ({best.driverPhone})
                </p>
                <p className="text-[11px] text-[#A9C5D8]">{optimization.summaryExplanation}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase text-[#A9C5D8]">Efficiency</div>
                  <div className="font-mono text-xl font-extrabold text-[#D6B66D]">
                    {best.efficiencyScore ?? 0}
                    <span className="text-xs font-normal text-white/70">/100</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase text-[#A9C5D8]">To Stop</div>
                  <div className="font-mono text-lg font-bold text-white">
                    {best.distanceToStopKm !== undefined ? `${best.distanceToStopKm} km` : 'Text'}
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase text-[#A9C5D8]">Bus Detour</div>
                  <div className="font-mono text-lg font-bold text-[#A8D5B5]">
                    {best.marginalDetourKm !== undefined
                      ? `${best.marginalDetourKm} km`
                      : '0 km'}
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase text-[#A9C5D8]">Open Seats</div>
                  <div className="font-mono text-lg font-bold text-white">
                    {best.availableSeats}/{best.capacity}
                  </div>
                </div>
              </div>
            </div>

            {/* Weighted Score Breakdown Bars */}
            {best.scoreBreakdown && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 pt-3 text-[11px]">
                {[
                  { label: 'Proximity (45%)', val: best.scoreBreakdown.proximityScore },
                  { label: 'Detour Efficiency (25%)', val: best.scoreBreakdown.detourScore },
                  { label: 'Capacity Balance (25%)', val: best.scoreBreakdown.capacityScore },
                  { label: 'GPS & Area Fit (5%)', val: best.scoreBreakdown.readinessScore },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex justify-between text-[#FAF4EC]/85">
                      <span>{metric.label}</span>
                      <span className="font-mono font-bold text-[#D6B66D]">{metric.val}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D6B66D]"
                        style={{ width: `${metric.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Active Routes Ranked Comparison Table */}
          {!compact && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="border-b border-slate-200 bg-[#FAF4EC] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#142B46]">
                  <Gauge className="h-4 w-4 text-[#D6B66D]" />
                  All Bus Routes Ranked by Geolocation + Capacity Efficiency (
                  {optimization.rankedCandidates.length} Routes)
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  Mode:{' '}
                  {optimization.algorithmMode === 'geolocation_and_capacity'
                    ? 'Exact Geolocation + Capacity'
                    : 'Locality Text + Capacity'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="px-3.5 py-2.5">Rank &amp; Route</th>
                      <th className="px-3.5 py-2.5">Nearest Boarding Stop</th>
                      <th className="px-3.5 py-2.5 text-right">Stop Dist.</th>
                      <th className="px-3.5 py-2.5 text-right">Detour Cost</th>
                      <th className="px-3.5 py-2.5">Capacity &amp; Post-Load</th>
                      <th className="px-3.5 py-2.5 text-right">Efficiency</th>
                      <th className="px-3.5 py-2.5">Status / Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {optimization.rankedCandidates.map((cand) => {
                      const isTop = cand.rank === 1 && cand.availableSeats > 0;
                      const isFull = cand.availableSeats <= 0;
                      return (
                        <tr
                          key={cand.routeId}
                          className={
                            isTop
                              ? 'bg-[#FAF4EC]/80'
                              : isFull
                                ? 'bg-rose-50/40 text-slate-500'
                                : 'hover:bg-slate-50'
                          }
                        >
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                                  isTop
                                    ? 'bg-[#142B46] text-[#D6B66D]'
                                    : isFull
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                #{cand.rank}
                              </span>
                              <div>
                                <div className="font-bold text-[#142B46]">
                                  {cand.routeCode} · {cand.busNumber}
                                </div>
                                <div className="text-[11px] text-slate-500">{cand.routeName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="font-semibold text-slate-800">{cand.stopName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>AM {cand.pickupTime}</span>
                              <span>·</span>
                              <Phone className="h-3 w-3" />
                              <span>{cand.driverName}</span>
                            </div>
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono font-bold text-[#142B46]">
                            {cand.distanceToStopKm !== undefined ? `${cand.distanceToStopKm} km` : '—'}
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono text-slate-700">
                            {cand.marginalDetourKm !== undefined ? (
                              <div>
                                <div className="font-bold">{cand.marginalDetourKm} km</div>
                                <div className="text-[10px] text-slate-500">
                                  +{cand.estimatedDetourMinutes || 0} min
                                </div>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3.5 py-3 min-w-[150px]">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="inline-flex items-center gap-1 font-bold text-[#142B46]">
                                <Users className="h-3 w-3" />
                                {cand.assignedCount}/{cand.capacity}
                              </span>
                              <span
                                className={
                                  isFull
                                    ? 'font-bold text-rose-700'
                                    : (cand.postAdmissionUtilizationPct || 0) > 90
                                      ? 'font-bold text-amber-700'
                                      : 'font-semibold text-[#3D6349]'
                                }
                              >
                                {isFull
                                  ? 'FULL'
                                  : `${cand.availableSeats} open (${cand.postAdmissionUtilizationPct}% post)`}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isFull
                                    ? 'bg-rose-600'
                                    : (cand.utilizationPct || 0) >= 85
                                      ? 'bg-amber-500'
                                      : 'bg-[#6E987A]'
                                }`}
                                style={{ width: `${Math.min(100, cand.utilizationPct || 0)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-3.5 py-3 text-right">
                            <span
                              className={`inline-block rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold ${
                                isTop
                                  ? 'bg-[#142B46] text-[#D6B66D]'
                                  : isFull
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {cand.efficiencyScore ?? 0}/100
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-[11px]">
                            {isTop ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#3D6349]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Optimal Match ({cand.boardingRecommendation})
                              </span>
                            ) : isFull ? (
                              <span className="font-semibold text-rose-700">
                                Skipped — Full Capacity
                              </span>
                            ) : (
                              <span className="text-slate-600">{cand.boardingRecommendation}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
