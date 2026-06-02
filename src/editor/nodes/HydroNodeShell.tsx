import { InputHandle } from "../handles/InputHandle";
import { OutputHandle } from "../handles/OutputHandle";

type HydroNodeShellProps = {
  title: string;
  subtitle: string;
  symbol: string;
  badge: string;
  selected: boolean;
  accentClassName: string;

  // Sprint 6: controla se o nó terá ponto de entrada e/ou saída.
  showInputHandle?: boolean;
  showOutputHandle?: boolean;
};

// Molde visual usado por todos os nós hidráulicos.
// Agora com handles de entrada e saída.
export function HydroNodeShell({
  title,
  subtitle,
  symbol,
  badge,
  selected,
  accentClassName,
  showInputHandle = true,
  showOutputHandle = true,
}: HydroNodeShellProps) {
  return (
    <div
      className={[
        "relative min-w-[150px] rounded-2xl border bg-slate-950/95 p-3 shadow-xl",
        "transition",
        selected
          ? "border-cyan-300 ring-2 ring-cyan-400/50"
          : "border-slate-700",
      ].join(" ")}
    >
      {showInputHandle && <InputHandle />}
      {showOutputHandle && <OutputHandle />}

      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold",
            accentClassName,
          ].join(" ")}
        >
          {symbol}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">
            {title}
          </p>
          <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
          {badge}
        </span>

        <span className="text-[10px] text-slate-600">Sprint 6</span>
      </div>
    </div>
  );
}