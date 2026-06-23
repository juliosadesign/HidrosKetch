import { useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

import type {
  EditorScaleSettings,
  HydroFlowNode,
  ProjectEnergySettings,
  ProjectVisualState,
  UpdateProjectEnergySettings,
  UpdateScaleSettings,
  UpdateSelectedNodeData,
} from "../../editor/editor.types";
import type { StoredCalculationState } from "../../store/resultStore";
import type { HydroCalculationResult } from "../../types/result.types";

import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "../../engine/pumpSelection";
import { getComponentUsageGuide } from "../../domain/catalogs/componentHelp";
import { AccessoryProperties } from "./AccessoryProperties";
import { BranchProperties } from "./BranchProperties";
import { InstrumentProperties } from "./InstrumentProperties";
import { LabelProperties } from "./LabelProperties";
import { PipeProperties } from "./PipeProperties";
import { ProjectProperties } from "./ProjectProperties";
import { PumpProperties } from "./PumpProperties";
import { ReservoirProperties } from "./ReservoirProperties";
import { ResultExplanationCharts } from "../charts/ResultExplanationCharts";
import { ResultsPanel } from "./ResultsPanel";
import { TankProperties } from "./TankProperties";
import { ValveProperties } from "./ValveProperties";

export type RightWorkspacePanelProps = {
  isOpen: boolean;
  widthPx: number;
  selectedNode: HydroFlowNode | null;
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  scaleSettings: EditorScaleSettings;
  energySettings: ProjectEnergySettings;
  onToggle: () => void;
  onResizeStart: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onUpdateScaleSettings: UpdateScaleSettings;
  onUpdateEnergySettings: UpdateProjectEnergySettings;
  onUpdateSelectedNodeData: UpdateSelectedNodeData;
};

type PanelMode = "simple" | "technical";

function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "--";
  }

  return value.toFixed(decimals);
}

function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "--";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getProjectStateLabel(projectState: ProjectVisualState): string {
  if (projectState === "calculated") return "Calculado";
  if (projectState === "outdated") return "Desatualizado";
  return "Rascunho";
}

function getMainFlowM3h(result: HydroCalculationResult | null): number | null {
  const flowLps = result?.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) return null;
  return flowLps * 3.6;
}

function getRecommendedPumpLabel(result: HydroCalculationResult | null): string {
  if (!result) return "--";

  const requiredFlowM3h = getMainFlowM3h(result);
  const recommendations = buildPumpRecommendations({
    requiredFlowM3h,
    requiredHeadMca: result.totalDynamicHeadMca,
    estimatedElectricPowerKw: result.electricPowerKw,
    assumedEfficiencyPercent: result.pumpEfficiencyPercent,
  });
  const recommendedPump = getRecommendedPump(recommendations);

  if (!recommendedPump) return "Sem recomendacao";

  return `${recommendedPump.pump.brand} - ${recommendedPump.pump.model}`;
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function SimpleResultsView({
  projectState,
  calculationState,
}: {
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
}) {
  const result = calculationState.lastResult;
  const validation = calculationState.lastValidation;
  const mainFlowM3h = getMainFlowM3h(result);
  const warningCount =
    (validation?.warnings.length ?? 0) + (result?.warnings.length ?? 0);
  const errorCount =
    (validation?.errors.length ?? 0) + (result?.errors.length ?? 0);

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
          Resumo simples
        </p>
        <p className="mt-1 text-xs leading-5 text-cyan-50/85">
          Leitura rapida para entender o estado do projeto sem abrir todos os
          parametros tecnicos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CompactMetric label="Status" value={getProjectStateLabel(projectState)} />
        <CompactMetric
          label="Vazao"
          value={result ? `${formatNumber(mainFlowM3h, 2)} m3/h` : "--"}
        />
        <CompactMetric
          label="Perda"
          value={result ? `${formatNumber(result.totalLocalLossMca, 2)} mca` : "--"}
        />
        <CompactMetric
          label="HMT"
          value={result ? `${formatNumber(result.totalDynamicHeadMca, 2)} mca` : "--"}
        />
        <CompactMetric
          label="Potencia"
          value={result ? `${formatNumber(result.electricPowerKw, 3)} kW` : "--"}
        />
        <CompactMetric
          label="Custo"
          value={result ? formatCurrencyBRL(result.monthlyEnergyCostBRL) : "--"}
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Bomba recomendada
        </p>
        <p className="mt-1 text-xs font-semibold text-white">
          {getRecommendedPumpLabel(result)}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Alertas
        </p>
        <p className="mt-1 text-xs font-semibold text-white">
          {errorCount} erro(s) / {warningCount} alerta(s)
        </p>
      </div>

      <ResultExplanationCharts result={result} variant="simple" />
    </div>
  );
}

