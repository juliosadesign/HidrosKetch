import { useState, type MouseEvent as ReactMouseEvent } from "react";

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
  import { getComponentUsageGuide } from "../../domain/catalogs/componentHelp";
  
  import { ProjectProperties } from "./ProjectProperties";
  import { PipeProperties } from "./PipeProperties";
  import { AccessoryProperties } from "./AccessoryProperties";
  import { ValveProperties } from "./ValveProperties";
  import { PumpProperties } from "./PumpProperties";
  import { ReservoirProperties } from "./ReservoirProperties";
  import { TankProperties } from "./TankProperties";
  import { InstrumentProperties } from "./InstrumentProperties";
  import { LabelProperties } from "./LabelProperties";
  
  type PropertiesPanelProps = {
    selectedNode: HydroFlowNode | null;
    projectState: ProjectVisualState;
    calculationState: StoredCalculationState;
    scaleSettings: EditorScaleSettings;
    energySettings: ProjectEnergySettings;
    isCollapsed: boolean;
    onToggle: () => void;
    onResizeStart: (event: ReactMouseEvent<HTMLDivElement>) => void;
    widthPx: number;
    onUpdateScaleSettings: UpdateScaleSettings;
    onUpdateEnergySettings: UpdateProjectEnergySettings;
    onUpdateSelectedNodeData: UpdateSelectedNodeData;
  };

  function ComponentHelpCard({ node }: { node: HydroFlowNode }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const guide = getComponentUsageGuide(
      String(node.data.catalogItemId ?? ""),
      node.data.componentKind
    );
    const summary =
      guide.purpose.length > 130
        ? `${guide.purpose.slice(0, 127).trim()}...`
        : guide.purpose;

    return (
      <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 transition-all">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Como usar este componente?
            </h3>

            <p className="mt-2 text-sm font-semibold text-white">
              {guide.title}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="rounded-xl border border-cyan-500/40 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Ocultar explicação" : "Ver explicação"}
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-cyan-50/90">
          {summary}
        </p>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold text-slate-200">
                Quando usar
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {guide.whenToUse}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold text-slate-200">
                Campos importantes
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
                {guide.importantFields.map((field) => (
                  <li key={field}>• {field}</li>
                ))}
              </ul>
            </div>

            <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-50/90">
              <strong className="text-yellow-200">Observação técnica:</strong>{" "}
              {guide.technicalNote}
            </p>
          </div>
        )}
      </section>
    );
  }
  
  export function PropertiesPanel({
    selectedNode,
    projectState,
    calculationState,
    scaleSettings,
    energySettings,
    isCollapsed,
    onToggle,
    onResizeStart,
    widthPx,
    onUpdateScaleSettings,
    onUpdateEnergySettings,
    onUpdateSelectedNodeData,
  }: PropertiesPanelProps) {
    function renderContent() {
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
  
      switch (selectedNode.data.componentKind) {
        case "pipe":
          return (
            <PipeProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "accessory":
          return (
            <AccessoryProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "valve":
          return (
            <ValveProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "pump":
          return (
            <PumpProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "reservoir":
          return (
            <ReservoirProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "tank":
          return (
            <TankProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "instrument":
          return (
            <InstrumentProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "label":
          return (
            <LabelProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        default:
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
    }

    if (isCollapsed) {
      return (
        <aside className="flex min-h-0 flex-col items-center border-l border-slate-800 bg-slate-900/80 px-2 py-4">
          <button
            type="button"
            onClick={onToggle}
            title="Expandir painel técnico"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
          >
            ⟩
          </button>

          <div className="mt-4 flex flex-1 items-center justify-center">
            <span className="rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Propriedades
            </span>
          </div>
        </aside>
      );
    }
  
    return (
      <aside className="relative min-h-0 overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40">
        <div
          role="separator"
          aria-label="Redimensionar painel técnico"
          title="Arraste para aumentar ou reduzir o painel técnico"
          onMouseDown={onResizeStart}
          className="absolute left-0 top-0 z-20 h-full w-2 cursor-col-resize bg-transparent transition hover:bg-cyan-400/25"
        />

        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Painel técnico
            </h2>
            <p className="text-xs text-slate-500">
              Propriedades, escala, resultados e validações.
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Largura atual: {Math.round(widthPx)} px. Arraste a borda esquerda
              para ajustar.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            title="Recolher painel técnico"
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/60 hover:bg-slate-800 hover:text-white"
          >
            ⟩
          </button>
        </div>

        <div className="space-y-4">
          {renderContent()}
          {selectedNode && <ComponentHelpCard key={selectedNode.id} node={selectedNode} />}
        </div>
      </aside>
    );
  }
