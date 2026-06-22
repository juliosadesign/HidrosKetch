import { useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

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
import { ResultsPanel } from "./ResultsPanel";
import { TankProperties } from "./TankProperties";
import { ValveProperties } from "./ValveProperties";

type BottomWorkspacePanelProps = {
  selectedNode: HydroFlowNode | null;
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  scaleSettings: EditorScaleSettings;
  energySettings: ProjectEnergySettings;
  onUpdateScaleSettings: UpdateScaleSettings;
  onUpdateEnergySettings: UpdateProjectEnergySettings;
  onUpdateSelectedNodeData: UpdateSelectedNodeData;
};

type PanelMode = "simple" | "technical";

const PANEL_MIN_HEIGHT = 88;
const PANEL_DEFAULT_HEIGHT = 118;
const PANEL_MAX_HEIGHT = 260;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

function CompactMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[118px] rounded-xl border border-slate-800 bg-slate-950/85 px-3 py-2">
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
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
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
      <CompactMetric label="Alertas" value={`${errorCount} erro(s) / ${warningCount}`} />
      <CompactMetric label="Bomba" value={getRecommendedPumpLabel(result)} />
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
    <section className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            Ajuda
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
}: BottomWorkspacePanelProps) {
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
    case "source":
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

export function BottomWorkspacePanel(props: BottomWorkspacePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>("simple");
  const [panelHeightPx, setPanelHeightPx] = useState(PANEL_DEFAULT_HEIGHT);

  const result = props.calculationState.lastResult;
  const mainFlowM3h = getMainFlowM3h(result);

  function handleResizeStart(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = panelHeightPx;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = startY - moveEvent.clientY;
      setPanelHeightPx(
        clamp(startHeight + delta, PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT)
      );
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <section className="relative shrink-0 border-t border-slate-800 bg-slate-950/98 shadow-2xl shadow-slate-950/60">
      <div
        role="separator"
        aria-label="Redimensionar painel inferior"
        title="Arraste para ajustar a altura do painel"
        onMouseDown={handleResizeStart}
        className="absolute left-1/2 top-0 z-20 h-1.5 w-28 -translate-x-1/2 cursor-row-resize rounded-b-full bg-cyan-500/45 transition hover:bg-cyan-300"
      />

      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Analise
          </p>
          <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
            {getProjectStateLabel(props.projectState)}
          </span>
          {result && (
            <>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">
                Vazao {formatNumber(mainFlowM3h, 2)} m3/h
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">
                HMT {formatNumber(result.totalDynamicHeadMca, 2)} mca
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">
                Custo {formatCurrencyBRL(result.monthlyEnergyCostBRL)}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setMode("simple")}
                className={[
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
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
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
                  mode === "technical"
                    ? "bg-cyan-300 text-cyan-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                ].join(" ")}
              >
                Tecnico
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-100"
          >
            {isOpen ? "Recolher" : "Analise"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="overflow-y-auto border-t border-slate-800 px-3 py-2"
          style={{ height: panelHeightPx }}
        >
          {mode === "simple" ? (
            <SimpleResultsView
              projectState={props.projectState}
              calculationState={props.calculationState}
            />
          ) : (
            <div className="grid gap-3 xl:grid-cols-[minmax(300px,0.85fr)_minmax(380px,1.15fr)]">
              <div className="space-y-3">
                <TechnicalPropertiesView {...props} />
              </div>

              <div className="space-y-3">
                <ResultsPanel
                  projectState={props.projectState}
                  calculationState={props.calculationState}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

