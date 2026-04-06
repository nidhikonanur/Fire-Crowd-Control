import { AlertItem } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const severityVariant: Record<AlertItem['severity'], 'warning' | 'danger'> = {
  warning: 'warning',
  critical: 'danger',
};

export function AlertsPanel({
  alerts,
  onDismiss,
  onClear,
  title = 'Alerts',
  limit = 12,
}: {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  onClear?: () => void;
  title?: string;
  limit?: number;
}): JSX.Element {
  return (
    <section className="rounded-[32px] border border-white/85 bg-white/92 p-5 shadow-[0_22px_60px_rgba(148,163,184,0.18)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="muted">{alerts.length}</Badge>
          {onClear && alerts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {alerts.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] px-3 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No active alerts
          </div>
        )}

        {alerts.slice(0, limit).map((alert) => (
          <article key={alert.id} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">{alert.camera_name}</p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{alert.message}</p>
              </div>
              <Badge variant={severityVariant[alert.severity]}>{alert.severity}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{new Date(alert.ts).toLocaleString()}</p>
              <Button variant="ghost" size="sm" onClick={() => onDismiss(alert.id)}>
                Dismiss
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
