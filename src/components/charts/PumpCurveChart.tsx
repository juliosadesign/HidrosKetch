import { sortPumpCurvePoints } from "../../engine/pumpCurve";
import type { PumpModel } from "../../types/pump.types";

type PumpCurveChartProps = {
  pump: PumpModel;
  requiredFlowM3h: number | null;
  requiredHeadMca: number | null;
  deliveredHeadMca: number | null;
};

type ChartPoint = {
  x: number;
  y: number;
};

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "nÃ£o calculado";
  }

  return value.toFixed(decimals);
}

function buildPolyline(points: ChartPoint[]): string {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function PumpCurveChart({
  pump,
  requiredFlowM3h,
  requiredHeadMca,
  deliveredHeadMca,
}: PumpCurveChartProps) {
  const curvePoints = sortPumpCurvePoints(pump.curvePoints);

  if (curvePoints.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs leading-5 text-slate-400">
        Esta bomba ainda nÃ£o possui curva cadastrada.
      </div>
    );
  }

  const width = 320;
  const height = 180;
  const paddingLeft = 38;
  const paddingRight = 14;
  const paddingTop = 14;
  const paddingBottom = 34;

  const maxFlowFromCurve = Math.max(...curvePoints.map((point) => point.flowM3h));
  const maxHeadFromCurve = Math.max(...curvePoints.map((point) => point.headMca));
  const maxFlow = Math.max(maxFlowFromCurve, requiredFlowM3h ?? 0, 1);
  const maxHead = Math.max(maxHeadFromCurve, requiredHeadMca ?? 0, deliveredHeadMca ?? 0, 1);

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  function mapX(flowM3h: number): number {
    return paddingLeft + (flowM3h / maxFlow) * plotWidth;
  }

  function mapY(headMca: number): number {
    return paddingTop + plotHeight - (headMca / maxHead) * plotHeight;
  }

  const polylinePoints = curvePoints.map((point) => ({
    x: mapX(point.flowM3h),
    y: mapY(point.headMca),
  }));

  const hasOperatingPoint =
    requiredFlowM3h !== null &&
    requiredHeadMca !== null &&
    Number.isFinite(requiredFlowM3h) &&
    Number.isFinite(requiredHeadMca) &&
    requiredFlowM3h >= 0 &&
    requiredHeadMca >= 0;

  const operatingPoint = hasOperatingPoint
    ? {
        x: mapX(requiredFlowM3h),
        y: mapY(requiredHeadMca),
      }
    : null;

  const deliveredPoint =
    requiredFlowM3h !== null &&
    deliveredHeadMca !== null &&
    Number.isFinite(requiredFlowM3h) &&
    Number.isFinite(deliveredHeadMca) &&
    deliveredHeadMca >= 0
      ? {
          x: mapX(requiredFlowM3h),
          y: mapY(deliveredHeadMca),
        }
      : null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            Curva simplificada da bomba
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            O ponto ideal ocorre quando a bomba consegue fornecer a altura necessÃ¡ria na vazÃ£o desejada.
          </p>
        </div>
      </div>

      <svg
        role="img"
        aria-label={`Curva simplificada da bomba ${pump.brand} ${pump.model}`}
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-auto w-full overflow-visible"
      >
        <line
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={paddingLeft + plotWidth}
          y2={paddingTop + plotHeight}
          className="stroke-slate-700"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={paddingTop + plotHeight}
          className="stroke-slate-700"
          strokeWidth="1"
        />

        <text
          x={paddingLeft + plotWidth / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[10px]"
        >
          VazÃ£o (mÂ³/h)
        </text>
        <text
          x="12"
          y={paddingTop + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${paddingTop + plotHeight / 2})`}
          className="fill-slate-500 text-[10px]"
        >
          Altura (mca)
        </text>

        <text
          x={paddingLeft}
          y={paddingTop + plotHeight + 14}
          textAnchor="middle"
          className="fill-slate-500 text-[10px]"
        >
          0
        </text>
        <text
          x={paddingLeft + plotWidth}
          y={paddingTop + plotHeight + 14}
          textAnchor="middle"
          className="fill-slate-500 text-[10px]"
        >
          {formatNumber(maxFlow, 1)}
        </text>
        <text
          x={paddingLeft - 6}
          y={paddingTop + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px]"
        >
          {formatNumber(maxHead, 0)}
        </text>

        <polyline
          points={buildPolyline(polylinePoints)}
          fill="none"
          className="stroke-cyan-300"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {polylinePoints.map((point, index) => (
          <circle
            key={`${pump.id}-curve-point-${index}`}
            cx={point.x}
            cy={point.y}
            r="3"
            className="fill-cyan-200"
          />
        ))}

        {deliveredPoint && (
          <circle
            cx={deliveredPoint.x}
            cy={deliveredPoint.y}
            r="4"
            className="fill-emerald-300"
          />
        )}

        {operatingPoint && (
          <g>
            <line
              x1={operatingPoint.x}
              y1={paddingTop}
              x2={operatingPoint.x}
              y2={paddingTop + plotHeight}
              className="stroke-yellow-300/50"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingLeft}
              y1={operatingPoint.y}
              x2={paddingLeft + plotWidth}
              y2={operatingPoint.y}
              className="stroke-yellow-300/50"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx={operatingPoint.x}
              cy={operatingPoint.y}
              r="4.5"
              className="fill-yellow-300"
            />
          </g>
        )}
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] leading-4 text-slate-400 sm:grid-cols-2">
        <div>
          <span className="font-semibold text-cyan-100">Curva:</span> pontos cadastrados do catÃ¡logo.
        </div>
        <div>
          <span className="font-semibold text-yellow-100">Ponto exigido:</span> vazÃ£o e HMT do projeto.
        </div>
        <div>
          <span className="font-semibold text-emerald-100">Altura entregue:</span> {formatNumber(deliveredHeadMca)} mca.
        </div>
        <div>
          <span className="font-semibold text-slate-200">Altura exigida:</span> {formatNumber(requiredHeadMca)} mca.
        </div>
      </div>
    </div>
  );
}

