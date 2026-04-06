import { Activity, AlertTriangle, ChevronLeft, ChevronRight, Cog, Grid2X2, Search, Settings2, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Camera } from '../types';
import { cn } from '../lib/utils';
import { AuthControls } from './AuthControls';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommandPalette } from './CommandPalette';

function connectionBadge(mode: 'connecting' | 'live' | 'mock'): JSX.Element {
  if (mode === 'live') {
    return <Badge variant="success">SYSTEM LIVE</Badge>;
  }
  if (mode === 'mock') {
    return <Badge variant="warning">SIMULATED MODE</Badge>;
  }
  return <Badge variant="muted">CONNECTING</Badge>;
}

const navItems = [
  { to: '/', label: 'Overview', icon: Grid2X2 },
  { to: '/cameras', label: 'Cameras', icon: Video },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/settings', label: 'Settings', icon: Settings2 },
  { to: '/model-integration', label: 'Model', icon: Cog },
];

export function Layout({
  children,
  connectionMode,
  cameras,
}: {
  children: React.ReactNode;
  connectionMode: 'connecting' | 'live' | 'mock';
  cameras: Camera[];
}): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isOpenCombo) {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const cameraOnline = useMemo(() => cameras.filter((camera) => camera.status === 'online').length, [cameras]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="ops-grid-pattern fixed inset-0 opacity-20" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-[hsl(var(--accent))]/10 to-transparent" />

      <div className="relative z-10 flex min-h-screen gap-4 p-3 lg:p-4">
        <aside
          className={cn(
            'sticky top-3 h-[calc(100vh-1.5rem)] rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/88 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur transition-all duration-200 ease-out',
            sidebarCollapsed ? 'w-[76px]' : 'w-[250px]',
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-semibold tracking-tight">SFD Crowd Ops</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Mission control</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-150',
                      isActive
                        ? 'border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/12 text-[hsl(var(--foreground))]'
                        : 'border border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--panel-2))] hover:text-[hsl(var(--foreground))]',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--panel))]/82 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur lg:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="group inline-flex h-11 min-w-[260px] items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-4 text-left text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--accent))]/60 hover:text-[hsl(var(--foreground))]"
              >
                <Search className="h-4 w-4" />
                <span className="flex-1">Search cameras, alerts, pages</span>
                <kbd className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--panel))] px-2 py-1 text-[10px]">⌘K</kbd>
              </button>

              <div className="ml-auto flex items-center gap-2">
                {connectionBadge(connectionMode)}
                <Badge variant="muted">Online {cameraOnline}/{cameras.length || 0}</Badge>
                <Badge variant="muted">{clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</Badge>
                <AuthControls />
                <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto py-4 lg:py-5">
            <div className="mx-auto w-full max-w-[1700px]">{children}</div>
          </main>
        </div>
      </div>

      <CommandPalette
        cameras={cameras}
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />
    </div>
  );
}
