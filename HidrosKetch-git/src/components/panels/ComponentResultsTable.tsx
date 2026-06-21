import type { ComponentCalculationResult } from "../../types/result.types";

type ComponentResultsTableProps = {
  rows: ComponentCalculationResult[];
};

function formatNumber(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toFixed(decimals);
}

export function ComponentResultsTable({ rows }: ComponentResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400">
        Nenhum componente com perda localizada foi calculado.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
        Tabela de perdas por componente
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              <th className="pb-2 pr-3">Componente</th>
              <th className="pb-2 pr-3">K</th>
              <th className="pb-2 pr-3">D mm</th>
              <th className="pb-2 pr-3">Q L/s</th>
              <th className="pb-2 pr-3">V m/s</th>
              <th className="pb-2 pr-3">Perda mca</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.componentId} className="border-b border-slate-900">
                <td className="py-2 pr-3 text-slate-200">
                  {row.componentName}
                </td>
                <td className="py-2 pr-3 text-slate-400">
                  {formatNumber(row.kValue, 2)}
                </td>
                <td className="py-2 pr-3 text-slate-400">
                  {formatNumber(row.diameterMm, 0)}
                </td>
                <td className="py-2 pr-3 text-slate-400">
                  {formatNumber(row.flowLps, 3)}
                </td>
                <td className="py-2 pr-3 text-slate-400">
                  {formatNumber(row.velocityMs, 4)}
                </td>
                <td className="py-2 pr-3 font-semibold text-cyan-200">
                  {formatNumber(row.localLossMca, 5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}