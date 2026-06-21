export const DEFAULT_PUMP_EFFICIENCY_PERCENT = 70;

export type PumpPowerInput = {
  flowM3s: number;
  totalDynamicHeadMca: number;
  densityKgM3?: number;
  gravityMS2?: number;
  efficiencyPercent?: number;
};

export type PumpPowerResult = {
  hydraulicPowerW: number;
  hydraulicPowerKw: number;
  electricPowerKw: number;
  pumpEfficiencyPercent: number;
};

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeEfficiencyPercent(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_PUMP_EFFICIENCY_PERCENT;
  }

  if (value <= 0) {
    return DEFAULT_PUMP_EFFICIENCY_PERCENT;
  }

  return Math.min(100, value);
}

export function calculatePumpPower(input: PumpPowerInput): PumpPowerResult {
  const flowM3s = clampNonNegative(input.flowM3s);
  const totalDynamicHeadMca = clampNonNegative(input.totalDynamicHeadMca);
  const densityKgM3 = input.densityKgM3 ?? 1000;
  const gravityMS2 = input.gravityMS2 ?? 9.81;
  const pumpEfficiencyPercent = normalizeEfficiencyPercent(input.efficiencyPercent);
  const efficiencyDecimal = pumpEfficiencyPercent / 100;

  const hydraulicPowerW =
    densityKgM3 * gravityMS2 * flowM3s * totalDynamicHeadMca;

  const hydraulicPowerKw = hydraulicPowerW / 1000;
  const electricPowerKw =
    efficiencyDecimal > 0 ? hydraulicPowerKw / efficiencyDecimal : 0;

  return {
    hydraulicPowerW,
    hydraulicPowerKw,
    electricPowerKw,
    pumpEfficiencyPercent,
  };
}
