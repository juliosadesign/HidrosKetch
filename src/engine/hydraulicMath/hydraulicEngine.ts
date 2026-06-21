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

      componentResults,

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

      componentResults: [],

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