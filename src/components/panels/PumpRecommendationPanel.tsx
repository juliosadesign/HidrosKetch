import { PumpCurveChart } from "../charts/PumpCurveChart";
import { listPumpCatalog } from "../../domain/catalogs/pumpCatalog";
import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "../../engine/pumpSelection";
import type { PumpModel, PumpRecommendation, PumpRecommendationStatus } from "../../types/pump.types";
import type { HydroCalculationResult, UserDefinedPumpResult } from "../../types/result.types";

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

function buildUserDefinedPumpModels(
  userPumps: UserDefinedPumpResult[]
): PumpModel[] {
  return userPumps.map((pump) => ({
    id: `user_${pump.id}`,
    brand: pump.manufacturer?.trim() || "Bomba do projeto",
    model: pump.model?.trim() || pump.name || "Bomba informada",
    type: "generic",
    nominalPowerCv: null,
    nominalPowerKw: pump.nominalPowerKw,
    minFlowM3h: null,
    nominalFlowM3h: pump.nominalFlowM3h,
    maxFlowM3h: pump.nominalFlowM3h,
    minHeadMca: null,
    nominalHeadMca: pump.availableHeadMca,
    maxHeadMca: pump.availableHeadMca,
    estimatedEfficiencyPercent: pump.efficiencyPercent,
    voltageV: pump.voltageV,
    recommendedUse: "Bomba cadastrada manualmente no componente Bomba.",
    technicalNote:
      pump.notes ||
      "Dados informados pelo usuario para comparacao preliminar com a rede.",
    source: {
      sourceName: "Componente Bomba do projeto",
      sourceUrl: null,
      dataQuality: "estimated",
      checkedAt: null,
    },
    curvePoints: pump.curvePoints,
  }));
}

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "não calculado";
  }

  return value.toFixed(decimals);
}

function formatMargin(value: number | null): string {
  if (value === null) {
    return "não comparado";
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
    return "não comparado";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

function getPowerComparisonLabel(
  comparison: PumpRecommendation["powerComparison"]
): string {
  if (comparison === "abaixo_da_estimativa") {
    return "potência abaixo da estimativa";
  }

  if (comparison === "acima_da_estimativa") {
    return "potência acima da estimativa";
  }

  if (comparison === "proxima") {
    return "potência próxima da estimativa";
  }

  return "potência não comparada";
}

function PumpRecommendationCard({ recommendation }: { recommendation: PumpRecommendation }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">
            {recommendation.pump.brand} — {recommendation.pump.model}
          </h4>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
            {recommendation.pump.type} · {getPowerComparisonLabel(recommendation.powerComparison)}
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
          Vazão: {formatNumber(recommendation.pump.nominalFlowM3h)} a {formatNumber(recommendation.pump.maxFlowM3h)} m³/h
        </div>
        <div>
          Altura: {formatNumber(recommendation.pump.nominalHeadMca)} a {formatNumber(recommendation.pump.maxHeadMca)} mca
        </div>
        <div>Margem de vazão: {formatMargin(recommendation.flowMarginPercent)}</div>
        <div>Margem de altura: {formatMargin(recommendation.headMarginPercent)}</div>
      </div>

      <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-xs leading-5 text-cyan-50/90">
        <p className="font-semibold text-cyan-100">Comparação pela curva simplificada</p>
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
          <li key={reason}>• {reason}</li>
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
  const userPumpModels = buildUserDefinedPumpModels(result.userDefinedPumps ?? []);
  const catalogPumps = listPumpCatalog();
  const recommendations = buildPumpRecommendations(
    {
      requiredFlowM3h,
      requiredHeadMca,
      estimatedElectricPowerKw: result.electricPowerKw,
      assumedEfficiencyPercent: result.pumpEfficiencyPercent,
    },
    [...userPumpModels, ...catalogPumps]
  );
  const recommendedPump = getRecommendedPump(recommendations);
  const secondaryRecommendations = recommendations
    .filter((recommendation) => recommendation !== recommendedPump)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Recomendação simplificada de bomba
          </h3>

          <p className="mt-2 text-xs leading-5 text-emerald-50/80">
            A recomendacao compara a vazao necessaria, a altura manometrica total,
            a potencia eletrica estimada e, quando houver dados no componente Bomba,
            usa a curva simplificada informada pelo usuario.
          </p>
        </div>

        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
Sprint 16A
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div>Vazão exigida: {formatNumber(requiredFlowM3h)} m³/h</div>
          <div>HMT exigida: {formatNumber(requiredHeadMca)} mca</div>
          <div>Potência elétrica: {formatNumber(result.electricPowerKw, 3)} kW</div>
          <div>Eficiência usada: {formatNumber(result.pumpEfficiencyPercent, 0)}%</div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          A recomendação é simplificada e não substitui o dimensionamento completo
          com curva real da bomba e curva do sistema. Esta curva é simplificada e
          depende da qualidade dos dados inseridos no catálogo.
        </p>
      </div>

      {recommendedPump ? (
        <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            Bomba recomendada para pré-seleção
          </p>
          <div className="mt-3">
            <PumpRecommendationCard recommendation={recommendedPump} />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-3">
          <p className="text-xs font-semibold text-yellow-100">
            Nenhuma bomba pôde ser recomendada com segurança.
          </p>
          <p className="mt-2 text-xs leading-5 text-yellow-100/80">
            Verifique se a vazão e a altura manométrica total foram calculadas e
            se o catálogo possui modelos com dados completos para essa faixa.
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

