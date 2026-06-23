import type { ComponentCalculationResult, HydroCalculationResult } from "../../types/result.types";
import type {
  HydraulicPathCalculationInput,
  LocalLossComponentInput,
} from "./hydraulicEngine.types";

import { litersPerSecondToCubicMetersPerSecond, millimetersToMeters } from "./unitConversion";
import { calculateCircularAreaM2 } from "./geometry";
import { calculateVelocityMs } from "./velocity";
import { calculateKineticHeadM } from "./energy";
import { calculateLocalLossMca, sumLocalLossesMca } from "./localLoss";
import { sumPumpHeadsMca } from "./pump";
import { calculateResidualHeadMca, estimatePressureKpaFromHeadMca } from "./pressure";
import { calculateGeometricHeadM, calculateTotalDynamicHeadMca } from "./head";
import { calculatePumpPower, DEFAULT_PUMP_EFFICIENCY_PERCENT } from "./pumpPower";
import { calculateEnergyCost } from "./energyCost";

// Calcula a perda localizada de um único componente.
// Essa função é pura: recebe dados e devolve resultado.
// Não lê interface, não altera estado e não depende do React.

export function calculateComponentLocalLoss(
  component: LocalLossComponentInput,
  globalFlowLps: number,
  defaultDiameterMm: number
): ComponentCalculationResult {
  const flowLps = component.flowLps ?? globalFlowLps;
  const diameterMm = component.diameterMm ?? defaultDiameterMm;

  const flowM3s = litersPerSecondToCubicMetersPerSecond(flowLps);
  const diameterM = millimetersToMeters(diameterMm);

  const areaM2 = calculateCircularAreaM2(diameterM);
  const velocityMs = calculateVelocityMs(flowM3s, areaM2);
  const kineticHeadM = calculateKineticHeadM(velocityMs);
  const localLossMca = calculateLocalLossMca(component.kValue, velocityMs);

  return {
    componentId: component.componentId,
    componentName: component.componentName,
    componentType: component.componentType,

    kValue: component.kValue,
    diameterMm,
    flowLps,
    areaM2,
    velocityMs,
    kineticHeadM,
    localLossMca,

    observation: component.observation ?? "Perda localizada calculada por K · V²/(2g).",
  };
}

// Motor principal para um caminho hidráulico controlado.
// Na V1, ele serve para caminho simples ou ramificações já divididas.
// Ele NÃO é um solver completo de redes hidráulicas.

