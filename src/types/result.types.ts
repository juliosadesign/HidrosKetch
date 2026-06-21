// Tipos de resultados calculados.
// Nesta Sprint, eles existem como estrutura para o motor matemático e validação.

export type ComponentCalculationResult = {
  componentId: string;
  componentName: string;
  componentType: string;

  kValue?: number;
  diameterMm?: number;
  flowLps?: number;
  areaM2?: number;
  velocityMs?: number;
  kineticHeadM?: number;
  localLossMca?: number;

  observation?: string;
};

export type CalculationWarning = {
  id: string;
  message: string;
  componentId?: string;
};

export type CalculationError = {
  id: string;
  message: string;
  componentId?: string;
};

export type HydroCalculationResult = {
  status: "not_calculated" | "success" | "failed";

  calculatedAt: string | null;

  totalLocalLossMca: number | null;
  totalPumpHeadMca: number | null;
  residualHeadMca: number | null;
  estimatedPressureKpa: number | null;

  // Sprint 14A — carga geométrica e altura manométrica simplificada.
  originElevationM: number | null;
  destinationElevationM: number | null;
  geometricHeadM: number | null;
  requiredOutletPressureKpa: number | null;
  requiredPressureHeadMca: number | null;
  totalDynamicHeadMca: number | null;

  // Sprint 14C — potência, consumo e custo estimados da bomba.
  hydraulicPowerW: number | null;
  hydraulicPowerKw: number | null;
  electricPowerKw: number | null;
  pumpEfficiencyPercent: number | null;
  operationHoursPerDay: number | null;
  operationDaysPerMonth: number | null;
  energyTariffBRLKwh: number | null;
  dailyConsumptionKwh: number | null;
  monthlyConsumptionKwh: number | null;
  monthlyEnergyCostBRL: number | null;

  componentResults: ComponentCalculationResult[];

  warnings: CalculationWarning[];
  errors: CalculationError[];

  assumptions: string[];
};