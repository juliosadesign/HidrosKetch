import type {
  EditorScaleSettings,
  ProjectVisualState,
} from "../../editor/editor.types";

type BottomStatusBarProps = {
  projectState: ProjectVisualState;
  scaleSettings: EditorScaleSettings;
};

export function BottomStatusBar({
  projectState,
  scaleSettings,
}: BottomStatusBarProps) {
  return (
    <footer className="flex h-10 items-center justify-between gap-4 border-t border-slate-800 bg-slate-900 px-4 text-xs text-slate-400">
      <div className="flex min-w-0 items-center gap-4 overflow-hidden">
        <span className="shrink-0">
          Status: {" "}
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

        <span className="hidden shrink-0 sm:inline">
          Escala: 1 m = {scaleSettings.pixelsPerMeter}px
        </span>
        <span className="hidden shrink-0 md:inline">
          Grade: {scaleSettings.gridEnabled ? "ativa" : "inativa"}
        </span>
        <span className="hidden shrink-0 md:inline">
          Régua: {scaleSettings.rulerEnabled ? "ativa" : "inativa"}
        </span>
        <span className="hidden shrink-0 lg:inline">
          Snap: {scaleSettings.snapEnabled ? "ativo" : "inativo"}
        </span>
      </div>

      <div className="hidden shrink-0 items-center gap-4 text-slate-500 sm:flex">
        <span>Sprint 18 — versão final para apresentação</span>
      </div>
    </footer>
  );
}
