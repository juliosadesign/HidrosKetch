import type {
  EditorScaleSettings,
  ProjectVisualState,
  UpdateScaleSettings,
} from "../../editor/editor.types";
import type { StoredCalculationState } from "../../store/resultStore";

import { ResultsPanel } from "./ResultsPanel";

type ProjectPropertiesProps = {
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  scaleSettings: EditorScaleSettings;
  onUpdateScaleSettings: UpdateScaleSettings;
};

export function ProjectProperties({
  projectState,
  calculationState,
  scaleSettings,
  onUpdateScaleSettings,
}: ProjectPropertiesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">
          Propriedades do projeto
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Nenhum componente selecionado. Aqui aparecem os dados gerais, escala,
          grade, régua e resultados.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Configurações CAD-lite
        </h3>

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-slate-400">
            Escala px/m
            <input
              type="number"
              min={10}
              value={scaleSettings.pixelsPerMeter}
              onChange={(event) =>
                onUpdateScaleSettings({
                  pixelsPerMeter: Math.max(10, Number(event.target.value)),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Espaçamento da grade px
            <input
              type="number"
              min={5}
              value={scaleSettings.gridSpacingPx}
              onChange={(event) =>
                onUpdateScaleSettings({
                  gridSpacingPx: Math.max(5, Number(event.target.value)),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={scaleSettings.gridEnabled}
              onChange={(event) =>
                onUpdateScaleSettings({ gridEnabled: event.target.checked })
              }
            />
            Mostrar grade
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={scaleSettings.rulerEnabled}
              onChange={(event) =>
                onUpdateScaleSettings({ rulerEnabled: event.target.checked })
              }
            />
            Mostrar régua
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={scaleSettings.snapEnabled}
              onChange={(event) =>
                onUpdateScaleSettings({ snapEnabled: event.target.checked })
              }
            />
            Ativar snap na grade
          </label>

          <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs leading-5 text-slate-400">
            Escala atual:{" "}
            <strong className="text-slate-100">
              1 m = {scaleSettings.pixelsPerMeter}px
            </strong>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Nome</span>
            <span className="text-slate-300">Projeto sem título</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Fluido</span>
            <span className="text-slate-300">Água</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Estado</span>
            <span
              className={
                projectState === "calculated"
                  ? "text-emerald-300"
                  : projectState === "outdated"
                    ? "text-yellow-300"
                    : "text-slate-300"
              }
            >
              {projectState === "calculated"
                ? "Calculado"
                : projectState === "outdated"
                  ? "Desatualizado"
                  : "Rascunho"}
            </span>
          </div>
        </div>
      </div>

      <ResultsPanel
        projectState={projectState}
        calculationState={calculationState}
      />
    </div>
  );
}