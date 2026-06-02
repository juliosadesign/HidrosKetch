import type { ProjectVisualState } from "../../editor/editor.types";
import type { StoredCalculationState } from "../../store/resultStore";

import { SummaryResults } from "./SummaryResults";
import { ComponentResultsTable } from "./ComponentResultsTable";
import { WarningsPanel } from "./WarningsPanel";

type ResultsPanelProps = {
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
};

export function ResultsPanel({
  projectState,
  calculationState,
}: ResultsPanelProps) {
  const result = calculationState.lastResult;
  const validation = calculationState.lastValidation;

  if (!result) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Resultados
        </h3>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          Nenhum cálculo foi executado ainda. Monte uma rede válida e clique em
          “Confirmar e recalcular”.
        </p>

        {validation && validation.errors.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3">
            <p className="text-xs font-semibold text-red-300">
              O cálculo foi bloqueado por erros de validação.
            </p>

            <ul className="mt-2 space-y-1 text-xs leading-5 text-red-100">
              {validation.errors.map((error) => (
                <li key={error.id}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const isOutdated = projectState === "outdated";

  return (
    <div className="space-y-4">
      {isOutdated && (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
            Resultado desatualizado
          </h3>

          <p className="mt-2 text-xs leading-5 text-yellow-100">
            O projeto foi alterado após o último cálculo. Os resultados abaixo
            continuam visíveis, mas pertencem à versão anterior da rede. Clique
            em “Confirmar e recalcular” para atualizar.
          </p>
        </div>
      )}

      {projectState === "calculated" && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Resultado atualizado
          </h3>

          <p className="mt-2 text-xs leading-5 text-emerald-100">
            Os resultados correspondem ao estado atual do projeto.
          </p>
        </div>
      )}

      {validation && validation.errors.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-red-300">
            Erros na tentativa mais recente
          </h3>

          <p className="mt-2 text-xs leading-5 text-red-100">
            O último recálculo foi bloqueado, mas o resultado anterior foi
            preservado.
          </p>

          <ul className="mt-3 space-y-1 text-xs leading-5 text-red-100">
            {validation.errors.map((error) => (
              <li key={error.id}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <SummaryResults result={result} />

      <ComponentResultsTable rows={result.componentResults} />

      <WarningsPanel
        validationWarnings={validation?.warnings ?? []}
        resultWarnings={result.warnings}
        assumptions={result.assumptions}
      />
    </div>
  );
}