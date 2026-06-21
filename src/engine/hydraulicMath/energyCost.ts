export type EnergyCostInput = {
  electricPowerKw: number;
  operationHoursPerDay: number;
  operationDaysPerMonth: number;
  energyTariffBRLKwh: number;
};

export type EnergyCostResult = {
  dailyConsumptionKwh: number;
  monthlyConsumptionKwh: number;
  monthlyEnergyCostBRL: number;
};

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateDailyConsumptionKwh(
  electricPowerKw: number,
  operationHoursPerDay: number
): number {
  return clampNonNegative(electricPowerKw) * clampNonNegative(operationHoursPerDay);
}

export function calculateMonthlyConsumptionKwh(
  dailyConsumptionKwh: number,
  operationDaysPerMonth: number
): number {
  return clampNonNegative(dailyConsumptionKwh) * clampNonNegative(operationDaysPerMonth);
}

export function calculateMonthlyEnergyCostBRL(
  monthlyConsumptionKwh: number,
  energyTariffBRLKwh: number
): number {
  return clampNonNegative(monthlyConsumptionKwh) * clampNonNegative(energyTariffBRLKwh);
}

export function calculateEnergyCost(input: EnergyCostInput): EnergyCostResult {
  const dailyConsumptionKwh = calculateDailyConsumptionKwh(
    input.electricPowerKw,
    input.operationHoursPerDay
  );

  const monthlyConsumptionKwh = calculateMonthlyConsumptionKwh(
    dailyConsumptionKwh,
    input.operationDaysPerMonth
  );

  const monthlyEnergyCostBRL = calculateMonthlyEnergyCostBRL(
    monthlyConsumptionKwh,
    input.energyTariffBRLKwh
  );

  return {
    dailyConsumptionKwh,
    monthlyConsumptionKwh,
    monthlyEnergyCostBRL,
  };
}
