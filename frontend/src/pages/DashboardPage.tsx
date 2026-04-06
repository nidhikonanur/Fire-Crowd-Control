import { useMemo, useState } from 'react';

import { AlertsPanel } from '../components/AlertsPanel';
import { CameraTile } from '../components/CameraTile';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useAppContext } from '../context/AppContext';

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/92 px-5 py-5 shadow-[0_20px_50px_rgba(148,163,184,0.18)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function TileSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]">
      <div className="aspect-video animate-pulse bg-[hsl(var(--panel-3))]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-2/3 animate-pulse rounded bg-[hsl(var(--panel-3))]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[hsl(var(--panel-3))]" />
        <div className="h-9 animate-pulse rounded bg-[hsl(var(--panel-3))]" />
      </div>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const { cameras, latestByCamera, historyByCamera, alerts, dismissAlert, clearAlerts, bootstrapping } = useAppContext();
  const [search, setSearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [alertingOnly, setAlertingOnly] = useState(false);
  const [pausedByCamera, setPausedByCamera] = useState<Record<string, boolean>>({});

  const alertCameraIds = useMemo(() => new Set(alerts.map((item) => item.camera_id)), [alerts]);

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const matchesSearch = !search || `${camera.name} ${camera.stream_url}`.toLowerCase().includes(search.toLowerCase());
      const matchesOnline = onlineOnly ? camera.status === 'online' : true;
      const matchesAlerting = alertingOnly ? alertCameraIds.has(camera.id) : true;
      return matchesSearch && matchesOnline && matchesAlerting;
    });
  }, [alertCameraIds, alertingOnly, cameras, onlineOnly, search]);

  const onlineCount = cameras.filter((camera) => camera.status === 'online').length;
  const totalCrowd = cameras.reduce((sum, camera) => sum + (latestByCamera[camera.id]?.crowd_count ?? camera.last_crowd_count ?? 0), 0);
  const avgLatency =
    cameras.length > 0
      ? cameras.reduce((sum, camera) => sum + (latestByCamera[camera.id]?.latency_ms ?? camera.last_latency_ms ?? 0), 0) / cameras.length
      : 0;

  const recentUpdates = useMemo(() => {
    return cameras
      .map((camera) => ({
        id: camera.id,
        name: camera.name,
        status: latestByCamera[camera.id]?.status ?? camera.status,
        count: latestByCamera[camera.id]?.crowd_count ?? camera.last_crowd_count ?? 0,
        ts: latestByCamera[camera.id]?.ts ?? camera.last_update_ts,
      }))
      .sort((a, b) => new Date(b.ts ?? 0).getTime() - new Date(a.ts ?? 0).getTime())
      .slice(0, 8);
  }, [cameras, latestByCamera]);

  const togglePause = (cameraId: string) => {
    setPausedByCamera((prev) => ({
      ...prev,
      [cameraId]: !prev[cameraId],
    }));
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/85 bg-white/90 p-6 shadow-[0_28px_90px_rgba(148,163,184,0.2)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[hsl(var(--accent))]">Dashboard overview</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Modern operations view for live crowd monitoring.</h1>
            <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Keep camera health, occupancy signals, and alerts in one bright, readable workspace designed for quick scanning.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[560px]">
            <div className="rounded-[24px] border border-[hsl(var(--border))] bg-[linear-gradient(135deg,#eff6ff,#ffffff)] px-4 py-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Cameras shown</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{filteredCameras.length}</p>
            </div>
            <div className="rounded-[24px] border border-[hsl(var(--border))] bg-[linear-gradient(135deg,#f5f3ff,#ffffff)] px-4 py-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Latest updates tracked</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{recentUpdates.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Online cameras" value={`${onlineCount}/${cameras.length || 0}`} />
        <StatCard label="Total crowd" value={totalCrowd.toFixed(1)} />
        <StatCard label="Average latency" value={`${avgLatency.toFixed(1)} ms`} />
        <StatCard label="Active alerts" value={String(alerts.length)} />
      </section>

      <section className="rounded-[32px] border border-white/85 bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Filters</p>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by camera name or stream"
              className="min-w-[260px] flex-1"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">
              Online only
              <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">
              Alerting only
              <Switch checked={alertingOnly} onCheckedChange={setAlertingOnly} />
            </label>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Camera feed</h2>
            <p className="text-xs uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">{filteredCameras.length} shown</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {bootstrapping && cameras.length === 0 && (
              <>
                <TileSkeleton />
                <TileSkeleton />
                <TileSkeleton />
              </>
            )}

            {!bootstrapping && filteredCameras.length === 0 && (
              <div className="col-span-full rounded-[28px] border border-dashed border-[hsl(var(--border))] bg-white/70 px-4 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No cameras match current filters.
              </div>
            )}

            {filteredCameras.map((camera) => (
              <CameraTile
                key={camera.id}
                camera={camera}
                latest={latestByCamera[camera.id]}
                history={historyByCamera[camera.id] ?? []}
                paused={Boolean(pausedByCamera[camera.id])}
                onTogglePause={togglePause}
              />
            ))}
          </div>
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-4">
          <AlertsPanel alerts={alerts} onDismiss={dismissAlert} onClear={clearAlerts} />

          <section className="rounded-[32px] border border-white/85 bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.18)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent updates</h3>
            </div>
            <div className="space-y-2">
              {recentUpdates.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-slate-900">{item.name}</p>
                    <p className="font-mono text-[hsl(var(--muted-foreground))]">{item.count.toFixed(1)}</p>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {item.status} {item.ts ? `• ${new Date(item.ts).toLocaleTimeString()}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
