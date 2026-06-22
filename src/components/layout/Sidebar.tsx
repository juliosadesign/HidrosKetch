import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";

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

type ToolCategory = {
  id: string;
  label: string;
  compactLabel: string;
  icon: string;
  aliases: string[];
};

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "all",
    label: "Todos",
    compactLabel: "Todos",
    icon: "+",
    aliases: ["todos"],
  },
  {
    id: "sources",
    label: "Fontes e reservatorios",
    compactLabel: "Fontes",
    icon: "F",
    aliases: ["fontes e reservatorios", "fontes e reservacao", "reservatorio"],
  },
  {
    id: "pipes",
    label: "Tubulacao",
    compactLabel: "Tubos",
    icon: "P",
    aliases: ["tubulacao", "tubulacao"],
  },
  {
    id: "accessories",
    label: "Acessorios com K",
    compactLabel: "K",
    icon: "K",
    aliases: ["acessorios com k", "acessorios com k"],
  },
  {
    id: "valves",
    label: "Valvulas",
    compactLabel: "Valvulas",
    icon: "V",
    aliases: ["valvulas", "valvulas"],
  },
  {
    id: "pumps",
    label: "Bombas",
    compactLabel: "Bombas",
    icon: "B",
    aliases: ["bombas"],
  },
  {
    id: "instruments",
    label: "Instrumentos",
    compactLabel: "Medir",
    icon: "M",
    aliases: ["instrumentos"],
  },
  {
    id: "notes",
    label: "Anotacoes",
    compactLabel: "Notas",
    icon: "T",
    aliases: ["anotacoes", "anotacoes"],
  },
];

