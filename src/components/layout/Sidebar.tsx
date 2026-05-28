type ComponentItem = {
    name: string;
    description: string;
  };
  
  type ComponentGroup = {
    title: string;
    items: ComponentItem[];
  };
  
  // Biblioteca visual inicial.
  // Nesta Sprint, os itens ainda não são arrastáveis.
  // Eles só deixam clara a estrutura que será usada na Sprint do editor.
  const componentGroups: ComponentGroup[] = [
    {
      title: "Fontes e reservação",
      items: [
        { name: "Poço", description: "Origem ou captação" },
        { name: "Reservatório", description: "Nível de referência" },
        { name: "Tanque", description: "Volume e nível" },
      ],
    },
    {
      title: "Tubulação",
      items: [
        { name: "Cano reto", description: "Trecho de tubulação" },
        { name: "Nó de conexão", description: "Ponto de ligação" },
        { name: "Tê", description: "Ramificação" },
      ],
    },
    {
      title: "Acessórios com K",
      items: [
        { name: "Joelho 90°", description: "Mudança brusca de direção" },
        { name: "Joelho 45°", description: "Mudança parcial de direção" },
        { name: "Curva 90°", description: "Curva suave" },
        { name: "Entrada", description: "Entrada da tubulação" },
        { name: "Saída", description: "Descarga final" },
      ],
    },
    {
      title: "Válvulas e energia",
      items: [
        { name: "Válvula", description: "Controle com coeficiente K" },
        { name: "Bomba", description: "Adiciona carga H_b" },
      ],
    },
    {
      title: "Instrumentos",
      items: [
        { name: "Pressão", description: "Indicador PI" },
        { name: "Vazão", description: "Indicador FI" },
        { name: "Nível", description: "Indicador LI" },
      ],
    },
  ];
  
  export function Sidebar() {
    return (
      <aside className="min-h-0 overflow-y-auto border-r border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">
            Biblioteca de componentes
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Componentes visuais que serão usados para montar a rede hidráulica.
          </p>
        </div>
  
        <div className="space-y-4">
          {componentGroups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                {group.title}
              </h3>
  
              <div className="space-y-2">
                {group.items.map((item) => (
                  <button
                    key={item.name}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left transition hover:border-cyan-500/60 hover:bg-slate-800"
                  >
                    <span className="block text-sm font-medium text-slate-100">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
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