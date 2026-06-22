import { useState, type Dispatch, type SetStateAction } from "react";

import type { OnEdgesChange, OnNodesChange } from "@xyflow/react";

import { HydroEditor } from "./HydroEditor";

import type {
  AddComponentRequest,
  EditorScaleSettings,
  HydroFlowEdge,
  HydroFlowNode,
  ProjectVisualState,
} from "./editor.types";

type HydroSketchCanvasProps = {
  addRequest: AddComponentRequest | null;

  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];

  setNodes: Dispatch<SetStateAction<HydroFlowNode[]>>;
  setEdges: Dispatch<SetStateAction<HydroFlowEdge[]>>;

  onNodesChange: OnNodesChange<HydroFlowNode>;
  onEdgesChange: OnEdgesChange<HydroFlowEdge>;

  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;

  projectState: ProjectVisualState;
  setProjectState: Dispatch<SetStateAction<ProjectVisualState>>;

  scaleSettings: EditorScaleSettings;
  onCreateSimpleNetwork: () => void;
};

function EmptyProjectIntro({
  onCreateSimpleNetwork,
}: {
  onCreateSimpleNetwork: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <section className="pointer-events-auto w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
              Simulador visual hidráulico
            </span>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
              HidroSketch
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Monte redes hidráulicas, estime perdas de carga, altura
              manométrica, potência, consumo de energia e pré-selecione bombas
              de forma didática.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <button
              type="button"
              onClick={onCreateSimpleNetwork}
              className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-cyan-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200"
            >
              Iniciar simulação
            </button>

            <button
              type="button"
              onClick={() => setShowDetails((current) => !current)}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
              aria-expanded={showDetails}
            >
              {showDetails ? "Ocultar detalhes" : "Ver mais detalhes"}
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["1", "Monte a rede", "Adicione reservatórios, bomba, tubos, válvulas e acessórios."],
                ["2", "Recalcule", "Clique em Confirmar e recalcular para validar e calcular."],
                ["3", "Analise", "Veja resultados, bomba indicada, curva, CSV e relatório técnico."],
              ].map(([step, title, description]) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-sm font-bold text-cyan-200">
                    {step}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <p className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-50/80">
              Modelo preliminar para estudo e apresentação. A escolha final da
              bomba deve ser confirmada em catálogo oficial e com
              dimensionamento completo.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export function HydroSketchCanvas(props: HydroSketchCanvasProps) {
  const hasComponents = props.nodes.length > 0;

  return (
    <section className="relative min-h-0 flex-1 overflow-hidden bg-slate-950">
      <HydroEditor {...props} />

      {!hasComponents && (
        <EmptyProjectIntro onCreateSimpleNetwork={props.onCreateSimpleNetwork} />
      )}
    </section>
  );
}
