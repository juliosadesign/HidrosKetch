import type { ProjectVisualState } from "../../editor/editor.types";
import type { StoredCalculationState } from "../../store/resultStore";

import { SummaryResults } from "./SummaryResults";
import { ComponentResultsTable } from "./ComponentResultsTable";
import { WarningsPanel } from "./WarningsPanel";
import { PumpCatalogPanel } from "./PumpCatalogPanel";
import { PumpRecommendationPanel } from "./PumpRecommendationPanel";

type ResultsPanelProps = {
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
};


function ResultsHelpCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
        Como interpretar os resultados?
      </h3>

      <div className="mt-3 space-y-3 text-xs leading-5 text-slate-400">
        <p>
          <strong className="text-slate-200">Vazão</strong> indica a quantidade
          de água que passa pelo sistema por segundo.
        </p>
        <p>
          <strong className="text-slate-200">Perda de carga</strong> mostra a
          energia perdida em acessórios, válvulas e mudanças de direção.
        </p>
        <p>
          <strong className="text-slate-200">Pressão</strong> é a força estimada
          disponível no escoamento após considerar bombas, perdas e desníveis.
        </p>
        <p>
          <strong className="text-slate-200">Altura manométrica</strong> resume
          a carga que a bomba precisa vencer: desnível, perdas e pressão mínima
          desejada.
        </p>
        <p>
          <strong className="text-slate-200">Consumo e custo</strong> usam a
          potência elétrica estimada, as horas de uso, os dias por mês e a tarifa
          em R$/kWh para prever gasto mensal aproximado.
        </p>
        <p>
          <strong className="text-slate-200">Alertas</strong> indicam dados
          ausentes, hipóteses simplificadas ou pontos que precisam ser revisados
          antes de usar o resultado como pré-dimensionamento.
        </p>
      </div>
    </div>
  );
}

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
          “Confirmar e recalcular” para validar os dados, calcular as perdas e
          gerar o resumo técnico.
        </p>

        <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs leading-5 text-cyan-50/90">
          Dica: comece adicionando uma origem, uma bomba quando houver elevação
          ou pressão desejada, os tubos e os acessórios que representam o caminho
          real da água.
        </p>

        {validation && validation.errors.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3">
            <p className="text-xs font-semibold text-red-300">
              O cálculo foi bloqueado por erros de validação. Corrija os pontos
              abaixo e tente recalcular.
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
            em “Confirmar e recalcular” para atualizar vazão, perdas, pressão e
            altura manométrica.
          </p>
        </div>
      )}

      {projectState === "calculated" && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Resultado atualizado
          </h3>

          <p className="mt-2 text-xs leading-5 text-emerald-100">
            Os resultados correspondem ao estado atual do projeto e podem ser
            usados como leitura didática/preliminar da rede.
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
            preservado para comparação. Corrija os erros listados antes de usar
            os valores como referência.
          </p>

          <ul className="mt-3 space-y-1 text-xs leading-5 text-red-100">
            {validation.errors.map((error) => (
              <li key={error.id}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <ResultsHelpCard />

      <SummaryResults result={result} />

      <ComponentResultsTable rows={result.componentResults} />

      <PumpRecommendationPanel result={result} />

      <PumpCatalogPanel result={result} />

      <WarningsPanel
        validationWarnings={validation?.warnings ?? []}
        resultWarnings={result.warnings}
        assumptions={result.assumptions}
      />
    </div>
  );
}