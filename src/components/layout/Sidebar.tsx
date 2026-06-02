import { COMPONENT_CATALOG } from "../../domain/catalogs/componentCatalog";
import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";

type SidebarProps = {
  onAddComponent: (component: ComponentCatalogItem) => void;
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
// Agora os botões realmente enviam o componente escolhido para o editor.
export function Sidebar({ onAddComponent }: SidebarProps) {
  const groupedCatalog = groupCatalogByCategory();

  return (
    <aside className="min-h-0 overflow-y-auto border-r border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">
          Biblioteca de componentes
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Clique em um componente para adicioná-lo à prancheta.
        </p>
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left transition hover:border-cyan-500/60 hover:bg-slate-800"
                >
                  <span className="block text-sm font-medium text-slate-100">
                    {item.name}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {item.description}
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