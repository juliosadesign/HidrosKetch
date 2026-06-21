import type { CalculationWarning } from "../../types/result.types";
import type { ValidationIssue } from "../../engine/validation/validation.types";

type WarningsPanelProps = {
  validationWarnings?: ValidationIssue[];
  resultWarnings?: CalculationWarning[];
  assumptions?: string[];
};

export function WarningsPanel({
  validationWarnings = [],
  resultWarnings = [],
  assumptions = [],
}: WarningsPanelProps) {
  const hasWarnings =
    validationWarnings.length > 0 ||
    resultWarnings.length > 0 ||
    assumptions.length > 0;

  if (!hasWarnings) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
        Alertas, hipóteses e pontos de atenção
      </h3>

      <p className="mt-2 text-xs leading-5 text-yellow-100/90">
        Esta área explica o que precisa ser conferido. Alertas não significam
        necessariamente que o projeto está errado, mas indicam dados que podem
        mudar o resultado.
      </p>

      {validationWarnings.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-yellow-100">
            Alertas de validação da rede
          </p>

          <ul className="mt-2 space-y-1 text-xs leading-5 text-yellow-100">
            {validationWarnings.map((warning) => (
              <li key={warning.id}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {resultWarnings.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-yellow-100">
            Alertas do cálculo hidráulico
          </p>

          <ul className="mt-2 space-y-1 text-xs leading-5 text-yellow-100">
            {resultWarnings.map((warning) => (
              <li key={warning.id}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {assumptions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-yellow-100">
            Hipóteses simplificadoras usadas
          </p>

          <ul className="mt-2 space-y-1 text-xs leading-5 text-yellow-100">
            {assumptions.map((assumption) => (
              <li key={assumption}>• {assumption}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}