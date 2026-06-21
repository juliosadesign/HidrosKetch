import type { HydroCalculationResult } from "../../types/result.types";

type SummaryResultsProps = {
  result: HydroCalculationResult;
};

function formatNumber(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toFixed(decimals);
}

function describeGeometricHead(value: number | null): string {
  if (value === null) {
    return "Desnível ainda não calculado.";
  }

  if (value > 0) {
    return "Destino acima da origem: aumenta a carga que a bomba precisa vencer.";
  }

  if (value < 0) {
    return "Destino abaixo da origem: pode reduzir a carga geométrica exigida da bomba.";
  }

  return "Origem e destino na mesma cota geométrica.";
}

export function SummaryResults({ result }: SummaryResultsProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
        Resumo técnico
      </h3>

      <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
        Este resumo mostra a leitura principal da rede após o cálculo. Use a
        altura manométrica total para entender a carga que a bomba precisa
        vencer, e compare a carga da bomba instalada com a carga residual.
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Altura da origem</span>
          <span className="font-semibold text-white">
            {formatNumber(result.originElevationM, 2)} m
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Altura do destino</span>
          <span className="font-semibold text-white">
            {formatNumber(result.destinationElevationM, 2)} m
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Desnível geométrico</span>
          <span className="font-semibold text-white">
            {formatNumber(result.geometricHeadM, 2)} m
          </span>
        </div>

        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
          {describeGeometricHead(result.geometricHeadM)}
        </p>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Perda localizada total</span>
          <span className="font-semibold text-white">
            {formatNumber(result.totalLocalLossMca)} mca
          </span>
        </div>

        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
          Perda de carga é energia que a água perde ao passar por acessórios,
          válvulas, entradas, saídas e mudanças de direção.
        </p>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Pressão mínima desejada</span>
          <span className="font-semibold text-white">
            {formatNumber(result.requiredOutletPressureKpa, 2)} kPa
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carga da pressão desejada</span>
          <span className="font-semibold text-white">
            {formatNumber(result.requiredPressureHeadMca, 4)} mca
          </span>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
          <div className="flex justify-between gap-4">
            <span className="text-cyan-100">Altura manométrica total estimada</span>
            <span className="font-semibold text-white">
              {formatNumber(result.totalDynamicHeadMca, 4)} mca
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-cyan-100/80">
            Estimativa simplificada: desnível geométrico + perdas localizadas +
            pressão mínima desejada convertida em metros de coluna d’água.
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carga total da bomba instalada</span>
          <span className="font-semibold text-white">
            {formatNumber(result.totalPumpHeadMca)} mca
          </span>
        </div>

        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
          Carga da bomba é a energia adicionada ao sistema. Se a carga exigida
          for maior que a carga disponível, a bomba pode não atender ao sistema.
        </p>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Carga residual</span>
          <span className="font-semibold text-white">
            {formatNumber(result.residualHeadMca)} mca
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Pressão estimada</span>
          <span className="font-semibold text-white">
            {formatNumber(result.estimatedPressureKpa)} kPa
          </span>
        </div>

        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
          Pressão estimada é uma leitura simplificada da energia disponível no
          sistema em forma de pressão. Ela ajuda a avaliar se a rede ainda tem
          força para alimentar o ponto final.
        </p>
      </div>
    </div>
  );
}
