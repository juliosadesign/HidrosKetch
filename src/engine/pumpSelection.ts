import { listPumpCatalog } from "../domain/catalogs/pumpCatalog";
import type {
  PumpCatalogFilter,
  PumpFilterMatch,
  PumpModel,
  PumpRecommendation,
  PumpRecommendationInput,
  PumpRecommendationStatus,
} from "../types/pump.types";

export function filterPumpCatalog(
  filter: PumpCatalogFilter = {},
  pumps: PumpModel[] = listPumpCatalog()
): PumpFilterMatch[] {
  return pumps.map((pump) => evaluatePumpAgainstFilter(pump, filter));
}

export function getCompatiblePumpCandidates(
  filter: PumpCatalogFilter = {},
  pumps: PumpModel[] = listPumpCatalog()
): PumpModel[] {
  return filterPumpCatalog(filter, pumps)
    .filter((match) => match.matches)
    .map((match) => match.pump);
}

export function evaluatePumpAgainstFilter(
  pump: PumpModel,
  filter: PumpCatalogFilter = {}
): PumpFilterMatch {
  const reasons: string[] = [];
  const missingData: string[] = [];
  let matches = true;

  if (filter.type && filter.type !== "all" && pump.type !== filter.type) {
    matches = false;
    reasons.push(`Tipo diferente do filtro: ${pump.type}.`);
  }

  if (hasPositiveNumber(filter.requiredFlowM3h)) {
    if (!hasPositiveNumber(pump.maxFlowM3h)) {
      missingData.push("vazão máxima");
    } else if ((pump.maxFlowM3h ?? 0) < (filter.requiredFlowM3h ?? 0)) {
      matches = false;
      reasons.push("Vazão máxima abaixo da vazão exigida.");
    } else {
      reasons.push("Faixa de vazão cobre a vazão exigida.");
    }
  }

  if (hasPositiveNumber(filter.requiredHeadMca)) {
    if (!hasPositiveNumber(pump.maxHeadMca)) {
      missingData.push("altura manométrica máxima");
    } else if ((pump.maxHeadMca ?? 0) < (filter.requiredHeadMca ?? 0)) {
      matches = false;
      reasons.push("Altura manométrica máxima abaixo da altura exigida.");
    } else {
      reasons.push("Faixa de altura cobre a altura manométrica exigida.");
    }
  }

  if (hasPositiveNumber(filter.maxPowerKw)) {
    if (!hasPositiveNumber(pump.nominalPowerKw)) {
      missingData.push("potência nominal");
    } else if ((pump.nominalPowerKw ?? 0) > (filter.maxPowerKw ?? 0)) {
      matches = false;
      reasons.push("Potência nominal acima do limite definido.");
    } else {
      reasons.push("Potência nominal dentro do limite definido.");
    }
  }

  if (filter.useText && filter.useText.trim().length > 0) {
    const search = normalizeText(filter.useText);
    const combinedText = normalizeText(
      `${pump.recommendedUse} ${pump.technicalNote} ${pump.type}`
    );

    if (!combinedText.includes(search)) {
      matches = false;
      reasons.push("Uso recomendado não contém o texto filtrado.");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Sem filtro técnico aplicado; bomba listada para consulta.");
  }

  return {
    pump,
    matches,
    reasons,
    missingData,
  };
}

export function buildPumpRecommendations(
  input: PumpRecommendationInput,
  pumps: PumpModel[] = listPumpCatalog()
): PumpRecommendation[] {
  return pumps
    .map((pump) => evaluatePumpRecommendation(pump, input))
    .sort(sortPumpRecommendations);
}

export function getRecommendedPump(
  recommendations: PumpRecommendation[]
): PumpRecommendation | null {
  return (
    recommendations.find(
      (recommendation) =>
        recommendation.status === "atende" ||
        recommendation.status === "atende_com_folga"
    ) ?? null
  );
}

export function evaluatePumpRecommendation(
  pump: PumpModel,
  input: PumpRecommendationInput
): PumpRecommendation {
  const missingData: string[] = [];
  const reasons: string[] = [];
  const requiredFlowM3h = normalizePositiveNumber(input.requiredFlowM3h);
  const requiredHeadMca = normalizePositiveNumber(input.requiredHeadMca);
  const estimatedElectricPowerKw = normalizePositiveNumber(
    input.estimatedElectricPowerKw
  );
  const pumpFlowCapacityM3h = resolveFlowCapacityM3h(pump);
  const pumpHeadCapacityMca = resolveHeadCapacityMca(pump);

  if (requiredFlowM3h === null) {
    missingData.push("vazão exigida do projeto");
  }

  if (requiredHeadMca === null) {
    missingData.push("altura manométrica total exigida");
  }

  if (pumpFlowCapacityM3h === null) {
    missingData.push("vazão máxima ou nominal da bomba");
  }

  if (pumpHeadCapacityMca === null) {
    missingData.push("altura máxima ou nominal da bomba");
  }

  const flowMarginPercent = calculateMarginPercent(
    pumpFlowCapacityM3h,
    requiredFlowM3h
  );
  const headMarginPercent = calculateMarginPercent(
    pumpHeadCapacityMca,
    requiredHeadMca
  );
  const powerComparison = comparePower(
    pump.nominalPowerKw,
    estimatedElectricPowerKw
  );

  if (missingData.length > 0) {
    reasons.push(
      "Não há dados suficientes para classificar esta bomba com segurança."
    );

    return {
      pump,
      status: "dados_incompletos",
      score: 1000,
      reasons,
      missingData,
      flowMarginPercent,
      headMarginPercent,
      powerComparison,
    };
  }

  const flowCoversDemand = (pumpFlowCapacityM3h ?? 0) >= (requiredFlowM3h ?? 0);
  const headCoversDemand = (pumpHeadCapacityMca ?? 0) >= (requiredHeadMca ?? 0);

  if (!flowCoversDemand || !headCoversDemand) {
    if (!flowCoversDemand) {
      reasons.push("Vazão disponível abaixo da vazão necessária do projeto.");
    }

    if (!headCoversDemand) {
      reasons.push(
        "Altura manométrica disponível abaixo da HMT exigida pelo sistema."
      );
    }

    return {
      pump,
      status: "insuficiente",
      score: 800 + calculateDemandGap(flowMarginPercent, headMarginPercent),
      reasons,
      missingData,
      flowMarginPercent,
      headMarginPercent,
      powerComparison,
    };
  }

  const status = classifyOversizing(flowMarginPercent, headMarginPercent);

  if (status === "superdimensionada") {
    reasons.push(
      "A bomba atende, mas entrega folga muito alta em relação à vazão e/ou altura exigida."
    );
  } else if (status === "atende_com_folga") {
    reasons.push("A bomba atende com margem confortável para a pré-seleção.");
  } else {
    reasons.push("A bomba atende à vazão e à altura manométrica exigidas.");
  }

  if (powerComparison === "abaixo_da_estimativa") {
    reasons.push(
      "A potência nominal cadastrada está abaixo da potência elétrica estimada; confirmar na curva real da bomba."
    );
  }

  if (powerComparison === "acima_da_estimativa") {
    reasons.push(
      "A potência nominal cadastrada está acima da potência elétrica estimada, o que pode indicar folga ou superdimensionamento."
    );
  }

  return {
    pump,
    status,
    score: calculateRecommendationScore(status, flowMarginPercent, headMarginPercent),
    reasons,
    missingData,
    flowMarginPercent,
    headMarginPercent,
    powerComparison,
  };
}

function sortPumpRecommendations(
  first: PumpRecommendation,
  second: PumpRecommendation
): number {
  if (first.score !== second.score) {
    return first.score - second.score;
  }

  return first.pump.model.localeCompare(second.pump.model);
}

function classifyOversizing(
  flowMarginPercent: number | null,
  headMarginPercent: number | null
): PumpRecommendationStatus {
  const flowMargin = flowMarginPercent ?? 0;
  const headMargin = headMarginPercent ?? 0;

  if (flowMargin > 180 || headMargin > 140) {
    return "superdimensionada";
  }

  if (flowMargin > 45 || headMargin > 45) {
    return "atende_com_folga";
  }

  return "atende";
}

function calculateRecommendationScore(
  status: PumpRecommendationStatus,
  flowMarginPercent: number | null,
  headMarginPercent: number | null
): number {
  const statusWeight: Record<PumpRecommendationStatus, number> = {
    atende: 0,
    atende_com_folga: 100,
    superdimensionada: 350,
    insuficiente: 800,
    dados_incompletos: 1000,
  };

  const flowPenalty = Math.abs(flowMarginPercent ?? 0);
  const headPenalty = Math.abs(headMarginPercent ?? 0);

  return statusWeight[status] + flowPenalty + headPenalty;
}

function calculateDemandGap(
  flowMarginPercent: number | null,
  headMarginPercent: number | null
): number {
  const flowGap = flowMarginPercent !== null && flowMarginPercent < 0 ? Math.abs(flowMarginPercent) : 0;
  const headGap = headMarginPercent !== null && headMarginPercent < 0 ? Math.abs(headMarginPercent) : 0;

  return flowGap + headGap;
}

function resolveFlowCapacityM3h(pump: PumpModel): number | null {
  return normalizePositiveNumber(pump.maxFlowM3h) ?? normalizePositiveNumber(pump.nominalFlowM3h);
}

function resolveHeadCapacityMca(pump: PumpModel): number | null {
  return normalizePositiveNumber(pump.maxHeadMca) ?? normalizePositiveNumber(pump.nominalHeadMca);
}

function calculateMarginPercent(
  available: number | null,
  required: number | null
): number | null {
  if (available === null || required === null || required <= 0) {
    return null;
  }

  return ((available - required) / required) * 100;
}

function comparePower(
  pumpPowerKw: number | null,
  estimatedElectricPowerKw: number | null
): PumpRecommendation["powerComparison"] {
  const pumpPower = normalizePositiveNumber(pumpPowerKw);
  const estimatedPower = normalizePositiveNumber(estimatedElectricPowerKw);

  if (pumpPower === null || estimatedPower === null) {
    return "nao_comparada";
  }

  if (pumpPower < estimatedPower * 0.85) {
    return "abaixo_da_estimativa";
  }

  if (pumpPower > estimatedPower * 1.8) {
    return "acima_da_estimativa";
  }

  return "proxima";
}

function hasPositiveNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizePositiveNumber(value: number | null | undefined): number | null {
  if (!hasPositiveNumber(value)) {
    return null;
  }

  return value as number;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
