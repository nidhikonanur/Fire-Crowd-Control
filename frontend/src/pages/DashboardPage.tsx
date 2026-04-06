import { useMemo, useState } from 'react';

import { AlertsPanel } from '../components/AlertsPanel';
import { CameraTile } from '../components/CameraTile';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useAppContext } from '../context/AppContext';

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/90 px-5 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">{value}</p>
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
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/88 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[hsl(var(--accent))]">Operations overview</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">A cleaner live view for crowd monitoring.</h1>
            <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Monitor camera health, scan recent crowd movement, and keep alerts visible without the dashboard feeling cramped.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
            <div className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-4 py-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Cameras shown</p>
              <p className="mt-1 text-2xl font-semibold">{filteredCameras.length}</p>
            </div>
            <div className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-4 py-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Latest updates tracked</p>
              <p className="mt-1 text-2xl font-semibold">{recentUpdates.length}</p>
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

      <section className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Filters</p>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by camera name or stream"
              className="min-w-[260px] flex-1 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--panel-2))]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              Online only
              <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              Alerting only
              <Switch checked={alertingOnly} onCheckedChange={setAlertingOnly} />
            </label>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Camera feed</h2>
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
              <div className="col-span-full rounded-[24px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--panel))] px-4 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
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

          <section className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent updates</h3>
            </div>
            <div className="space-y-2">
              {recentUpdates.map((item) => (
                <div key={item.id} className="rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{item.name}</p>
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
