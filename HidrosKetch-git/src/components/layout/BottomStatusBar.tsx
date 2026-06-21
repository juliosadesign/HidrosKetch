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
    <footer className="flex h-10 items-center justify-between border-t border-slate-800 bg-slate-900 px-4 text-xs text-slate-400">
      <div className="flex items-center gap-4">
        <span>
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

        <span>Escala: 1 m = {scaleSettings.pixelsPerMeter}px</span>
        <span>Grade: {scaleSettings.gridEnabled ? "ativa" : "inativa"}</span>
        <span>Régua: {scaleSettings.rulerEnabled ? "ativa" : "inativa"}</span>
        <span>Snap: {scaleSettings.snapEnabled ? "ativo" : "inativo"}</span>
      </div>

      <div className="flex items-center gap-4">
        <span>Sprint 10 — Grade, régua e escala real</span>
      </div>
    </footer>
  );
}