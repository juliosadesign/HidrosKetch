import type { HydroCalculationResult } from "../../types/result.types";

import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "../../engine/pumpSelection";

type ResultExplanationChartsProps = {
  result: HydroCalculationResult | null;
  variant?: "simple" | "technical";
};

type ChartPart = {
  label: string;
  value: number;
  unit: string;
  className: string;
  bgClassName: string;
};

const DONUT_RADIUS = 34;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function safeNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "nao calculado";
  }

  return value.toFixed(decimals);
}

function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "nao calculado";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getMainFlowM3h(result: HydroCalculationResult | null): number | null {
  const flowLps = result?.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) return null;
  return flowLps * 3.6;
}

function getPumpRecommendation(result: HydroCalculationResult | null) {
  if (!result) return null;

  const recommendations = buildPumpRecommendations({
    requiredFlowM3h: getMainFlowM3h(result),
    requiredHeadMca: result.totalDynamicHeadMca,
    estimatedElectricPowerKw: result.electricPowerKw,
    assumedEfficiencyPercent: result.pumpEfficiencyPercent,
  });

  return getRecommendedPump(recommendations) ?? recommendations[0] ?? null;
}

function buildHeadParts(result: HydroCalculationResult): ChartPart[] {
  return [
    {
      label: "Desnivel",
      value: safeNumber(result.geometricHeadM),
      unit: "mca",
      className: "stroke-cyan-300",
      bgClassName: "bg-cyan-300",
    },
    {
      label: "Perdas",
      value: safeNumber(result.totalLocalLossMca),
      unit: "mca",
      className: "stroke-amber-300",
      bgClassName: "bg-amber-300",
    },
    {
      label: "Pressao final",
      value: safeNumber(result.requiredPressureHeadMca),
      unit: "mca",
      className: "stroke-emerald-300",
      bgClassName: "bg-emerald-300",
    },
  ].filter((part) => part.value > 0);
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400">
      <p className="font-semibold uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-2 leading-5">Recalcule a rede para visualizar este grafico.</p>
    </div>
  );
}

