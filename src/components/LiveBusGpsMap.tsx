import React, { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Bus,
  Compass,
  Crown,
  Gauge,
  Lock,
  Navigation,
  Phone,
  Play,
  Pause,
  Radio,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import type { BusRoute } from '../types';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';

interface LiveBusGpsMapProps {
  routes: BusRoute[];
  schoolLocation: { lat: number; lng: number; label: string };
  gpsScope: 'all_buses' | 'assigned_bus_only';
  studentCountByRouteId?: Record<string, number>;
  canSimulateGps?: boolean;
  onSimulateStep?: () => Promise<void>;
  onRefreshLiveGps?: () => Promise<void>;
  focusedRouteId?: string | null;
  onSelectRoute?: (routeId: string | null) => void;
  googleMapsEnabled?: boolean;
  subscriptionPlan?: string;
  canUpgradePlan?: boolean;
  onUpgradeToPremium?: () => Promise<void>;
}

interface RouteOverlayProps {
  routes: BusRoute[];
  focusedRouteId: string | null;
  schoolLocation: { lat: number; lng: number };
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
      map: unknown;
    }) => GoogleMapsPolylineInstance;
  };
}

/**
 * Draws colored route polylines connecting stops using the official Maps JS Polyline API
 * via useMap() and smoothly pans to a focused bus when selected.
 */
const RoutePolylinesAndFocus: React.FC<RouteOverlayProps> = ({
  routes,
  focusedRouteId,
  schoolLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    const gMaps = (window as unknown as { google?: GoogleMapsRuntime }).google?.maps;
    const PolylineCtor = gMaps?.Polyline;
    if (!map || !PolylineCtor) return;

    const polylines: GoogleMapsPolylineInstance[] = [];
    for (const route of routes) {
      if (!route.stops || route.stops.length < 2) continue;
      const isFocused = !focusedRouteId || focusedRouteId === route.id;
      const path = route.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
      const polyline = new PolylineCtor({
        path,
        geodesic: true,
        strokeColor: route.routeColor || '#142B46',
        strokeOpacity: isFocused ? 0.85 : 0.25,
        strokeWeight: isFocused ? 4 : 2,
        map,
      });
      polylines.push(polyline);
    }

    return () => {
      for (const poly of polylines) {
        poly.setMap(null);
      }
    };
  }, [map, routes, focusedRouteId]);

  useEffect(() => {
    if (!map) return;
    if (focusedRouteId) {
      const target = routes.find((r) => r.id === focusedRouteId);
      if (target && Number.isFinite(target.currentLat) && Number.isFinite(target.currentLng)) {
        map.panTo({ lat: target.currentLat, lng: target.currentLng });
        map.setZoom(13);
        return;
      }
    }
    if (routes.length === 1 && routes[0].gpsEnabled) {
      map.panTo({ lat: routes[0].currentLat, lng: routes[0].currentLng });
      map.setZoom(13);
    } else if (!focusedRouteId) {
      map.panTo(schoolLocation);
      map.setZoom(12);
    }
  }, [map, focusedRouteId, routes, schoolLocation]);

  return null;
};

function formatPingTime(iso?: string): string {
  if (!iso) return 'Just now';
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Live';
  }
}

