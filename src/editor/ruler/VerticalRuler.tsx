import { formatMeters, pixelsToMeters } from "./scaleUtils";

type VerticalRulerProps = {
  enabled: boolean;
  pixelsPerMeter: number;
  heightPx?: number;
};

export function VerticalRuler({
  enabled,
  pixelsPerMeter,
  heightPx = 1600,
}: VerticalRulerProps) {
  if (!enabled) {
    return null;
  }

  const safePixelsPerMeter = Math.max(10, pixelsPerMeter);
  const tickCount = Math.ceil(heightPx / safePixelsPerMeter);

  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const y = index * safePixelsPerMeter;
    const meters = pixelsToMeters(y, safePixelsPerMeter);

    return {
      y,
      label: formatMeters(meters),
    };
  });

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 border-r border-slate-700 bg-slate-950/90">
      {ticks.map((tick) => (
        <div
          key={tick.y}
          className="absolute left-0 w-12 border-t border-slate-600"
          style={{ top: tick.y }}
        >
          <span className="ml-1 text-[10px] text-slate-400">
            {tick.label}
          </span>
        </div>
      ))}
    </div>
  );
}