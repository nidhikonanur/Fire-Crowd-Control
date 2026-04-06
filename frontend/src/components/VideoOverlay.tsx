import { Camera, Waves } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface VideoOverlayProps {
  src?: string | null;
  overlayBase64?: string;
  frameJpegBase64?: string | null;
  opacity: number;
  overlayEnabled?: boolean;
}

const FALLBACK_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export function VideoOverlay({
  src,
  overlayBase64,
  frameJpegBase64,
  opacity,
  overlayEnabled = true,
}: VideoOverlayProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  const resolvedSrc = useMemo(() => src || FALLBACK_VIDEO, [src]);
  const frameSrc = useMemo(
    () => (frameJpegBase64 ? `data:image/jpeg;base64,${frameJpegBase64}` : null),
    [frameJpegBase64],
  );
  const overlaySrc = useMemo(
    () => (overlayBase64 ? `data:image/png;base64,${overlayBase64}` : null),
    [overlayBase64],
  );
  const showFramePreview = Boolean(frameSrc);

  useEffect(() => {
    if (showFramePreview) {
      setHasVideoError(false);
    }
  }, [showFramePreview]);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/85 bg-white/92 shadow-[0_22px_60px_rgba(148,163,184,0.18)]">
      <div className="grid gap-px bg-[hsl(var(--border))] lg:grid-cols-2">
        <section className="bg-slate-950">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            <Waves className="h-4 w-4" />
            Density Map
          </div>
          <div className="relative aspect-video overflow-hidden">
            {overlayEnabled && overlaySrc ? (
              <img
                src={overlaySrc}
                alt="Density map"
                className="h-full w-full object-cover"
                style={{ opacity: Math.min(1, Math.max(0, opacity)) }}
              />
            ) : (
              <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,#1e293b,#020617)] px-4 text-center text-sm text-white/70">
                Density map is currently hidden or unavailable.
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-950">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            <Camera className="h-4 w-4" />
            Camera Feed
          </div>
          <div className="relative aspect-video overflow-hidden">
            <video
              ref={videoRef}
              className={showFramePreview ? 'aspect-video w-full object-cover opacity-0' : 'aspect-video w-full object-cover'}
              src={resolvedSrc}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setHasVideoError(false)}
              onError={() => {
                if (!showFramePreview) {
                  setHasVideoError(true);
                }
              }}
            />
            {showFramePreview && <img src={frameSrc ?? ''} alt="Latest camera frame" className="absolute inset-0 h-full w-full object-cover" />}

            {hasVideoError && !showFramePreview && (
              <div className="absolute inset-0 grid place-items-center bg-black/70 text-xs text-white/80">
                Live stream unavailable. Showing telemetry only.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
