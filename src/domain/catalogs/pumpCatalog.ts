import type { PumpModel } from "../../types/pump.types";

export const PUMP_CATALOG: PumpModel[] = [
  {
    id: "hs_example_residential_025cv",
    brand: "HidroSketch",
    model: "Exemplo residencial 1/4 cv",
    type: "centrifugal",
    nominalPowerCv: 0.25,
    nominalPowerKw: 0.184,
    minFlowM3h: 0.4,
    nominalFlowM3h: 1.2,
    maxFlowM3h: 2.4,
    minHeadMca: 4,
    nominalHeadMca: 12,
    maxHeadMca: 18,
    estimatedEfficiencyPercent: 55,
    voltageV: "127/220 V",
    recommendedUse:
      "Circulação e recalque residencial leve, como pequenos reservatórios e baixa altura.",
    technicalNote:
      "Modelo didático com dados simplificados. Não representa uma bomba comercial específica.",
    source: {
      sourceName: "Exemplo didático HidroSketch",
      sourceUrl: null,
      dataQuality: "didactic_example",
      checkedAt: null,
    },
  },
  {
    id: "hs_example_residential_050cv",
    brand: "HidroSketch",
    model: "Exemplo residencial 1/2 cv",
    type: "centrifugal",
    nominalPowerCv: 0.5,
    nominalPowerKw: 0.368,
    minFlowM3h: 0.8,
    nominalFlowM3h: 2.4,
    maxFlowM3h: 4.2,
    minHeadMca: 6,
    nominalHeadMca: 18,
    maxHeadMca: 26,
    estimatedEfficiencyPercent: 60,
    voltageV: "127/220 V",
    recommendedUse:
      "Recalque residencial médio, transferência entre reservatórios e alimentação de caixa superior.",
    technicalNote:
      "Modelo didático com faixa estimada para testar a estrutura do catálogo. Confirmar em catálogo oficial antes de uso real.",
    source: {
      sourceName: "Exemplo didático HidroSketch",
      sourceUrl: null,
      dataQuality: "didactic_example",
      checkedAt: null,
    },
  },
  {
    id: "hs_example_booster_075cv",
    brand: "HidroSketch",
    model: "Exemplo pressurização 3/4 cv",
    type: "booster",
    nominalPowerCv: 0.75,
    nominalPowerKw: 0.552,
    minFlowM3h: 1.0,
    nominalFlowM3h: 3.2,
    maxFlowM3h: 5.0,
    minHeadMca: 10,
    nominalHeadMca: 24,
    maxHeadMca: 34,
    estimatedEfficiencyPercent: 62,
    voltageV: "220 V",
    recommendedUse:
      "Pressurização leve e sistemas residenciais com maior exigência de altura manométrica.",
    technicalNote:
      "Modelo didático para validar filtros por vazão e altura. Não usar como seleção final de equipamento.",
    source: {
      sourceName: "Exemplo didático HidroSketch",
      sourceUrl: null,
      dataQuality: "didactic_example",
      checkedAt: null,
    },
  },
  {
    id: "hs_example_submersible_100cv",
    brand: "HidroSketch",
    model: "Exemplo submersível 1 cv",
    type: "submersible",
    nominalPowerCv: 1,
    nominalPowerKw: 0.736,
    minFlowM3h: 1.2,
    nominalFlowM3h: 4.0,
    maxFlowM3h: 6.5,
    minHeadMca: 12,
    nominalHeadMca: 30,
    maxHeadMca: 45,
    estimatedEfficiencyPercent: 58,
    voltageV: "220 V",
    recommendedUse:
      "Poços, cisternas e captação inferior quando a bomba precisa operar submersa.",
    technicalNote:
      "Dados simplificados para estrutura inicial do catálogo. Curva real será tratada em sprint futura.",
    source: {
      sourceName: "Exemplo didático HidroSketch",
      sourceUrl: null,
      dataQuality: "didactic_example",
      checkedAt: null,
    },
  },
];

export function listPumpCatalog(): PumpModel[] {
  return PUMP_CATALOG;
}

export function findPumpById(id: string): PumpModel | undefined {
  return PUMP_CATALOG.find((pump) => pump.id === id);
}
