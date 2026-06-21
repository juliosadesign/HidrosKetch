import type { PumpModel } from "../../types/pump.types";

const SCHNEIDER_BCR_SOURCE =
  "https://schneider.ind.br/produtos/motobombas-de-superf%C3%ADcie/light/centr%C3%ADfugas-monoest%C3%A1gio/bcr/";


const DANCOR_CAM_W6C_PDF_SOURCE =
  "https://www.dancor.com.br/wp-content/uploads/2021/11/cam-w6c-pbe_cat-1.pdf";

const EBARA_THEBE_SOURCE = "https://www.ebara.com.br/";

const KSB_CATALOG_SOURCE = "https://www.ksb.com/pt-br/produtos/catalogo-de-produtos";

export const PUMP_CATALOG: PumpModel[] = [
  {
    id: "schneider_bcr_2000_050cv",
    brand: "Schneider Motobombas / Franklin Electric",
    model: "BCR-2000 1/2 cv",
    type: "centrifugal",
    nominalPowerCv: 0.5,
    nominalPowerKw: 0.368,
    minFlowM3h: 0.6,
    nominalFlowM3h: 2.5,
    maxFlowM3h: 4.1,
    minHeadMca: 2,
    nominalHeadMca: 10,
    maxHeadMca: 22,
    estimatedEfficiencyPercent: null,
    voltageV: "127 V ou 220 V",
    recommendedUse:
      "Motobomba centrífuga residencial para água limpa, indicada para residências, fontes, cascatas e chácaras.",
    technicalNote:
      "Dados hidráulicos cadastrados a partir da tabela oficial BCR. A vazão varia de 4,1 m³/h em 2 mca até 0,6 m³/h em 17 mca; a pressão máxima sem vazão informada é 22 mca.",
    source: {
      sourceName: "Schneider Motobombas — página oficial BCR",
      sourceUrl: SCHNEIDER_BCR_SOURCE,
      dataQuality: "manufacturer_catalog",
      checkedAt: "2026-06-21",
    },
  },
  {
    id: "schneider_bcr_2010_100cv",
    brand: "Schneider Motobombas / Franklin Electric",
    model: "BCR-2010 1 cv",
    type: "centrifugal",
    nominalPowerCv: 1,
    nominalPowerKw: 0.736,
    minFlowM3h: 0.9,
    nominalFlowM3h: 3.7,
    maxFlowM3h: 5.4,
    minHeadMca: 8,
    nominalHeadMca: 16,
    maxHeadMca: 29,
    estimatedEfficiencyPercent: null,
    voltageV: "127 V ou 220 V",
    recommendedUse:
      "Recalque residencial com maior exigência de vazão e altura manométrica, usando água limpa.",
    technicalNote:
      "Dados cadastrados a partir da tabela oficial BCR-2010. A vazão da versão 1 cv vai de 5,4 m³/h em 8 mca até 0,9 m³/h em 21 mca; a pressão máxima sem vazão informada é 29 mca.",
    source: {
      sourceName: "Schneider Motobombas — página oficial BCR",
      sourceUrl: SCHNEIDER_BCR_SOURCE,
      dataQuality: "manufacturer_catalog",
      checkedAt: "2026-06-21",
    },
  },
  {
    id: "dancor_cam_w6c_075cv",
    brand: "Dancor",
    model: "CAM-W6C 3/4 cv",
    type: "centrifugal",
    nominalPowerCv: 0.75,
    nominalPowerKw: 0.552,
    minFlowM3h: 0.8,
    nominalFlowM3h: 7.7,
    maxFlowM3h: 9.3,
    minHeadMca: 8,
    nominalHeadMca: 16,
    maxHeadMca: 32,
    estimatedEfficiencyPercent: null,
    voltageV: "Monofásico 110-127/220-254 V; trifásico 220/380 V",
    recommendedUse:
      "Bomba centrífuga de aplicação múltipla para usos residencial, predial, agrícola e industrial leve.",
    technicalNote:
      "Tabela oficial CAM-W6C informa vazões de 9,3 m³/h em 8 mca até 0,8 m³/h em 30 mca, com AMT máxima de 32 mca para 3/4 cv.",
    source: {
      sourceName: "Dancor — página oficial CAM-W6C e tabela PBE",
      sourceUrl: DANCOR_CAM_W6C_PDF_SOURCE,
      dataQuality: "manufacturer_catalog",
      checkedAt: "2026-06-21",
    },
  },
  {
    id: "dancor_cam_w6c_200cv",
    brand: "Dancor",
    model: "CAM-W6C 2 cv",
    type: "centrifugal",
    nominalPowerCv: 2,
    nominalPowerKw: 1.472,
    minFlowM3h: 0.6,
    nominalFlowM3h: 6.3,
    maxFlowM3h: 8.2,
    minHeadMca: 8,
    nominalHeadMca: 20,
    maxHeadMca: 48,
    estimatedEfficiencyPercent: null,
    voltageV: "Monofásico bivolt 110/220 V; trifásico 220/380 V",
    recommendedUse:
      "Aplicações com maior altura manométrica em sistemas prediais, agrícolas ou industriais leves.",
    technicalNote:
      "Tabela oficial CAM-W6C informa vazões de 8,2 m³/h em 8 mca até 0,6 m³/h em 44 mca, com AMT máxima de 48 mca para 2 cv.",
    source: {
      sourceName: "Dancor — página oficial CAM-W6C e tabela PBE",
      sourceUrl: DANCOR_CAM_W6C_PDF_SOURCE,
      dataQuality: "manufacturer_catalog",
      checkedAt: "2026-06-21",
    },
  },
  {
    id: "ebara_thebe_bst_range",
    brand: "Ebara / Thebe",
    model: "BST — série submersível",
    type: "submersible",
    nominalPowerCv: null,
    nominalPowerKw: null,
    minFlowM3h: 6,
    nominalFlowM3h: null,
    maxFlowM3h: 100,
    minHeadMca: 2.5,
    nominalHeadMca: null,
    maxHeadMca: 41,
    estimatedEfficiencyPercent: null,
    voltageV: null,
    recommendedUse:
      "Família de bombas submersíveis para aplicações de drenagem, recalque e movimentação de água, conforme seleção específica do fabricante.",
    technicalNote:
      "Entrada cadastrada como faixa de série, não como modelo individual. A página oficial informa potência de 1 a 10 cv, vazão de 6 a 100 m³/h e altura manométrica de 2,5 a 41 m. Selecionar modelo específico em catálogo antes do uso real.",
    source: {
      sourceName: "Ebara / Thebe — página oficial de produtos",
      sourceUrl: EBARA_THEBE_SOURCE,
      dataQuality: "manufacturer_catalog",
      checkedAt: "2026-06-21",
    },
  },
  {
    id: "ksb_snz_family_pending",
    brand: "KSB",
    model: "SNZ — família industrial",
    type: "centrifugal",
    nominalPowerCv: null,
    nominalPowerKw: null,
    minFlowM3h: null,
    nominalFlowM3h: null,
    maxFlowM3h: null,
    minHeadMca: null,
    nominalHeadMca: null,
    maxHeadMca: null,
    estimatedEfficiencyPercent: null,
    voltageV: null,
    recommendedUse:
      "Família indicada pela KSB para estações de abastecimento de água, irrigação, drenagem, captação de água, refrigeração em usinas termoelétricas e aplicações industriais.",
    technicalNote:
      "A página pública do catálogo KSB descreve a aplicação da família SNZ, mas os dados numéricos de modelo, vazão e altura devem ser preenchidos depois a partir de ficha técnica específica. Mantido como registro pendente, sem recomendação automática.",
    source: {
      sourceName: "KSB — catálogo oficial de produtos",
      sourceUrl: KSB_CATALOG_SOURCE,
      dataQuality: "pending_verification",
      checkedAt: "2026-06-21",
    },
  },
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
];

export function listPumpCatalog(): PumpModel[] {
  return PUMP_CATALOG;
}

export function findPumpById(id: string): PumpModel | undefined {
  return PUMP_CATALOG.find((pump) => pump.id === id);
}
