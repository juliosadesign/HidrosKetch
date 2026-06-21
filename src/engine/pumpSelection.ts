import { listPumpCatalog } from "../domain/catalogs/pumpCatalog";
import type {
  PumpCatalogFilter,
  PumpFilterMatch,
  PumpModel,
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

function hasPositiveNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
