import type { ProjectVisualState } from "../../editor/editor.types";

type ConfirmCalculateButtonProps = {
  projectState: ProjectVisualState;
  onConfirmCalculate: () => void;
};

export function ConfirmCalculateButton({
  projectState,
  onConfirmCalculate,
}: ConfirmCalculateButtonProps) {
  const isCalculated = projectState === "calculated";
  const isOutdated = projectState === "outdated";

  return (
    <button
      type="button"
      onClick={onConfirmCalculate}
      className={[
        "rounded-lg px-4 py-1.5 text-xs font-semibold transition",
        isCalculated && "bg-emerald-500 text-emerald-950 hover:bg-emerald-400",
        isOutdated &&
          "bg-yellow-300 text-yellow-950 shadow-lg shadow-yellow-500/20 hover:bg-yellow-200",
        !isCalculated &&
          !isOutdated &&
          "bg-cyan-400 text-cyan-950 hover:bg-cyan-300",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      Recalcular
    </button>
  );
}
