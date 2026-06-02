import type { ProjectVisualState } from "../../editor/editor.types";
import { ConfirmCalculateButton } from "../toolbar/ConfirmCalculateButton";

type TopbarProps = {
  projectState: ProjectVisualState;
  onConfirmCalculate: () => void;
  validationErrorCount: number;
};

export function Topbar({
  projectState,
  onConfirmCalculate,
  validationErrorCount,
}: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
          HS
        </div>

        <div>
          <h1 className="text-sm font-semibold tracking-wide text-white">
            HidroSketch
          </h1>
          <p className="text-xs text-slate-400">
            Editor hidráulico CAD-lite — Sprint 8
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          Status:{" "}
          <strong
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
          </strong>
        </span>

        {validationErrorCount > 0 && (
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-300">
            Erros: {validationErrorCount}
          </span>
        )}

        <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
          Novo
        </button>

        <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
          Salvar
        </button>

        <ConfirmCalculateButton
          projectState={projectState}
          onConfirmCalculate={onConfirmCalculate}
        />
      </div>
    </header>
  );
}