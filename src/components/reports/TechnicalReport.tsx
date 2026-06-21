import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "../../engine/pumpSelection";
import type { HydroCalculationResult } from "../../types/result.types";

const PRELIMINARY_REPORT_NOTE =
  "Este relatório é preliminar e serve para estudo, simulação e pré-dimensionamento.";

const SIMPLIFIED_MODEL_NOTE =
  "Resultados baseados em modelo simplificado para fins didáticos e preliminares. A escolha final de bomba, diâmetros e acessórios deve ser confirmada por dimensionamento técnico completo.";

type TechnicalReportProps = {
  result: HydroCalculationResult;
  projectName?: string;
  onBack: () => void;
};

function formatNumber(
  value: number | null | undefined,
  decimals = 2,
  fallback = "não calculado"
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return value.toFixed(decimals).replace(".", ",");
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "não calculado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "não calculado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function resolveRequiredFlowM3h(result: HydroCalculationResult): number | null {
  const flowLps = result.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) {
    return null;
  }

  return flowLps * 3.6;
}

function getProjectStatusLabel(result: HydroCalculationResult): string {
  if (result.errors.length > 0) {
    return "Com erros técnicos";
  }

  if (result.warnings.length > 0) {
    return "Com alertas";
  }

  return "Pré-dimensionamento calculado";
}