function HeadCompositionDonut({ result }: { result: HydroCalculationResult | null }) {
  if (!result) return <EmptyChartState label="Composicao da HMT" />;

  const parts = buildHeadParts(result);
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  if (total <= 0 || parts.length === 0) {
    return <EmptyChartState label="Composicao da HMT" />;
  }

  const segments = parts.reduce<
    Array<ChartPart & { dashOffset: number; segmentLength: number }>
  >((accumulator, part) => {
    const previousLength = accumulator.reduce(
      (sum, segment) => sum + segment.segmentLength,
      0
    );
    const segmentLength = (part.value / total) * DONUT_CIRCUMFERENCE;

    return [
      ...accumulator,
      {
        ...part,
        dashOffset: -previousLength,
        segmentLength,
      },
    ];
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            Composicao da HMT
          </p>
          <p className="mt-1 text-xs text-slate-400">Desnivel, perdas e pressao.</p>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-100">
          {formatNumber(result.totalDynamicHeadMca)} mca
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90 animate-[pulse_1.2s_ease-out_1]">
          <circle
            cx="50"
            cy="50"
            r={DONUT_RADIUS}
            className="fill-none stroke-slate-800"
            strokeWidth="12"
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx="50"
              cy="50"
              r={DONUT_RADIUS}
              className={`fill-none transition-all duration-500 ${segment.className}`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${segment.segmentLength} ${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={segment.dashOffset}
            />
          ))}
        </svg>

        <div className="min-w-0 flex-1 space-y-2">
          {parts.map((part) => (
            <div key={part.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <span className={`h-2 w-2 rounded-full ${part.bgClassName}`} />
                <span className="truncate">{part.label}</span>
              </span>
              <span className="font-semibold text-white">
                {formatNumber(part.value)} {part.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeadBarsChart({ result }: { result: HydroCalculationResult | null }) {
  if (!result) return <EmptyChartState label="Barras da carga" />;

  const bars = buildHeadParts(result);
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
        Carga por parcela
      </p>
      <div className="mt-3 space-y-3">
        {bars.length === 0 ? (
          <p className="text-xs text-slate-400">Dados ainda nao calculados.</p>
        ) : (
          bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between gap-2 text-[11px] text-slate-400">
                <span>{bar.label}</span>
                <span>
                  {formatNumber(bar.value)} {bar.unit}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${bar.bgClassName} transition-all duration-700`}
                  style={{ width: `${Math.max(6, (bar.value / maxValue) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EnergyBarsChart({ result }: { result: HydroCalculationResult | null }) {
  if (!result) return <EmptyChartState label="Energia e custo" />;

  const energyValues = [
    {
      label: "Consumo diario",
      value: safeNumber(result.dailyConsumptionKwh),
      suffix: "kWh",
      className: "bg-cyan-300",
    },
    {
      label: "Consumo mensal",
      value: safeNumber(result.monthlyConsumptionKwh),
      suffix: "kWh",
      className: "bg-indigo-300",
    },
    {
      label: "Custo mensal",
      value: safeNumber(result.monthlyEnergyCostBRL),
      suffix: "BRL",
      className: "bg-emerald-300",
    },
  ];
  const maxValue = Math.max(...energyValues.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
        Energia e custo
      </p>
      <div className="mt-3 space-y-3">
        {energyValues.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-2 text-[11px] text-slate-400">
              <span>{item.label}</span>
              <span>
                {item.suffix === "BRL" ? formatCurrencyBRL(item.value) : `${formatNumber(item.value)} ${item.suffix}`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${item.className} transition-all duration-700`}
                style={{ width: `${item.value > 0 ? Math.max(6, (item.value / maxValue) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PumpStatusCard({ result }: { result: HydroCalculationResult | null }) {
  const recommendation = getPumpRecommendation(result);

  if (!result || !recommendation) {
    return <EmptyChartState label="Status da bomba" />;
  }

  const recommendedLabel = `${recommendation.pump.brand} ${recommendation.pump.model}`;
  const headMargin = recommendation.headMarginPercent;
  const flowMargin = recommendation.flowMarginPercent;
  const isPositive =
    recommendation.status === "atende" || recommendation.status === "atende_com_folga";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            Status da bomba
          </p>
          <p className="mt-1 text-xs font-semibold text-white">{recommendedLabel}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
            isPositive
              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/35 bg-amber-500/10 text-amber-200"
          }`}
        >
          {recommendation.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Margem vazao</p>
          <p className="mt-1 font-semibold text-white">
            {flowMargin === null ? "nao calculado" : `${formatNumber(flowMargin, 0)}%`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Margem HMT</p>
          <p className="mt-1 font-semibold text-white">
            {headMargin === null ? "nao calculado" : `${formatNumber(headMargin, 0)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

function TechnicalComparisonChart({ result }: { result: HydroCalculationResult | null }) {
  if (!result) return <EmptyChartState label="Comparacao tecnica" />;

  const recommendation = getPumpRecommendation(result);
  const deliveredHead = recommendation?.curveEvaluation.deliveredHeadMca ?? null;
  const requiredHead = result.totalDynamicHeadMca;
  const hydraulicPower = safeNumber(result.hydraulicPowerKw);
  const electricPower = safeNumber(result.electricPowerKw);
  const maxPower = Math.max(hydraulicPower, electricPower, 1);
  const maxHead = Math.max(safeNumber(requiredHead), safeNumber(deliveredHead), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
        Comparacao tecnica
      </p>
      <div className="mt-3 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold text-slate-300">Altura exigida x entregue</p>
          {[
            { label: "HMT exigida", value: safeNumber(requiredHead), suffix: "mca", className: "bg-cyan-300" },
            { label: "Bomba/curva", value: safeNumber(deliveredHead), suffix: "mca", className: "bg-emerald-300" },
          ].map((item) => (
            <div key={item.label} className="mb-2">
              <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                <span>{item.label}</span>
                <span>{item.value > 0 ? `${formatNumber(item.value)} ${item.suffix}` : "nao calculado"}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full ${item.className} transition-all duration-700`}
                  style={{ width: `${item.value > 0 ? Math.max(6, (item.value / maxHead) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold text-slate-300">Potencia hidraulica x eletrica</p>
          {[
            { label: "Hidraulica", value: hydraulicPower, suffix: "kW", className: "bg-violet-300" },
            { label: "Eletrica", value: electricPower, suffix: "kW", className: "bg-amber-300" },
          ].map((item) => (
            <div key={item.label} className="mb-2">
              <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                <span>{item.label}</span>
                <span>{item.value > 0 ? `${formatNumber(item.value, 3)} ${item.suffix}` : "nao calculado"}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full ${item.className} transition-all duration-700`}
                  style={{ width: `${item.value > 0 ? Math.max(6, (item.value / maxPower) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResultExplanationCharts({
  result,
  variant = "simple",
}: ResultExplanationChartsProps) {
  if (variant === "technical") {
    return (
      <div className="space-y-3">
        <TechnicalComparisonChart result={result} />
        <EnergyBarsChart result={result} />
        <PumpStatusCard result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <HeadCompositionDonut result={result} />
      <HeadBarsChart result={result} />
      <EnergyBarsChart result={result} />
      <PumpStatusCard result={result} />
    </div>
  );
}
