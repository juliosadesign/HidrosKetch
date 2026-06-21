export type PumpModelType =
  | "centrifugal"
  | "peripheral"
  | "submersible"
  | "booster"
  | "circulator"
  | "generic";

export type PumpDataQuality =
  | "didactic_example"
  | "estimated"
  | "manufacturer_catalog"
  | "pending_verification";

export type PumpDataSource = {
  sourceName: string;
  sourceUrl: string | null;
  dataQuality: PumpDataQuality;
  checkedAt: string | null;
};

export type PumpModel = {
  id: string;
  brand: string;
  model: string;
  type: PumpModelType;

  nominalPowerCv: number | null;
  nominalPowerKw: number | null;

  minFlowM3h: number | null;
  nominalFlowM3h: number | null;
  maxFlowM3h: number | null;

  minHeadMca: number | null;
  nominalHeadMca: number | null;
  maxHeadMca: number | null;

  estimatedEfficiencyPercent: number | null;
  voltageV: string | null;

  recommendedUse: string;
  technicalNote: string;
  source: PumpDataSource;
};

export type PumpCatalogFilter = {
  requiredFlowM3h?: number | null;
  requiredHeadMca?: number | null;
  maxPowerKw?: number | null;
  type?: PumpModelType | "all";
  useText?: string;
};

export type PumpFilterMatch = {
  pump: PumpModel;
  matches: boolean;
  reasons: string[];
  missingData: string[];
};

export type PumpRecommendationStatus =
  | "atende"
  | "atende_com_folga"
  | "insuficiente"
  | "superdimensionada"
  | "dados_incompletos";

export type PumpRecommendationInput = {
  requiredFlowM3h: number | null;
  requiredHeadMca: number | null;
  estimatedElectricPowerKw: number | null;
  assumedEfficiencyPercent: number | null;
};

export type PumpRecommendation = {
  pump: PumpModel;
  status: PumpRecommendationStatus;
  score: number;
  reasons: string[];
  missingData: string[];
  flowMarginPercent: number | null;
  headMarginPercent: number | null;
  powerComparison: "abaixo_da_estimativa" | "proxima" | "acima_da_estimativa" | "nao_comparada";
};