function getComponentSummary(result: HydroCalculationResult): string {
  const total = result.componentResults.length;

  if (total === 0) {
    return "Nenhum componente calculado.";
  }

  const grouped = result.componentResults.reduce<Record<string, number>>(
    (accumulator, component) => {
      accumulator[component.componentType] =
        (accumulator[component.componentType] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const groupedText = Object.entries(grouped)
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");

  return `${total} componente(s) calculado(s): ${groupedText}.`;
}

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-950">
        {value}
        {unit && <span className="ml-1 text-xs text-slate-500">{unit}</span>}
      </p>
    </div>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function TechnicalReport({
  result,
  projectName = "Projeto HidroSketch",
  onBack,
}: TechnicalReportProps) {
  const requiredFlowM3h = resolveRequiredFlowM3h(result);
  const recommendations = buildPumpRecommendations({
    requiredFlowM3h,
    requiredHeadMca: result.totalDynamicHeadMca,
    estimatedElectricPowerKw: result.electricPowerKw,
    assumedEfficiencyPercent: result.pumpEfficiencyPercent,
  });
  const recommendedPump = getRecommendedPump(recommendations);
  const alertMessages = [
    ...result.errors.map((error) => error.message),
    ...result.warnings.map((warning) => warning.message),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Relatório técnico visual
          </h3>
          <p className="mt-1 text-xs leading-5 text-cyan-50/80">
            Visualização em formato de folha técnica, sem geração de PDF nesta
            sprint.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
        >
          Voltar para edição
        </button>
      </div>

      <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
            HidroSketch
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Relatório técnico preliminar
          </h2>
          <div className="mt-3 grid gap-2 text-xs text-slate-600">
            <p>
              <strong>Projeto:</strong> {projectName}
            </p>
            <p>
              <strong>Data do cálculo:</strong> {formatDate(result.calculatedAt)}
            </p>
            <p>
              <strong>Status:</strong> {getProjectStatusLabel(result)}
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-xs leading-5 text-yellow-900">
          <strong>Observação:</strong> {PRELIMINARY_REPORT_NOTE} {SIMPLIFIED_MODEL_NOTE}
        </div>

        <ReportSection title="Resumo da rede">
          <div className="space-y-2 text-sm leading-6 text-slate-700">
            <p>{getComponentSummary(result)}</p>
            <p>
              A rede foi avaliada a partir dos componentes inseridos no editor,
              considerando perdas localizadas, carga de bomba informada, desnível
              geométrico, pressão mínima desejada e estimativas de energia.
            </p>
          </div>
        </ReportSection>

        <ReportSection title="Indicadores hidráulicos principais">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Vazão estimada"
              value={formatNumber(requiredFlowM3h)}
              unit="m³/h"
            />
            <MetricCard
              label="Perda de carga total"
              value={formatNumber(result.totalLocalLossMca)}
              unit="mca"
            />
            <MetricCard
              label="Altura manométrica total"
              value={formatNumber(result.totalDynamicHeadMca)}
              unit="mca"
            />
            <MetricCard
              label="Pressão estimada"
              value={formatNumber(result.estimatedPressureKpa)}
              unit="kPa"
            />
          </div>
        </ReportSection>

        <ReportSection title="Altura e carga geométrica">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Altura da origem"
              value={formatNumber(result.originElevationM)}
              unit="m"
            />
            <MetricCard
              label="Altura do destino"
              value={formatNumber(result.destinationElevationM)}
              unit="m"
            />
            <MetricCard
              label="Desnível geométrico"
              value={formatNumber(result.geometricHeadM)}
              unit="m"
            />
            <MetricCard
              label="Pressão mínima desejada"
              value={formatNumber(result.requiredOutletPressureKpa)}
              unit="kPa"
            />
          </div>
        </ReportSection>

        <ReportSection title="Energia e custo estimado">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Potência hidráulica"
              value={formatNumber(result.hydraulicPowerKw, 3)}
              unit="kW"
            />
            <MetricCard
              label="Potência elétrica"
              value={formatNumber(result.electricPowerKw, 3)}
              unit="kW"
            />
            <MetricCard
              label="Consumo mensal"
              value={formatNumber(result.monthlyConsumptionKwh)}
              unit="kWh"
            />
            <MetricCard
              label="Custo mensal"
              value={formatCurrency(result.monthlyEnergyCostBRL)}
            />
          </div>
        </ReportSection>

        <ReportSection title="Bomba recomendada">
          {recommendedPump ? (
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <p>
                <strong>{recommendedPump.pump.brand} {recommendedPump.pump.model}</strong>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Status"
                  value={recommendedPump.status.replaceAll("_", " ")}
                />
                <MetricCard
                  label="Altura entregue pela curva"
                  value={formatNumber(
                    recommendedPump.curveEvaluation.deliveredHeadMca
                  )}
                  unit="mca"
                />
                <MetricCard
                  label="Margem pela curva"
                  value={formatNumber(
                    recommendedPump.curveEvaluation.headMarginMca
                  )}
                  unit="mca"
                />
                <MetricCard
                  label="Potência nominal"
                  value={formatNumber(recommendedPump.pump.nominalPowerKw, 3)}
                  unit="kW"
                />
              </div>
              <ul className="space-y-1 text-xs leading-5 text-slate-600">
                {recommendedPump.reasons.slice(0, 4).map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Nenhuma bomba pôde ser recomendada com segurança. Verifique vazão,
              altura manométrica total e dados do catálogo.
            </p>
          )}
        </ReportSection>

        <ReportSection title="Componentes usados">
          {result.componentResults.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Componente</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Perda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.componentResults.map((component) => (
                    <tr key={component.componentId}>
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {component.componentName}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {component.componentType}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {formatNumber(component.localLossMca)} mca
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Não há componentes calculados no resultado atual.
            </p>
          )}
        </ReportSection>

        <ReportSection title="Alertas técnicos">
          {alertMessages.length > 0 ? (
            <ul className="space-y-2 text-xs leading-5 text-red-700">
              {alertMessages.map((message) => (
                <li key={message}>• {message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Nenhum alerta técnico foi registrado no resultado atual.
            </p>
          )}
        </ReportSection>

        <ReportSection title="Observações de simplificação">
          <ul className="space-y-2 text-xs leading-5 text-slate-600">
            {result.assumptions.length > 0 ? (
              result.assumptions.map((assumption) => (
                <li key={assumption}>• {assumption}</li>
              ))
            ) : (
              <li>• {SIMPLIFIED_MODEL_NOTE}</li>
            )}
            <li>• {PRELIMINARY_REPORT_NOTE}</li>
          </ul>
        </ReportSection>
      </article>
    </div>
  );
}
