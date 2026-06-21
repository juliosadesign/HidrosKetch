import type { MouseEvent as ReactMouseEvent } from "react";

import { COMPONENT_CATALOG } from "../../domain/catalogs/componentCatalog";
import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";
import { getComponentUsageGuide } from "../../domain/catalogs/componentHelp";

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  onAddComponent: (component: ComponentCatalogItem) => void;
  onResizeStart: (event: ReactMouseEvent<HTMLDivElement>) => void;
  widthPx: number;
};

function groupCatalogByCategory() {
  return COMPONENT_CATALOG.reduce<Record<string, ComponentCatalogItem[]>>(
    (groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);
      return groups;
    },
    {}
  );
}

// Biblioteca lateral de componentes.
// Sprint 13A: barra retrátil para liberar espaço para a prancheta.
// Sprint 18: largura ajustável pelo mouse com limite mínimo e máximo.
export function Sidebar({
  isCollapsed,
  onToggle,
  onAddComponent,
  onResizeStart,
  widthPx,
}: SidebarProps) {
  const groupedCatalog = groupCatalogByCategory();

  if (isCollapsed) {
    return (
      <aside className="flex min-h-0 flex-col items-center border-r border-slate-800 bg-slate-900/80 px-2 py-4">
        <button
          type="button"
          onClick={onToggle}
          title="Expandir biblioteca de componentes"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
        >
          ☰
        </button>

        <div className="mt-4 flex flex-1 items-center justify-center">
          <span className="rotate-[-90deg] whitespace-nowrap text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Componentes
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative min-h-0 overflow-y-auto border-r border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40">
      <div
        role="separator"
        aria-label="Redimensionar biblioteca de componentes"
        title="Arraste para aumentar ou reduzir a biblioteca de componentes"
        onMouseDown={onResizeStart}
        className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize bg-transparent transition hover:bg-cyan-400/25"
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Biblioteca de componentes
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Clique em um componente para adicioná-lo à prancheta.
          </p>

          <p className="mt-2 text-[11px] leading-4 text-slate-500">
            Largura atual: {Math.round(widthPx)} px. Arraste a borda direita
            para ajustar sem ocupar a tela inteira.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          title="Recolher biblioteca de componentes"
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/60 hover:bg-slate-800 hover:text-white"
        >
          ⟨
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedCatalog).map(([category, items]) => (
          <section key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              {category}
            </h3>

            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onAddComponent(item)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-cyan-500/60 hover:bg-slate-800"
                >
                  <span className="block text-sm font-medium text-slate-100">
                    {item.name}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {item.description}
                  </span>

                  <span className="mt-2 block rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-[11px] leading-4 text-slate-400">
                    <strong className="text-cyan-300">Uso:</strong>{" "}
                    {getComponentUsageGuide(item.id, item.kind).whenToUse}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
