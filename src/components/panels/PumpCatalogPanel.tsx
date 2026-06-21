import { filterPumpCatalog } from "../../engine/pumpSelection";
import type { HydroCalculationResult } from "../../types/result.types";
import type { PumpFilterMatch, PumpModel } from "../../types/pump.types";

type PumpCatalogPanelProps = {
  result?: HydroCalculationResult | null;
};

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) {
    return "não informado";
  }

  return value.toFixed(decimals);
}

function formatPowerCvKw(pump: PumpModel): string {
  const cv = pump.nominalPowerCv !== null ? `${pump.nominalPowerCv} cv` : "cv não informado";
  const kw = pump.nominalPowerKw !== null ? `${pump.nominalPowerKw.toFixed(3)} kW` : "kW não informado";

  return `${cv} / ${kw}`;
}

function resolveRequiredFlowM3h(result?: HydroCalculationResult | null): number | null {
  const flowLps = result?.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) {
    return null;
  }

  return flowLps * 3.6;
}

function getDataQualityLabel(match: PumpFilterMatch): string {
  if (match.pump.source.dataQuality === "didactic_example") {
    return "exemplo didático";
  }

  if (match.pump.source.dataQuality === "estimated") {
    return "estimado";
  }

  if (match.pump.source.dataQuality === "manufacturer_catalog") {
    return "catálogo técnico";
  }

  return "pendente de verificação";
}

export function PumpCatalogPanel({ result }: PumpCatalogPanelProps) {
  const requiredFlowM3h = resolveRequiredFlowM3h(result);
  const requiredHeadMca = result?.totalDynamicHeadMca ?? null;

  const matches = filterPumpCatalog({
    requiredFlowM3h,
    requiredHeadMca,
  });

  const visibleMatches = matches.sort((a, b) => {
    if (a.matches === b.matches) return 0;
    return a.matches ? -1 : 1;
  });

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            Catálogo técnico de bombas
          </h3>

          <p className="mt-2 text-xs leading-5 text-blue-100/80">
            Catálogo técnico com modelos reais e exemplos didáticos para consultar
            faixas de vazão, altura manométrica e preparar a recomendação
            automática das próximas sprints.
          </p>
        </div>

        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-100">
          Sprint 15B
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
        <p>
          <strong className="text-slate-100">Aviso:</strong> os dados do catálogo servem para pré-seleção. A escolha
          final da bomba deve ser confirmada no catálogo oficial do fabricante,
          considerando curva da bomba, curva do sistema e condições reais de instalação.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div>
            Vazão exigida estimada: {requiredFlowM3h ? `${requiredFlowM3h.toFixed(2)} m³/h` : "não calculada"}
          </div>
          <div>
            HMT exigida estimada: {requiredHeadMca !== null ? `${requiredHeadMca.toFixed(2)} mca` : "não calculada"}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleMatches.map((match) => (
          <div
            key={match.pump.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {match.pump.brand} — {match.pump.model}
                </h4>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                  {match.pump.type} · {getDataQualityLabel(match)}
                </p>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  match.matches
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                }`}
              >
                {match.matches ? "faixa possível" : "fora do filtro"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>Potência: {formatPowerCvKw(match.pump)}</div>
              <div>Eficiência: {formatNumber(match.pump.estimatedEfficiencyPercent, 0)}%</div>
              <div>
                Vazão: {formatNumber(match.pump.minFlowM3h)} a {formatNumber(match.pump.maxFlowM3h)} m³/h
              </div>
              <div>
                Altura: {formatNumber(match.pump.minHeadMca)} a {formatNumber(match.pump.maxHeadMca)} mca
              </div>
              <div>Tensão: {match.pump.voltageV ?? "não informada"}</div>
              <div>Fonte: {match.pump.source.sourceName}</div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              {match.pump.recommendedUse}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {match.pump.technicalNote}
            </p>

            {match.reasons.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">
                {match.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            )}

            {match.missingData.length > 0 && (
              <p className="mt-2 text-xs leading-5 text-yellow-100/80">
                Dados pendentes: {match.missingData.join(", ")}.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
