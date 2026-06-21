import { PumpCurveChart } from "../charts/PumpCurveChart";
import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "../../engine/pumpSelection";
import type { PumpRecommendation, PumpRecommendationStatus } from "../../types/pump.types";
import type { HydroCalculationResult } from "../../types/result.types";

type PumpRecommendationPanelProps = {
  result: HydroCalculationResult;
};

function resolveRequiredFlowM3h(result: HydroCalculationResult): number | null {
  const flowLps = result.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) {
    return null;
  }

  return flowLps * 3.6;
}

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "nÃ£o calculado";
  }

  return value.toFixed(decimals);
}

function formatMargin(value: number | null): string {
  if (value === null) {
    return "nÃ£o comparado";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

function getStatusLabel(status: PumpRecommendationStatus): string {
  const labels: Record<PumpRecommendationStatus, string> = {
    atende: "atende",
    atende_com_folga: "atende com folga",
    insuficiente: "insuficiente",
    superdimensionada: "superdimensionada",
    dados_incompletos: "dados incompletos",
  };

  return labels[status];
}

function getStatusClass(status: PumpRecommendationStatus): string {
  const classes: Record<PumpRecommendationStatus, string> = {
    atende: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
    atende_com_folga: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
    insuficiente: "border-red-400/40 bg-red-400/10 text-red-100",
    superdimensionada: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
    dados_incompletos: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  };

  return classes[status];
}

function formatSignedNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "nÃ£o comparado";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

function getPowerComparisonLabel(
  comparison: PumpRecommendation["powerComparison"]
): string {
  if (comparison === "abaixo_da_estimativa") {
    return "potÃªncia abaixo da estimativa";
  }

  if (comparison === "acima_da_estimativa") {
    return "potÃªncia acima da estimativa";
  }

  if (comparison === "proxima") {
    return "potÃªncia prÃ³xima da estimativa";
  }

  return "potÃªncia nÃ£o comparada";
}

function PumpRecommendationCard({ recommendation }: { recommendation: PumpRecommendation }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">
            {recommendation.pump.brand} â€” {recommendation.pump.model}
          </h4>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
            {recommendation.pump.type} Â· {getPowerComparisonLabel(recommendation.powerComparison)}
          </p>
        </div>

        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusClass(
            recommendation.status
          )}`}
        >
          {getStatusLabel(recommendation.status)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div>
          VazÃ£o: {formatNumber(recommendation.pump.nominalFlowM3h)} a {formatNumber(recommendation.pump.maxFlowM3h)} mÂ³/h
        </div>
        <div>
          Altura: {formatNumber(recommendation.pump.nominalHeadMca)} a {formatNumber(recommendation.pump.maxHeadMca)} mca
        </div>
        <div>Margem de vazÃ£o: {formatMargin(recommendation.flowMarginPercent)}</div>
        <div>Margem de altura: {formatMargin(recommendation.headMarginPercent)}</div>
      </div>

      <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-xs leading-5 text-cyan-50/90">
        <p className="font-semibold text-cyan-100">ComparaÃ§Ã£o pela curva simplificada</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-cyan-50/80">
          <div>Altura exigida: {formatNumber(recommendation.curveEvaluation.requiredHeadMca)} mca</div>
          <div>Altura entregue: {formatNumber(recommendation.curveEvaluation.deliveredHeadMca)} mca</div>
          <div>Margem: {formatSignedNumber(recommendation.curveEvaluation.headMarginMca)} mca</div>
          <div>Faixa da curva: {recommendation.curveEvaluation.isWithinCurveRange ? "dentro" : "fora/sem curva"}</div>
        </div>
        <p className="mt-2 text-[11px] text-cyan-50/70">
          {recommendation.curveEvaluation.message}
        </p>
      </div>

      <div className="mt-3">
        <PumpCurveChart
          pump={recommendation.pump}
          requiredFlowM3h={recommendation.curveEvaluation.requiredFlowM3h}
          requiredHeadMca={recommendation.curveEvaluation.requiredHeadMca}
          deliveredHeadMca={recommendation.curveEvaluation.deliveredHeadMca}
        />
      </div>

      <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">
        {recommendation.reasons.map((reason) => (
          <li key={reason}>â€¢ {reason}</li>
        ))}
      </ul>

      {recommendation.missingData.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-yellow-100/80">
          Dados faltando: {recommendation.missingData.join(", ")}.
        </p>
      )}
    </div>
  );
}

export function PumpRecommendationPanel({ result }: PumpRecommendationPanelProps) {
  const requiredFlowM3h = resolveRequiredFlowM3h(result);
  const requiredHeadMca = result.totalDynamicHeadMca;
  const recommendations = buildPumpRecommendations({
    requiredFlowM3h,
    requiredHeadMca,
    estimatedElectricPowerKw: result.electricPowerKw,
    assumedEfficiencyPercent: result.pumpEfficiencyPercent,
  });
  const recommendedPump = getRecommendedPump(recommendations);
  const secondaryRecommendations = recommendations
    .filter((recommendation) => recommendation !== recommendedPump)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            RecomendaÃ§Ã£o simplificada de bomba
          </h3>

          <p className="mt-2 text-xs leading-5 text-emerald-50/80">
            A recomendaÃ§Ã£o compara a vazÃ£o necessÃ¡ria, a altura manomÃ©trica total,
            a potÃªncia elÃ©trica estimada e, quando houver dados, a curva simplificada
            da bomba por interpolaÃ§Ã£o linear.
          </p>
        </div>

        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
Sprint 16A
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div>VazÃ£o exigida: {formatNumber(requiredFlowM3h)} mÂ³/h</div>
          <div>HMT exigida: {formatNumber(requiredHeadMca)} mca</div>
          <div>PotÃªncia elÃ©trica: {formatNumber(result.electricPowerKw, 3)} kW</div>
          <div>EficiÃªncia usada: {formatNumber(result.pumpEfficiencyPercent, 0)}%</div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          A recomendaÃ§Ã£o Ã© simplificada e nÃ£o substitui o dimensionamento completo
          com curva real da bomba e curva do sistema. Esta curva Ã© simplificada e
          depende da qualidade dos dados inseridos no catÃ¡logo.
        </p>
      </div>

      {recommendedPump ? (
        <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            Bomba recomendada para prÃ©-seleÃ§Ã£o
          </p>
          <div className="mt-3">
            <PumpRecommendationCard recommendation={recommendedPump} />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-3">
          <p className="text-xs font-semibold text-yellow-100">
            Nenhuma bomba pÃ´de ser recomendada com seguranÃ§a.
          </p>
          <p className="mt-2 text-xs leading-5 text-yellow-100/80">
            Verifique se a vazÃ£o e a altura manomÃ©trica total foram calculadas e
            se o catÃ¡logo possui modelos com dados completos para essa faixa.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Outras bombas avaliadas
        </p>

        {secondaryRecommendations.map((recommendation) => (
          <PumpRecommendationCard
            key={recommendation.pump.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </div>
  );
}

