import { formatMeters, pixelsToMeters } from "./scaleUtils";

type HorizontalRulerProps = {
  enabled: boolean;
  pixelsPerMeter: number;
  widthPx?: number;
  offsetLeftPx?: number;
};

export function HorizontalRuler({
  enabled,
  pixelsPerMeter,
  widthPx = 2400,
  offsetLeftPx = 0,
}: HorizontalRulerProps) {
  if (!enabled) {
    return null;
  }

  const safePixelsPerMeter = Math.max(10, pixelsPerMeter);
  const tickCount = Math.ceil(widthPx / safePixelsPerMeter);

  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const x = index * safePixelsPerMeter;
    const meters = pixelsToMeters(x, safePixelsPerMeter);

    return {
      x,
      label: formatMeters(meters),
    };
  });

  return (
    <div
      className="pointer-events-none absolute top-0 z-30 h-8 border-b border-slate-700 bg-slate-950/95 shadow-lg shadow-slate-950/40"
      style={{
        left: offsetLeftPx,
        width: `calc(100% - ${offsetLeftPx}px)`,
      }}
    >
      {ticks.map((tick) => (
        <div
          key={tick.x}
          className="absolute top-0 h-8 border-l border-slate-600"
          style={{ left: tick.x }}
        >
          <span className="ml-1 text-[10px] text-slate-400">
            {tick.label}
          </span>
        </div>
      ))}
    </div>
  );
}