function ComponentHelpMini({ node }: { node: HydroFlowNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const guide = getComponentUsageGuide(
    String(node.data.catalogItemId ?? ""),
    node.data.componentKind
  );

  return (
    <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            Ajuda rapida
          </p>
          <p className="mt-1 text-xs font-semibold text-white">{guide.title}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="rounded-lg border border-cyan-500/40 bg-slate-950/70 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
        >
          {isExpanded ? "Ocultar" : "Ver"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-xs leading-5 text-cyan-50/85">
          <p>{guide.purpose}</p>
          <p>
            <strong className="text-cyan-200">Quando usar:</strong>{" "}
            {guide.whenToUse}
          </p>
        </div>
      )}
    </section>
  );
}

function TechnicalPropertiesView({
  selectedNode,
  projectState,
  calculationState,
  scaleSettings,
  energySettings,
  onUpdateScaleSettings,
  onUpdateEnergySettings,
  onUpdateSelectedNodeData,
}: Omit<RightWorkspacePanelProps, "isOpen" | "widthPx" | "onToggle" | "onResizeStart">) {
  if (!selectedNode) {
    return (
      <ProjectProperties
        projectState={projectState}
        calculationState={calculationState}
        scaleSettings={scaleSettings}
        energySettings={energySettings}
        onUpdateScaleSettings={onUpdateScaleSettings}
        onUpdateEnergySettings={onUpdateEnergySettings}
      />
    );
  }

  let propertiesContent: ReactNode;

  switch (selectedNode.data.componentKind) {
    case "pipe":
      propertiesContent = (
        <PipeProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "accessory":
    case "junction":
      propertiesContent = selectedNode.data.defaultData?.branchRole ? (
        <BranchProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      ) : (
        <AccessoryProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "valve":
      propertiesContent = (
        <ValveProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "pump":
      propertiesContent = (
        <PumpProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "reservoir":
      propertiesContent = (
        <ReservoirProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "tank":
      propertiesContent = (
        <TankProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "instrument":
      propertiesContent = (
        <InstrumentProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    case "label":
      propertiesContent = (
        <LabelProperties node={selectedNode} onUpdate={onUpdateSelectedNodeData} />
      );
      break;
    default:
      propertiesContent = (
        <ProjectProperties
          projectState={projectState}
          calculationState={calculationState}
          scaleSettings={scaleSettings}
          energySettings={energySettings}
          onUpdateScaleSettings={onUpdateScaleSettings}
          onUpdateEnergySettings={onUpdateEnergySettings}
        />
      );
  }

  return (
    <div className="space-y-3">
      {propertiesContent}
      <ComponentHelpMini node={selectedNode} />
    </div>
  );
}

export function RightWorkspacePanel(props: RightWorkspacePanelProps) {
  const [mode, setMode] = useState<PanelMode>("simple");

  if (!props.isOpen) {
    return (
      <aside className="flex min-h-0 flex-col items-center border-l border-slate-800 bg-slate-950/95 px-2 py-3">
        <button
          type="button"
          onClick={props.onToggle}
          title="Abrir painel de analise"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
        >
          ‹
        </button>

        <div className="mt-4 flex flex-1 items-center justify-center">
          <span className="rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Analise
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="relative min-h-0 overflow-hidden border-l border-slate-800 bg-slate-950/98 shadow-2xl shadow-slate-950/60"
      style={{ width: props.widthPx }}
    >
      <div
        role="separator"
        aria-label="Redimensionar painel de analise"
        title="Arraste para ajustar a largura do painel"
        onMouseDown={props.onResizeStart}
        className="absolute left-0 top-0 z-20 h-full w-1.5 cursor-col-resize bg-transparent transition hover:bg-cyan-400/25"
      />

      <div className="flex h-full min-h-0 flex-col pl-2">
        <div className="border-b border-slate-800 px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Painel de analise
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Resumo limpo. Abra detalhes apenas quando precisar.
              </p>
            </div>

            <button
              type="button"
              onClick={props.onToggle}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/60 hover:text-white"
              title="Recolher painel"
            >
              ›
            </button>
          </div>

          <div className="mt-3 flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setMode("simple")}
              className={[
                "flex-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
                mode === "simple"
                  ? "bg-cyan-300 text-cyan-950"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              ].join(" ")}
            >
              Simples
            </button>
            <button
              type="button"
              onClick={() => setMode("technical")}
              className={[
                "flex-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
                mode === "technical"
                  ? "bg-cyan-300 text-cyan-950"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              ].join(" ")}
            >
              Tecnico
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {mode === "simple" ? (
            <SimpleResultsView
              projectState={props.projectState}
              calculationState={props.calculationState}
            />
          ) : (
            <div className="space-y-4">
              <TechnicalPropertiesView {...props} />
              <ResultExplanationCharts
                result={props.calculationState.lastResult}
                variant="technical"
              />
              <ResultsPanel
                projectState={props.projectState}
                calculationState={props.calculationState}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