const COLLAPSED_TOOL_GROUP_IDS = [
  "sources",
  "pipes",
  "accessories",
  "valves",
  "pumps",
  "instruments",
  "notes",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getKindLabel(item: ComponentCatalogItem) {
  if (item.kind === "reservoir" || item.kind === "tank") return "Fonte";
  if (item.kind === "pipe" || item.kind === "junction") return "Tubulacao";
  if (item.kind === "accessory") return "Acessorio K";
  if (item.kind === "valve") return "Valvula";
  if (item.kind === "pump") return "Bomba";
  if (item.kind === "instrument") return "Instrumento";
  if (item.kind === "label") return "Anotacao";

  return item.category;
}

function getCategoryForItem(item: ComponentCatalogItem) {
  const normalizedCategory = normalizeText(item.category);

  if (item.kind === "pump") return "pumps";
  if (item.kind === "instrument") return "instruments";
  if (item.kind === "label") return "notes";
  if (item.kind === "reservoir" || item.kind === "tank") return "sources";
  if (item.kind === "pipe" || item.kind === "junction") return "pipes";
  if (item.kind === "accessory") return "accessories";
  if (item.kind === "valve") return "valves";

  const matchedCategory = TOOL_CATEGORIES.find((category) =>
    category.aliases.some((alias) => normalizeText(alias) === normalizedCategory)
  );

  return matchedCategory?.id ?? "all";
}

function getToolIcon(item: ComponentCatalogItem) {
  if (item.kind === "reservoir") return "F";
  if (item.kind === "tank") return "T";
  if (item.kind === "pipe") return "P";
  if (item.kind === "junction") return "N";
  if (item.kind === "accessory") return "K";
  if (item.kind === "valve") return "V";
  if (item.kind === "pump") return "B";
  if (item.kind === "instrument") return "M";
  if (item.kind === "label") return "T";

  return "";
}

function getShortText(text: string, maxLength = 68) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function matchesSearch(item: ComponentCatalogItem, searchTerm: string) {
  const normalizedTerm = normalizeText(searchTerm);

  if (normalizedTerm.length === 0) return true;

  const searchableText = normalizeText(
    [
      item.name,
      item.description,
      item.category,
      item.kind,
      getKindLabel(item),
      getCategoryForItem(item),
    ].join(" ")
  );

  return searchableText.includes(normalizedTerm);
}

function getCategoryById(categoryId: string) {
  return TOOL_CATEGORIES.find((category) => category.id === categoryId);
}

// Biblioteca lateral de componentes.
// Sprint 20A.2: quando recolhida, funciona como uma barra de ferramentas
// estilo Photoshop. O clique abre o grupo e mostra todos os componentes por nome.
export function Sidebar({
  isCollapsed,
  onToggle,
  onAddComponent,
  onResizeStart,
  widthPx,
}: SidebarProps) {
  const [expandedComponentIds, setExpandedComponentIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [activeFlyoutCategoryId, setActiveFlyoutCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const filteredCatalog = useMemo(() => {
    return COMPONENT_CATALOG.filter((item) => {
      const categoryMatch =
        activeCategoryId === "all" || getCategoryForItem(item) === activeCategoryId;

      return categoryMatch && matchesSearch(item, searchTerm);
    });
  }, [activeCategoryId, searchTerm]);

  const catalogByCategory = useMemo(() => {
    return COMPONENT_CATALOG.reduce<Record<string, ComponentCatalogItem[]>>(
      (groups, item) => {
        const categoryId = getCategoryForItem(item);
        groups[categoryId] = [...(groups[categoryId] ?? []), item];
        return groups;
      },
      {}
    );
  }, []);

  const categoryCounts = useMemo(() => {
    return COMPONENT_CATALOG.reduce<Record<string, number>>((counts, item) => {
      const categoryId = getCategoryForItem(item);
      counts.all = (counts.all ?? 0) + 1;
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
      return counts;
    }, {});
  }, []);

  function toggleComponentDetails(itemId: string) {
    setExpandedComponentIds((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
        return next;
      }

      next.add(itemId);
      return next;
    });
  }

  function handleAddComponent(item: ComponentCatalogItem) {
    setLastAddedId(item.id);
    setActiveFlyoutCategoryId(null);
    onAddComponent(item);
  }

  function toggleFlyout(categoryId: string) {
    setActiveFlyoutCategoryId((current) =>
      current === categoryId ? null : categoryId
    );
  }

  if (isCollapsed) {
    return (
      <aside className="relative z-[90] flex min-h-0 flex-col items-center overflow-visible border-r border-slate-800 bg-slate-950 px-2 py-4">
        <button
          type="button"
          onClick={onToggle}
          title="Expandir biblioteca de componentes"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
        >
          
        </button>

        <div className="mt-5 flex flex-1 flex-col items-center gap-3 overflow-visible">
          {COLLAPSED_TOOL_GROUP_IDS.map((categoryId) => {
            const category = getCategoryById(categoryId);
            const categoryComponents = catalogByCategory[categoryId] ?? [];
            const isActive = activeFlyoutCategoryId === categoryId;

            if (!category) return null;

            return (
              <div key={category.id} className="group relative overflow-visible">
                <button
                  type="button"
                  onClick={() => toggleFlyout(category.id)}
                  title={category.label}
                  aria-label={`Abrir ${category.label}`}
                  className={[
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition",
                    isActive
                      ? "border-cyan-300 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                      : "border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-100",
                  ].join(" ")}
                >
                  {category.icon}
                  <span className="absolute -bottom-1 -right-1 rounded-full border border-slate-950 bg-slate-800 px-1 text-[9px] leading-4 text-slate-300">
                    {categoryComponents.length}
                  </span>
                </button>

                {!isActive && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-[120] ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-cyan-500/25 bg-slate-950/95 px-3 py-2 text-xs font-semibold text-cyan-100 shadow-2xl shadow-slate-950/60 backdrop-blur group-hover:block">
                    {category.label}
                  </div>
                )}

                {isActive && (
                  <div className="absolute left-full top-0 z-[120] ml-3 w-64 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/98 shadow-2xl shadow-slate-950/70 backdrop-blur">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-cyan-100">
                          {category.label}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {categoryComponents.length} ferramenta(s)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveFlyoutCategoryId(null)}
                        aria-label="Fechar grupo de ferramentas"
                        className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-100"
                      >
                        x
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1">
                      {categoryComponents.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddComponent(item)}
                          title={item.name}
                          className={[
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-cyan-500/10",
                            lastAddedId === item.id ? "bg-cyan-500/10" : "",
                          ].join(" ")}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-cyan-200">
                            {getToolIcon(item)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-100">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span className="mt-4 rotate-[-90deg] whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          Biblioteca
        </span>
      </aside>
    );
  }

  return (
    <aside className="relative flex min-h-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/50">
      <div
        role="separator"
        aria-label="Redimensionar biblioteca de componentes"
        title="Arraste para aumentar ou reduzir a biblioteca de componentes"
        onMouseDown={onResizeStart}
        className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize bg-transparent transition hover:bg-cyan-400/25"
      />

      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Biblioteca
            </p>
            <h2 className="mt-1 truncate text-sm font-semibold text-white">
              Componentes
            </h2>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              Pesquise, filtre e adicione sem ocupar o mapa.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            title="Recolher biblioteca de componentes"
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/60 hover:bg-slate-800 hover:text-white"
          >
            
          </button>
        </div>

        <label className="mt-3 block">
          <span className="sr-only">Pesquisar componente</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            type="search"
            placeholder="Pesquisar: bomba, cano, joelho..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
      </div>

      <div className="border-b border-slate-800 bg-slate-950/95 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TOOL_CATEGORIES.map((category) => {
            const isActive = activeCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                title={category.label}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition",
                  isActive
                    ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                    : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-cyan-500/45 hover:text-cyan-100",
                ].join(" ")}
              >
                <span>{category.icon}</span>
                <span>{category.compactLabel}</span>
                <span className="rounded-full bg-slate-950 px-1.5 py-0.5 text-[9px] text-slate-500">
                  {categoryCounts[category.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pr-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>{filteredCatalog.length} componente(s)</span>
          <span>{Math.round(widthPx)} px</span>
        </div>

        {filteredCatalog.length > 0 ? (
          <div className="space-y-2">
            {filteredCatalog.map((item) => {
              const guide = getComponentUsageGuide(item.id, item.kind);
              const isExpanded = expandedComponentIds.has(item.id);
              const isLastAdded = lastAddedId === item.id;

              return (
                <article
                  key={item.id}
                  className={[
                    "overflow-hidden rounded-2xl border bg-slate-900/55 transition",
                    isLastAdded
                      ? "border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                      : "border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 p-2.5">
                    <button
                      type="button"
                      onClick={() => handleAddComponent(item)}
                      title={`Adicionar ${item.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-lg font-semibold text-cyan-200 transition hover:border-cyan-400/70 hover:bg-cyan-500/10"
                    >
                      {getToolIcon(item)}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddComponent(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-100">
                          {item.name}
                        </span>
                        <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-200">
                          {getKindLabel(item)}
                        </span>
                      </span>

                      <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                        {getShortText(item.description)}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/45 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleComponentDetails(item.id)}
                      className="text-[11px] font-semibold text-slate-400 transition hover:text-cyan-200"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Ocultar descricao" : "Ver descricao"}
                    </button>

                    <span className="text-[10px] text-slate-600">
                      Clique para adicionar
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2 border-t border-slate-800 bg-slate-950/70 p-3 text-[11px] leading-5 text-slate-400">
                      <p>
                        <strong className="text-cyan-300">Descricao:</strong>{" "}
                        {item.description}
                      </p>
                      <p>
                        <strong className="text-cyan-300">Uso:</strong>{" "}
                        {guide.whenToUse}
                      </p>
                      <p>
                        <strong className="text-slate-200">Atencao:</strong>{" "}
                        {guide.technicalNote}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-xs leading-5 text-yellow-100/90">
            Nenhum componente encontrado. Tente pesquisar por cano, bomba,
            joelho, valvula, reservatorio ou medidor.
          </div>
        )}
      </div>
    </aside>
  );
}
