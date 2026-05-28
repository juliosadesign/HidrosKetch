import type { HydroCalculationResult } from "../../types/result.types";
import type { HydroSketchProject } from "../../types/project.types";
import { WATER_PROPERTIES, DEFAULT_FLOW_LPS, DEFAULT_PUMP_HEAD_MCA } from "../constants/physics";
import { DEFAULT_UNITS } from "../units/units";

// Resultado inicial vazio.
// O cálculo real só será criado na Sprint 3 e integrado depois.
export const EMPTY_CALCULATION_RESULT: HydroCalculationResult = {
  status: "not_calculated",
  calculatedAt: null,
  totalLocalLossMca: null,
  totalPumpHeadMca: null,
  residualHeadMca: null,
  estimatedPressureKpa: null,
  componentResults: [],
  warnings: [],
  errors: [],
  assumptions: [],
};

export function createDefaultProject(): HydroSketchProject {
  const now = new Date().toISOString();

  return {
    metadata: {
      id: `project_${Date.now()}`,
      name: "Projeto sem título",
      description: "Projeto HidroSketch V1",
      author: "",
      schemaVersion: "1.0.0",
      createdAt: now,
      updatedAt: now,
      lastCalculatedAt: null,
    },

    status: "draft",

    settings: {
      fluid: WATER_PROPERTIES,
      units: DEFAULT_UNITS,

      scale: {
        pixelsPerMeter: 40,
        gridSpacingPx: 20,
        gridEnabled: true,
        rulerEnabled: true,
        snapEnabled: true,
      },

      defaultFlowLps: DEFAULT_FLOW_LPS,
      defaultPumpHeadMca: DEFAULT_PUMP_HEAD_MCA,
      branchingMode: "equal",
    },

    components: [],

    connections: [],

    lastResult: EMPTY_CALCULATION_RESULT,
  };
}