export function runHydraulicPathCalculation(
  input: HydraulicPathCalculationInput
): HydroCalculationResult {
  try {
    const componentResults = input.lossComponents.map((component) =>
      calculateComponentLocalLoss(
        component,
        input.flowLps,
        input.defaultDiameterMm
      )
    );

    const localLosses = componentResults.map(
      (result) => result.localLossMca ?? 0
    );

    const totalLocalLossMca = sumLocalLossesMca(localLosses);

    const totalPumpHeadMca = sumPumpHeadsMca(input.pumps);

    const geometricHeadM = calculateGeometricHeadM(
      input.originElevationM,
      input.destinationElevationM
    );

    const requiredPressureHeadMca = input.requiredPressureHeadMca ?? 0;

    const totalDynamicHeadMca = calculateTotalDynamicHeadMca({
      geometricHeadM,
      totalLocalLossMca,
      requiredPressureHeadMca,
    });

    const pumpEfficiencyPercent = resolvePumpEfficiencyPercent(input.pumps);
    const pumpPower = calculatePumpPower({
      flowM3s: litersPerSecondToCubicMetersPerSecond(input.flowLps),
      totalDynamicHeadMca,
      efficiencyPercent: pumpEfficiencyPercent,
    });

    const operationHoursPerDay = clampNonNegative(input.operationHoursPerDay ?? 2);
    const operationDaysPerMonth = clampNonNegative(input.operationDaysPerMonth ?? 30);
    const energyTariffBRLKwh = clampNonNegative(input.energyTariffBRLKwh ?? 0.9);

    const energyCost = calculateEnergyCost({
      electricPowerKw: pumpPower.electricPowerKw,
      operationHoursPerDay,
      operationDaysPerMonth,
      energyTariffBRLKwh,
    });

    const residualHeadMca = calculateResidualHeadMca({
      initialPressureHeadMca: input.initialPressureHeadMca ?? 0,
      totalPumpHeadMca,
      totalLocalLossMca,
      elevationDifferenceM: geometricHeadM,
    });

    const estimatedPressureKpa =
      estimatePressureKpaFromHeadMca(residualHeadMca);

    return {
      status: "success",

      // A data real será inserida pela camada de aplicação depois.
      // Mantemos null aqui para preservar a pureza do motor.
      calculatedAt: null,

      totalLocalLossMca,
      totalPumpHeadMca,
      residualHeadMca,
      estimatedPressureKpa,
      originElevationM: input.originElevationM,
      destinationElevationM: input.destinationElevationM,
      geometricHeadM,
      requiredOutletPressureKpa: input.requiredOutletPressureKpa ?? 0,
      requiredPressureHeadMca,
      totalDynamicHeadMca,
      hydraulicPowerW: pumpPower.hydraulicPowerW,
      hydraulicPowerKw: pumpPower.hydraulicPowerKw,
      electricPowerKw: pumpPower.electricPowerKw,
      pumpEfficiencyPercent: pumpPower.pumpEfficiencyPercent,
      operationHoursPerDay,
      operationDaysPerMonth,
      energyTariffBRLKwh,
      dailyConsumptionKwh: energyCost.dailyConsumptionKwh,
      monthlyConsumptionKwh: energyCost.monthlyConsumptionKwh,
      monthlyEnergyCostBRL: energyCost.monthlyEnergyCostBRL,

      componentResults,
      userDefinedPumps: input.pumps.map((pump) => ({
        id: pump.id,
        name: pump.name,
        manufacturer: pump.manufacturer ?? null,
        model: pump.model ?? null,
        availableHeadMca: pump.headMca ?? null,
        nominalFlowM3h: pump.nominalFlowM3h ?? null,
        nominalPowerKw: pump.nominalPowerKw ?? null,
        efficiencyPercent: pump.efficiencyPercent ?? null,
        voltageV: pump.voltageV ?? null,
        notes: pump.notes ?? null,
        curvePoints: pump.curvePoints ?? [],
      })),

      warnings: [
        {
          id: "v1_simplified_pressure",
          message:
            "A pressão calculada é uma estimativa simplificada para o caminho analisado.",
        },
        {
          id: "v1_local_losses_only",
          message:
            "A V1 calcula perdas localizadas. Perdas contínuas completas ficam para versão futura.",
        },
        {
          id: "sprint14a_total_dynamic_head_simplified",
          message:
            "A altura manométrica total é uma estimativa simplificada: desnível + perdas localizadas + pressão mínima desejada.",
        },
        {
          id: "sprint14c_energy_cost_estimate",
          message:
            "O consumo e o custo de energia são estimativas didáticas e podem variar conforme rendimento real da bomba, tempo de uso, rede hidráulica e tarifa da concessionária.",
        },
      ],

      errors: [],

      assumptions: [
        "Fluido considerado incompressível.",
        "Fluido padrão: água.",
        "Regime permanente.",
        "Bomba modelada por carga fixa H_b.",
        "Pressão estimada apenas para caminho simples ou caminho controlado.",
        "Desnível geométrico calculado por Δz = z_destino - z_origem.",
        "Altura manométrica total estimada por HMT = Δz + perdas + pressão mínima desejada.",
        "Potência elétrica estimada por P_elétrica = P_hidráulica / eficiência.",
        "Consumo mensal estimado por energia = potência elétrica × horas por dia × dias por mês.",
        "Perdas localizadas calculadas por hloc = K · V²/(2g).",
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido no motor hidráulico.";

    return {
      status: "failed",
      calculatedAt: null,

      totalLocalLossMca: null,
      totalPumpHeadMca: null,
      residualHeadMca: null,
      estimatedPressureKpa: null,
      originElevationM: null,
      destinationElevationM: null,
      geometricHeadM: null,
      requiredOutletPressureKpa: null,
      requiredPressureHeadMca: null,
      totalDynamicHeadMca: null,
      hydraulicPowerW: null,
      hydraulicPowerKw: null,
      electricPowerKw: null,
      pumpEfficiencyPercent: null,
      operationHoursPerDay: null,
      operationDaysPerMonth: null,
      energyTariffBRLKwh: null,
      dailyConsumptionKwh: null,
      monthlyConsumptionKwh: null,
      monthlyEnergyCostBRL: null,

      componentResults: [],
      userDefinedPumps: [],

      warnings: [],

      errors: [
        {
          id: "hydraulic_engine_error",
          message,
        },
      ],

      assumptions: [],
    };
  }
}

function resolvePumpEfficiencyPercent(pumps: { efficiencyPercent?: number }[]): number {
  const validEfficiencies = pumps
    .map((pump) => pump.efficiencyPercent)
    .filter((value): value is number =>
      typeof value === "number" && Number.isFinite(value) && value > 0
    );

  if (validEfficiencies.length === 0) {
    return DEFAULT_PUMP_EFFICIENCY_PERCENT;
  }

  const average =
    validEfficiencies.reduce((sum, value) => sum + value, 0) /
    validEfficiencies.length;

  return Math.min(100, average);
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
