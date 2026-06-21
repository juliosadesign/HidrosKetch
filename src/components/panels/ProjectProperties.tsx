import type {
  EditorScaleSettings,
  ProjectEnergySettings,
  ProjectVisualState,
  UpdateProjectEnergySettings,
  UpdateScaleSettings,
} from "../../editor/editor.types";
import type { StoredCalculationState } from "../../store/resultStore";

import { ResultsPanel } from "./ResultsPanel";

type ProjectPropertiesProps = {
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  scaleSettings: EditorScaleSettings;
  energySettings: ProjectEnergySettings;
  onUpdateScaleSettings: UpdateScaleSettings;
  onUpdateEnergySettings: UpdateProjectEnergySettings;
};

function readNumberInput(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProjectProperties({
  projectState,
  calculationState,
  scaleSettings,
  energySettings,
  onUpdateScaleSettings,
  onUpdateEnergySettings,
}: ProjectPropertiesProps) {
  const geometricHeadM =
    energySettings.destinationElevationM - energySettings.originElevationM;

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

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Altura, desnível e pressão final
        </h3>

        <p className="mt-2 text-xs leading-5 text-cyan-100/80">
          Estes campos servem como dados gerais do projeto. Se existir um
          reservatório, tanque ou nó marcado como origem/destino com cota
          própria, o cálculo usa a cota do componente. Caso contrário, usa os
          valores abaixo.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-slate-400">
            Altura da origem m
            <input
              type="number"
              step="0.1"
              value={energySettings.originElevationM}
              onChange={(event) =>
                onUpdateEnergySettings({
                  originElevationM: readNumberInput(event.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Altura do destino m
            <input
              type="number"
              step="0.1"
              value={energySettings.destinationElevationM}
              onChange={(event) =>
                onUpdateEnergySettings({
                  destinationElevationM: readNumberInput(event.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Pressão mínima desejada no ponto final kPa
            <input
              type="number"
              min={0}
              step="1"
              value={energySettings.requiredOutletPressureKpa}
              onChange={(event) =>
                onUpdateEnergySettings({
                  requiredOutletPressureKpa: Math.max(
                    0,
                    readNumberInput(event.target.value)
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Desnível geométrico</span>
              <strong className="text-white">{geometricHeadM.toFixed(2)} m</strong>
            </div>

            <p className="mt-2 text-slate-400">
              {geometricHeadM > 0
                ? "O destino está acima da origem. A bomba precisa vencer essa altura."
                : geometricHeadM < 0
                  ? "O destino está abaixo da origem. Esse desnível pode reduzir a carga exigida da bomba."
                  : "Origem e destino estão na mesma cota geométrica."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
          Consumo e custo de energia
        </h3>

        <p className="mt-2 text-xs leading-5 text-yellow-100/80">
          Estes campos não recalculam sozinhos. Eles ficam salvos como dados de
          operação e entram no resultado somente depois de clicar em “Confirmar
          e recalcular”.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-slate-400">
            Horas de uso por dia
            <input
              type="number"
              min={0}
              step="0.5"
              value={energySettings.operationHoursPerDay}
              onChange={(event) =>
                onUpdateEnergySettings({
                  operationHoursPerDay: Math.max(
                    0,
                    readNumberInput(event.target.value)
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Dias de uso por mês
            <input
              type="number"
              min={0}
              max={31}
              step="1"
              value={energySettings.operationDaysPerMonth}
              onChange={(event) =>
                onUpdateEnergySettings({
                  operationDaysPerMonth: Math.min(
                    31,
                    Math.max(0, readNumberInput(event.target.value))
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Tarifa de energia R$/kWh
            <input
              type="number"
              min={0}
              step="0.01"
              value={energySettings.energyTariffBRLKwh}
              onChange={(event) =>
                onUpdateEnergySettings({
                  energyTariffBRLKwh: Math.max(
                    0,
                    readNumberInput(event.target.value)
                  ),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <p className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
            Valores padrão: 2 horas por dia, 30 dias por mês e tarifa de R$ 0,90/kWh.
            A potência elétrica é estimada de forma simplificada a partir da vazão,
            da altura manométrica total e de uma eficiência padrão quando a bomba
            não informar rendimento próprio.
          </p>
        </div>
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
