import type { ComponentKind } from "../../types/component.types";
import { DEFAULT_DIAMETER_MM, DEFAULT_PUMP_HEAD_MCA } from "../constants/physics";
import { findKById } from "./kCatalog";

// Catálogo visual/técnico dos componentes disponíveis na barra lateral.
// Este catálogo ainda não cria componentes na tela.
// Ele apenas define o que a V1 oferece.

export type ComponentCatalogItem = {
  id: string;
  kind: ComponentKind;
  name: string;
  category: string;
  description: string;

  // Dados padrão que serão usados quando o componente for criado.
  defaultData: Record<string, unknown>;
};

export const COMPONENT_CATALOG: ComponentCatalogItem[] = [
  // -------------------------
  // FONTES E RESERVAÇÃO
  // -------------------------
  {
    id: "well",
    kind: "reservoir",
    name: "Poço",
    category: "Fontes e reservação",
    description: "Representa uma origem de fluido com nível de referência.",
    defaultData: {
      reservoirType: "well",
      role: "source",
      elevationM: 0,
      surfacePressureKpa: 0,
      isOpenToAtmosphere: true,
    },
  },
  {
    id: "open_reservoir",
    kind: "reservoir",
    name: "Reservatório aberto",
    category: "Fontes e reservação",
    description: "Reservatório com pressão manométrica superficial igual a zero.",
    defaultData: {
      reservoirType: "open_reservoir",
      role: "source",
      elevationM: 0,
      surfacePressureKpa: 0,
      isOpenToAtmosphere: true,
    },
  },
  {
    id: "tank",
    kind: "tank",
    name: "Tanque",
    category: "Fontes e reservação",
    description: "Tanque com nível, cota e possível volume.",
    defaultData: {
      role: "destination",
      baseElevationM: 0,
      waterLevelM: 0,
      topPressureKpa: 0,
      isOpenToAtmosphere: true,
    },
  },

  // -------------------------
  // TUBULAÇÃO
  // -------------------------
  {
    id: "pipe",
    kind: "pipe",
    name: "Cano reto",
    category: "Tubulação",
    description: "Trecho de tubulação usado para conectar componentes.",
    defaultData: {
      diameterMm: DEFAULT_DIAMETER_MM,
      lengthM: 1,
      material: "PVC",
      flowDirection: "source-to-target",
    },
  },
  {
    id: "junction",
    kind: "junction",
    name: "Nó de conexão",
    category: "Tubulação",
    description: "Ponto técnico para conexão entre componentes.",
    defaultData: {
      junctionType: "simple",
      connectedComponentIds: [],
    },
  },

  // -------------------------
  // ACESSÓRIOS COM K
  // -------------------------
  {
    id: "elbow_90_short",
    kind: "accessory",
    name: "Joelho 90°",
    category: "Acessórios com K",
    description: "Mudança brusca de direção com perda localizada.",
    defaultData: {
      accessoryType: "elbow_90_short",
      kValue: findKById("elbow_90_short")?.k ?? 0.9,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "elbow_45",
    kind: "accessory",
    name: "Joelho 45°",
    category: "Acessórios com K",
    description: "Mudança parcial de direção.",
    defaultData: {
      accessoryType: "elbow_45",
      kValue: findKById("elbow_45")?.k ?? 0.4,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "curve_90",
    kind: "accessory",
    name: "Curva 90°",
    category: "Acessórios com K",
    description: "Curva de 90° com perda localizada menor que joelho brusco.",
    defaultData: {
      accessoryType: "curve_90",
      kValue: findKById("curve_90")?.k ?? 0.4,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "curve_45",
    kind: "accessory",
    name: "Curva 45°",
    category: "Acessórios com K",
    description: "Curva de 45°.",
    defaultData: {
      accessoryType: "curve_45",
      kValue: findKById("curve_45")?.k ?? 0.2,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "tee_straight",
    kind: "accessory",
    name: "Tê - passagem direta",
    category: "Acessórios com K",
    description: "Tê com fluxo seguindo pela linha principal.",
    defaultData: {
      accessoryType: "tee_straight",
      kValue: findKById("tee_straight")?.k ?? 0.6,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "tee_branch",
    kind: "accessory",
    name: "Tê - ramificação",
    category: "Acessórios com K",
    description: "Tê com fluxo saindo pela ramificação.",
    defaultData: {
      accessoryType: "tee_branch",
      kValue: findKById("tee_side_exit")?.k ?? 1.8,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "entrance",
    kind: "accessory",
    name: "Entrada de tubulação",
    category: "Acessórios com K",
    description: "Entrada do fluido na tubulação.",
    defaultData: {
      accessoryType: "entrance",
      kValue: findKById("normal_entrance")?.k ?? 0.5,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "exit",
    kind: "accessory",
    name: "Saída de tubulação",
    category: "Acessórios com K",
    description: "Descarga ou saída livre do sistema.",
    defaultData: {
      accessoryType: "exit",
      kValue: findKById("pipe_exit")?.k ?? 1.0,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "reduction",
    kind: "accessory",
    name: "Redução gradual",
    category: "Acessórios com K",
    description: "Transição para menor diâmetro.",
    defaultData: {
      accessoryType: "reduction",
      kValue: findKById("reduction_gradual")?.k ?? 0.15,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "expansion",
    kind: "accessory",
    name: "Ampliação gradual",
    category: "Acessórios com K",
    description: "Transição para maior diâmetro.",
    defaultData: {
      accessoryType: "expansion",
      kValue: findKById("expansion_gradual")?.k ?? 0.3,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },

  // -------------------------
  // VÁLVULAS
  // -------------------------
  {
    id: "gate_valve_open",
    kind: "valve",
    name: "Válvula de gaveta aberta",
    category: "Válvulas",
    description: "Válvula de baixa perda quando totalmente aberta.",
    defaultData: {
      valveType: "gate_open",
      state: "open",
      kValue: findKById("gate_valve_open")?.k ?? 0.2,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "globe_valve_open",
    kind: "valve",
    name: "Válvula de globo aberta",
    category: "Válvulas",
    description: "Válvula com perda localizada elevada.",
    defaultData: {
      valveType: "globe_open",
      state: "open",
      kValue: findKById("globe_valve_open")?.k ?? 10.0,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "check_valve",
    kind: "valve",
    name: "Válvula de retenção",
    category: "Válvulas",
    description: "Permite escoamento em apenas um sentido.",
    defaultData: {
      valveType: "check_valve",
      state: "open",
      kValue: findKById("check_valve")?.k ?? 2.5,
      diameterMm: DEFAULT_DIAMETER_MM,
      flowDirection: "source-to-target",
    },
  },

  // -------------------------
  // ENERGIA
  // -------------------------
  {
    id: "pump",
    kind: "pump",
    name: "Bomba",
    category: "Energia",
    description: "Adiciona carga hidráulica ao sistema.",
    defaultData: {
      headMca: DEFAULT_PUMP_HEAD_MCA,
      flowDirection: "source-to-target",
    },
  },

  // -------------------------
  // INSTRUMENTOS
  // -------------------------
  {
    id: "pressure_instrument",
    kind: "instrument",
    name: "Medidor de pressão",
    category: "Instrumentos",
    description: "Exibe pressão estimada no ponto monitorado.",
    defaultData: {
      instrumentType: "pressure",
      displayUnit: "kPa",
    },
  },
  {
    id: "flow_instrument",
    kind: "instrument",
    name: "Medidor de vazão",
    category: "Instrumentos",
    description: "Exibe vazão no trecho monitorado.",
    defaultData: {
      instrumentType: "flow",
      displayUnit: "L/s",
    },
  },
  {
    id: "level_instrument",
    kind: "instrument",
    name: "Medidor de nível",
    category: "Instrumentos",
    description: "Exibe nível de tanque, poço ou reservatório.",
    defaultData: {
      instrumentType: "level",
      displayUnit: "m",
    },
  },
  {
    id: "head_loss_instrument",
    kind: "instrument",
    name: "Indicador de perda",
    category: "Instrumentos",
    description: "Exibe perda de carga calculada.",
    defaultData: {
      instrumentType: "head_loss",
      displayUnit: "mca",
    },
  },

  // -------------------------
  // ANOTAÇÕES
  // -------------------------
  {
    id: "label",
    kind: "label",
    name: "Texto anotativo",
    category: "Anotações",
    description: "Texto livre para observações técnicas.",
    defaultData: {
      text: "Nova anotação",
      showInReport: true,
    },
  },
];