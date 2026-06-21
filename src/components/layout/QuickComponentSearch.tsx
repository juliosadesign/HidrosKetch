import { useMemo, useState } from "react";

import {
  COMPONENT_CATALOG,
  type ComponentCatalogItem,
} from "../../domain/catalogs/componentCatalog";

const QUICK_CATEGORIES = [
  "Todos",
  "Fontes e reservatórios",
  "Tubulação",
  "Acessórios com K",
  "Válvulas",
  "Bombas",
  "Instrumentos",
  "Anotações",
] as const;

type QuickCategory = (typeof QUICK_CATEGORIES)[number];

type QuickComponentSearchProps = {
  onAddComponent: (component: ComponentCatalogItem) => void;
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCategoryAliases(category: string, kind: string) {
  if (kind === "pump") return ["Bombas", "Energia"];
  if (category === "Fontes e reservação") {
    return ["Fontes e reservatórios", "Fontes e reservação"];
  }

  return [category];
}

function matchesCategory(item: ComponentCatalogItem, category: QuickCategory) {
  if (category === "Todos") return true;

  return getCategoryAliases(item.category, item.kind).some(
    (alias) => normalizeSearchText(alias) === normalizeSearchText(category)
  );
}

function getKindLabel(item: ComponentCatalogItem) {
  if (item.kind === "reservoir" || item.kind === "tank") return "Fonte";
  if (item.kind === "pipe" || item.kind === "junction") return "Tubulação";
  if (item.kind === "accessory") return "Acessório K";
  if (item.kind === "valve") return "Válvula";
  if (item.kind === "pump") return "Bomba";
  if (item.kind === "instrument") return "Instrumento";
  if (item.kind === "label") return "Anotação";

  return item.category;
}

export function QuickComponentSearch({
  onAddComponent,
}: QuickComponentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<QuickCategory>("Todos");
  const [isOpen, setIsOpen] = useState(false);

  const filteredComponents = useMemo(() => {
    const normalizedTerm = normalizeSearchText(searchTerm);

    return COMPONENT_CATALOG.filter((item) => {
      const categoryMatch = matchesCategory(item, activeCategory);

      const searchableText = normalizeSearchText(
        [
          item.name,
          item.description,
          item.category,
          item.kind,
          getKindLabel(item),
          ...getCategoryAliases(item.category, item.kind),
        ].join(" ")
      );

      const termMatch =
        normalizedTerm.length === 0 || searchableText.includes(normalizedTerm);

      return categoryMatch && termMatch;
    }).slice(0, 8);
  }, [activeCategory, searchTerm]);

  function handleSelectComponent(component: ComponentCatalogItem) {
    onAddComponent(component);
    setIsOpen(false);
    setSearchTerm("");
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-2 shadow-xl shadow-slate-950/30">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <span className="hidden h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)] sm:inline-block" />
            Biblioteca rápida
          </div>

          <div className="relative min-w-[220px] flex-1">
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              type="search"
              placeholder="Pesquisar bomba, cano, joelho, válvula, reservatório..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
            />

            {isOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950/98 p-2 shadow-2xl shadow-slate-950/70 backdrop-blur">
                <div className="mb-2 flex items-center justify-between gap-3 px-2 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Resultados rápidos
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-slate-800 px-2 py-1 text-[11px] text-slate-400 transition hover:border-cyan-500/50 hover:text-cyan-200"
                  >
                    Fechar
                  </button>
                </div>

                {filteredComponents.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {filteredComponents.map((component) => (
                      <button
                        key={component.id}
                        type="button"
                        onClick={() => handleSelectComponent(component)}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left transition hover:border-cyan-400/60 hover:bg-slate-800"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-100">
                            {component.name}
                          </span>
                          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                            {getKindLabel(component)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-400">
                          {component.description}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-100/90">
                    Nenhum componente encontrado. Tente pesquisar por cano,
                    bomba, joelho, válvula, reservatório ou medidor.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 xl:max-w-[48rem] xl:pb-0">
          {QUICK_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setIsOpen(true);
                }}
                className={[
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                  isActive
                    ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-100",
                ].join(" ")}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