export const LiveBusGpsMap: React.FC<LiveBusGpsMapProps> = ({
  routes,
  schoolLocation,
  gpsScope,
  studentCountByRouteId = {},
  canSimulateGps = false,
  onSimulateStep,
  onRefreshLiveGps,
  focusedRouteId = null,
  onSelectRoute,
  googleMapsEnabled = true,
  subscriptionPlan = 'Growth ERP',
  canUpgradePlan = false,
  onUpgradeToPremium,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  const [internalFocusId, setInternalFocusId] = useState<string | null>(focusedRouteId);
  const [infoRouteId, setInfoRouteId] = useState<string | null>(
    gpsScope === 'assigned_bus_only' && routes[0]?.gpsEnabled ? routes[0].id : null,
  );
  const [autoTrack, setAutoTrack] = useState(false);
  const [busyPing, setBusyPing] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState(false);

  useEffect(() => {
    setInternalFocusId(focusedRouteId);
    if (focusedRouteId) {
      const rt = routes.find((r) => r.id === focusedRouteId);
      if (rt?.gpsEnabled) setInfoRouteId(focusedRouteId);
    }
  }, [focusedRouteId, routes]);

  const activeFocusId = onSelectRoute ? focusedRouteId : internalFocusId;

  const setFocus = (id: string | null) => {
    if (onSelectRoute) {
      onSelectRoute(id);
    } else {
      setInternalFocusId(id);
    }
    if (id) {
      const rt = routes.find((r) => r.id === id);
      if (rt?.gpsEnabled) setInfoRouteId(id);
    }
  };

  useEffect(() => {
    if (!autoTrack || !googleMapsEnabled) return;
    const timer = window.setInterval(() => {
      if (canSimulateGps && onSimulateStep) {
        void onSimulateStep();
      } else if (onRefreshLiveGps) {
        void onRefreshLiveGps();
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [autoTrack, googleMapsEnabled, canSimulateGps, onSimulateStep, onRefreshLiveGps]);

  const gpsRoutes = useMemo(() => routes.filter((r) => r.gpsEnabled), [routes]);
  const nonGpsRoutes = useMemo(() => routes.filter((r) => !r.gpsEnabled), [routes]);
  const selectedInfoRoute = useMemo(
    () => gpsRoutes.find((r) => r.id === infoRouteId) || null,
    [gpsRoutes, infoRouteId],
  );

  const defaultCenter = useMemo(() => {
    if (gpsScope === 'assigned_bus_only' && gpsRoutes.length === 1) {
      return { lat: gpsRoutes[0].currentLat, lng: gpsRoutes[0].currentLng };
    }
    return { lat: schoolLocation.lat, lng: schoolLocation.lng };
  }, [gpsScope, gpsRoutes, schoolLocation]);

  async function handleManualStep() {
    if (!onSimulateStep) return;
    setBusyPing(true);
    try {
      await onSimulateStep();
    } finally {
      setBusyPing(false);
    }
  }

  async function handleManualRefresh() {
    if (!onRefreshLiveGps) return;
    setBusyPing(true);
    try {
      await onRefreshLiveGps();
    } finally {
      setBusyPing(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#D9C9B6] bg-white overflow-hidden shadow-xs">
      {/* Top Telemetry Bar */}
      <div className="bg-[#142B46] text-[#F3E6D8] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-[#1E3B5C] border border-[#D6B66D]/40 flex items-center justify-center shrink-0">
            {gpsScope === 'assigned_bus_only' ? (
              <Lock className="h-4 w-4 text-[#D6B66D]" />
            ) : (
              <Radio className="h-4 w-4 text-[#6E987A]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
              <span>
                {gpsScope === 'assigned_bus_only'
                  ? 'Live GPS Bus Tracker — Allotted Bus Only'
                  : `Live School Fleet GPS Control (${gpsRoutes.length} GPS Active)`}
              </span>
              {!googleMapsEnabled ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#D6B66D]/20 border border-[#D6B66D]/60 px-2 py-0.5 text-[10px] font-semibold text-[#D6B66D]">
                  <Crown className="h-3 w-3" />
                  Google Maps: Premium Only
                </span>
              ) : gpsScope === 'assigned_bus_only' ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#1E3B5C] border border-[#D6B66D]/50 px-2 py-0.5 text-[10px] font-semibold text-[#D6B66D]">
                  <ShieldCheck className="h-3 w-3" />
                  Parent Privacy Locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-[#6E987A]/20 border border-[#6E987A]/50 px-2 py-0.5 text-[10px] font-semibold text-[#A8D5B5]">
                  All Buses Visible at Once
                </span>
              )}
            </p>
            <p className="text-[11px] text-[#A9C5D8] truncate mt-0.5">
              {!googleMapsEnabled
                ? `Active Plan: ${subscriptionPlan} · Upgrade to Premium Campus or Enterprise 360° to unlock live Google Maps bus tracking.`
                : gpsScope === 'assigned_bus_only'
                  ? 'Showing only your child’s allotted GPS-enabled bus and campus destination.'
                  : `${schoolLocation.label} · Click any bus marker for live speed, current stop & driver contact.`}
            </p>
          </div>
        </div>

        {googleMapsEnabled && (
          <div className="flex flex-wrap items-center gap-2">
            {gpsScope === 'all_buses' && gpsRoutes.length > 1 && (
              <select
                aria-label="Focus specific bus on GPS map"
                value={activeFocusId || ''}
                onChange={(e) => setFocus(e.target.value || null)}
                className="rounded-lg border border-[#2F5076] bg-[#0F2238] px-2.5 py-1.5 text-xs font-medium text-[#F3E6D8] focus:border-[#D6B66D] focus:outline-none"
              >
                <option value="">All GPS Buses ({gpsRoutes.length})</option>
                {gpsRoutes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.routeCode} · {rt.busNumber} ({rt.driverName})
                  </option>
                ))}
              </select>
            )}

            {canSimulateGps && onSimulateStep && (
              <>
                <button
                  type="button"
                  disabled={busyPing}
                  onClick={() => void handleManualStep()}
                  data-testid="gps-ping-step-btn"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6B66D] px-3 py-1.5 text-xs font-bold text-[#142B46] hover:bg-[#DFC37E] disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {busyPing ? 'Pinging...' : 'Ping GPS Step'}
                </button>
                <button
                  type="button"
                  onClick={() => setAutoTrack((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    autoTrack
                      ? 'border-[#6E987A] bg-[#6E987A] text-white'
                      : 'border-[#2F5076] bg-[#1E3B5C] text-[#F3E6D8] hover:bg-[#284B73]'
                  }`}
                >
                  {autoTrack ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {autoTrack ? 'Live Moving (5s)' : 'Auto-Track Live'}
                </button>
              </>
            )}

            {!canSimulateGps && onRefreshLiveGps && (
              <button
                type="button"
                disabled={busyPing}
                onClick={() => void handleManualRefresh()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2F5076] bg-[#1E3B5C] px-3 py-1.5 text-xs font-semibold text-[#F3E6D8] hover:bg-[#284B73] disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${busyPing ? 'animate-spin' : ''}`} />
                Refresh Location
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Map Surface — Strictly Gated to Premium Packages (Zero SDK load on Standard plans) */}
      {!googleMapsEnabled ? (
        <div
          data-testid="live-gps-premium-gate"
          className="p-6 bg-[#FAF4EC] space-y-5"
        >
          <div className="rounded-xl border border-[#D6B66D] bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#142B46] text-[#D6B66D] flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
                  Premium Package Entitlement Required · Current Plan: {subscriptionPlan}
                </p>
                <h3 className="font-display text-base font-bold text-[#142B46]">
                  Live Google Maps GPS Tracking is Reserved for Premium Packages
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl">
                  Interactive Google Maps fleet telemetry, parent live-bus tracking, and address
                  geocoding are included exclusively in <strong>Premium Campus</strong> and{' '}
                  <strong>Enterprise 360°</strong> plans. Route rosters, driver contact details,
                  and morning/evening boarding attendance remain fully active on your current plan.
                </p>
              </div>
            </div>

            {canUpgradePlan && onUpgradeToPremium ? (
              <button
                type="button"
                disabled={upgradingPlan}
                data-testid="upgrade-maps-premium-btn"
                onClick={async () => {
                  setUpgradingPlan(true);
                  try {
                    await onUpgradeToPremium();
                  } finally {
                    setUpgradingPlan(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2.5 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Crown className="h-3.5 w-3.5 text-[#D6B66D]" />
                {upgradingPlan ? 'Upgrading...' : 'Upgrade to Premium Campus'}
              </button>
            ) : (
              <span className="text-xs font-semibold text-[#7B5D1C] whitespace-nowrap">
                Contact School Principal / Admin to Upgrade
              </span>
            )}
          </div>

          {routes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {routes.map((route) => {
                const stop = route.stops[route.currentStopIndex] || route.stops[0];
                return (
                  <div
                    key={route.id}
                    className="rounded-xl border border-[#D9C9B6] bg-white p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#142B46]">
                        {route.routeCode} · {route.routeName}
                      </p>
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        {route.busNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Driver: <strong className="text-[#142B46]">{route.driverName}</strong> ·{' '}
                      <a
                        href={`tel:${route.driverPhone.replace(/\s+/g, '')}`}
                        className="font-mono font-semibold text-[#142B46] underline"
                      >
                        {route.driverPhone}
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Next Scheduled Stop: <strong className="text-slate-700">{stop?.name || 'Campus'}</strong>
                      {studentCountByRouteId[route.id] !== undefined && (
                        <>
                          {' · '}
                          <span className="font-mono tabular-nums">
                            {studentCountByRouteId[route.id]}/{route.capacity} seats
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : gpsRoutes.length === 0 ? (
        <div className="p-8 bg-[#FAF4EC] text-center space-y-2">
          <WifiOff className="h-8 w-8 text-[#7B5D1C] mx-auto" />
          <p className="font-display text-base font-bold text-[#142B46]">
            No GPS Hardware Installed on Displayed Bus Route
          </p>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Live map tracking is available only for buses equipped with an active GPS transponder.
            Please use the driver’s direct phone number listed below for real-time updates.
          </p>
        </div>
      ) : apiKey ? (
        <div className="relative h-[460px] w-full bg-[#EFE7DC]" data-testid="google-maps-gps-canvas">
          <APIProvider apiKey={apiKey} libraries={['marker']} language="en" region="IN">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              defaultCenter={defaultCenter}
              defaultZoom={gpsScope === 'assigned_bus_only' ? 13 : 12}
              gestureHandling="greedy"
              streetViewControl={false}
              mapTypeControl={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <RoutePolylinesAndFocus
                routes={gpsRoutes}
                focusedRouteId={activeFocusId}
                schoolLocation={schoolLocation}
              />

              {/* School Campus Anchor Marker */}
              <AdvancedMarker
                position={{ lat: schoolLocation.lat, lng: schoolLocation.lng }}
                title={schoolLocation.label}
              >
                <div className="flex items-center gap-1.5 rounded-lg border-2 border-[#D6B66D] bg-[#142B46] px-2.5 py-1 text-white shadow-lg">
                  <img
                    src={RAI_PLUS_LOGO_URL}
                    alt="Rai Plus Campus"
                    className="h-5 w-5 rounded object-cover bg-[#F3E6D8]"
                  />
                  <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                    School Campus
                  </span>
                </div>
              </AdvancedMarker>

              {/* Live Bus GPS Markers */}
              {gpsRoutes.map((route) => {
                const isSelected = infoRouteId === route.id || activeFocusId === route.id;
                const currentStop =
                  route.stops[route.currentStopIndex] || route.stops[0];
                return (
                  <AdvancedMarker
                    key={route.id}
                    position={{ lat: route.currentLat, lng: route.currentLng }}
                    title={`${route.routeCode} · ${route.busNumber} · ${route.driverName}`}
                    onClick={() => {
                      setInfoRouteId(route.id);
                      setFocus(route.id);
                    }}
                  >
                    <div
                      className={`cursor-pointer transition-transform ${
                        isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className="flex items-center gap-1.5 rounded-lg border-2 border-white px-2.5 py-1.5 text-white shadow-lg"
                        style={{ backgroundColor: route.routeColor || '#142B46' }}
                      >
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <Bus className="h-3.5 w-3.5 shrink-0 text-[#D6B66D]" />
                        <span className="font-mono text-[11px] font-extrabold whitespace-nowrap">
                          {route.routeCode}
                        </span>
                        <span className="font-mono text-[10px] bg-black/25 rounded px-1 py-0.5 whitespace-nowrap tabular-nums">
                          {route.currentSpeedKmph} km/h
                        </span>
                      </div>
                      {currentStop && (
                        <div className="mt-0.5 text-center">
                          <span className="inline-block rounded bg-white/95 border border-slate-300 px-1.5 py-0.5 text-[9px] font-semibold text-[#142B46] shadow-xs max-w-[140px] truncate">
                            Near {currentStop.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Bus Telemetry InfoWindow */}
              {selectedInfoRoute && (
                <InfoWindow
                  position={{
                    lat: selectedInfoRoute.currentLat,
                    lng: selectedInfoRoute.currentLng,
                  }}
                  pixelOffset={[0, -34]}
                  onCloseClick={() => setInfoRouteId(null)}
                >
                  <div className="min-w-[235px] max-w-[270px] text-[#142B46] space-y-2 p-0.5">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
                      <div>
                        <p className="text-xs font-extrabold text-[#142B46]">
                          {selectedInfoRoute.routeCode} · {selectedInfoRoute.busNumber}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {selectedInfoRoute.routeName}
                        </p>
                      </div>
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 whitespace-nowrap">
                        {selectedInfoRoute.activeShift}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="rounded bg-[#FAF4EC] px-2 py-1">
                        <span className="text-[10px] text-slate-500 block">Speed</span>
                        <span className="font-mono font-bold tabular-nums">
                          {selectedInfoRoute.currentSpeedKmph} km/h
                        </span>
                      </div>
                      <div className="rounded bg-[#FAF4EC] px-2 py-1">
                        <span className="text-[10px] text-slate-500 block">Last Ping</span>
                        <span className="font-mono font-bold tabular-nums">
                          {formatPingTime(selectedInfoRoute.lastGpsPingAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <p className="text-slate-700">
                        <span className="font-semibold text-[#142B46]">Current Stop:</span>{' '}
                        {selectedInfoRoute.stops[selectedInfoRoute.currentStopIndex]?.name ||
                          'En Route'}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-[#142B46]">Driver:</span>{' '}
                        {selectedInfoRoute.driverName} ({selectedInfoRoute.driverExperienceYears} yrs)
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-[#142B46]">Driver Ph:</span>{' '}
                        <a
                          href={`tel:${selectedInfoRoute.driverPhone.replace(/\s+/g, '')}`}
                          className="font-mono font-semibold text-blue-900 underline"
                        >
                          {selectedInfoRoute.driverPhone}
                        </a>
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-[#142B46]">Attendant:</span>{' '}
                        {selectedInfoRoute.attendantName} ({selectedInfoRoute.attendantPhone})
                      </p>
                      {studentCountByRouteId[selectedInfoRoute.id] !== undefined && (
                        <p className="text-slate-600">
                          <span className="font-semibold text-[#142B46]">Allotted Students:</span>{' '}
                          <span className="font-mono font-bold">
                            {studentCountByRouteId[selectedInfoRoute.id]}/{selectedInfoRoute.capacity}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>
        </div>
      ) : (
        /* Graceful fallback telemetry board if API key is not configured in local env */
        <div className="p-5 bg-[#FAF4EC] space-y-3" data-testid="gps-fallback-telemetry-board">
          <div className="rounded-lg border border-[#D6B66D] bg-white px-4 py-3 text-xs text-[#142B46] flex items-center justify-between gap-3 flex-wrap">
            <span>
              <strong>Live GPS Telemetry Stream Active</strong> — Configure{' '}
              <code className="font-mono bg-[#FAF4EC] px-1.5 py-0.5 rounded">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              to render the interactive Google Maps satellite/road layer.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gpsRoutes.map((route) => {
              const stop = route.stops[route.currentStopIndex] || route.stops[0];
              return (
                <div
                  key={route.id}
                  className="rounded-lg border border-[#D9C9B6] bg-white p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#142B46]">
                      {route.routeCode} · {route.routeName}
                    </p>
                    <span className="font-mono text-[11px] font-bold text-[#3D6349] tabular-nums">
                      {route.currentSpeedKmph} km/h
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Bus: <strong className="font-mono">{route.busNumber}</strong> · Near{' '}
                    <strong>{stop?.name}</strong>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Compass className="h-3 w-3 text-[#7B5D1C]" />
                      {route.currentLat.toFixed(4)}, {route.currentLng.toFixed(4)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-[#3D6349]" />
                      Heading {route.headingDeg}°
                    </span>
                    <a
                      href={`tel:${route.driverPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 text-[#142B46] font-semibold underline"
                    >
                      <Phone className="h-3 w-3" />
                      {route.driverPhone}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-GPS Fleet Disclaimer Strip */}
      {nonGpsRoutes.length > 0 && (
        <div className="border-t border-[#E6D8C6] bg-[#FAF4EC] px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <WifiOff className="h-3.5 w-3.5 text-[#7B5D1C] shrink-0" />
            <span>
              <strong>Non-GPS Buses ({nonGpsRoutes.length}):</strong>{' '}
              {nonGpsRoutes.map((r) => `${r.routeCode} (${r.busNumber} · ${r.driverName})`).join(', ')}
              {' '}— tracked via daily morning &amp; evening attendance &amp; direct driver phone.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
