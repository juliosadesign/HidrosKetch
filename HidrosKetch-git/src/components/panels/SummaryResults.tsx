import type { HydroCalculationResult } from "../../types/result.types";

type SummaryResultsProps = {
  result: HydroCalculationResult;
};

function formatNumber(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toFixed(decimals);
}

export function SummaryResults({ result }: SummaryResultsProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
        Resumo técnico
      </h3>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Perda localizada total</span>
          <span className="font-semibold text-white">
            {formatNumber(result.totalLocalLossMca)} mca
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carga total da bomba</span>
          <span className="font-semibold text-white">
            {formatNumber(result.totalPumpHeadMca)} mca
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carga residual</span>
          <span className="font-semibold text-white">
            {formatNumber(result.residualHeadMca)} mca
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Pressão estimada</span>
          <span className="font-semibold text-white">
            {formatNumber(result.estimatedPressureKpa)} kPa
          </span>
        </div>
      </div>
    </div>
  );
}