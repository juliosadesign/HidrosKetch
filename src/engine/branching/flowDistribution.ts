import type { BranchingMode } from "../../types/hydraulic.types";

export type FlowDistributionInput = {
  totalFlowLps: number;
  branchCount: number;
  mode: BranchingMode;
  manualFlowsLps: number[];
  percentages: number[];
  demandsLps: number[];
};

export type FlowDistributionResult = {
  valid: boolean;
  flowsLps: number[];
  errors: string[];
  warnings: string[];
};

const TOLERANCE = 0.001;

export function distributeBranchFlow(
  input: FlowDistributionInput
): FlowDistributionResult {
  if (input.branchCount < 2) {
    return {
      valid: false,
      flowsLps: [],
      errors: ["A ramificação precisa ter pelo menos dois ramos."],
      warnings: [],
    };
  }

  if (input.totalFlowLps <= 0) {
    return {
      valid: false,
      flowsLps: [],
      errors: ["A vazão total precisa ser maior que zero."],
      warnings: [],
    };
  }

  switch (input.mode) {
    case "equal":
      return distributeEqual(input.totalFlowLps, input.branchCount);

    case "percentage":
      return distributeByPercentage(
        input.totalFlowLps,
        input.branchCount,
        input.percentages
      );

    case "manual":
      return distributeManual(
        input.totalFlowLps,
        input.branchCount,
        input.manualFlowsLps
      );

    case "demand":
      return distributeByDemand(
        input.totalFlowLps,
        input.branchCount,
        input.demandsLps
      );

    default:
      return {
        valid: false,
        flowsLps: [],
        errors: ["Modo de divisão de vazão inválido."],
        warnings: [],
      };
  }
}

function distributeEqual(
  totalFlowLps: number,
  branchCount: number
): FlowDistributionResult {
  const flowPerBranch = totalFlowLps / branchCount;

  return {
    valid: true,
    flowsLps: Array.from({ length: branchCount }, () => flowPerBranch),
    errors: [],
    warnings: [
      "A vazão foi dividida igualmente entre os ramos. Isso é uma simplificação da V1, não um solver hidráulico completo.",
    ],
  };
}

function distributeByPercentage(
  totalFlowLps: number,
  branchCount: number,
  percentages: number[]
): FlowDistributionResult {
  if (percentages.length !== branchCount) {
    return {
      valid: false,
      flowsLps: [],
      errors: [`Informe ${branchCount} percentuais, um para cada ramo.`],
      warnings: [],
    };
  }

  const sum = percentages.reduce((total, value) => total + value, 0);

  if (Math.abs(sum - 100) > TOLERANCE) {
    return {
      valid: false,
      flowsLps: [],
      errors: [`A soma dos percentuais deve ser 100%. Soma atual: ${sum}%.`],
      warnings: [],
    };
  }

  return {
    valid: true,
    flowsLps: percentages.map((percentage) => totalFlowLps * (percentage / 100)),
    errors: [],
    warnings: [],
  };
}

function distributeManual(
  totalFlowLps: number,
  branchCount: number,
  manualFlowsLps: number[]
): FlowDistributionResult {
  if (manualFlowsLps.length !== branchCount) {
    return {
      valid: false,
      flowsLps: [],
      errors: [`Informe ${branchCount} vazões, uma para cada ramo.`],
      warnings: [],
    };
  }

  const sum = manualFlowsLps.reduce((total, value) => total + value, 0);

  if (Math.abs(sum - totalFlowLps) > TOLERANCE) {
    return {
      valid: false,
      flowsLps: [],
      errors: [
        `A soma das vazões dos ramos deve ser ${totalFlowLps} L/s. Soma atual: ${sum} L/s.`,
      ],
      warnings: [],
    };
  }

  return {
    valid: true,
    flowsLps: manualFlowsLps,
    errors: [],
    warnings: [],
  };
}

function distributeByDemand(
  totalFlowLps: number,
  branchCount: number,
  demandsLps: number[]
): FlowDistributionResult {
  if (demandsLps.length !== branchCount) {
    return {
      valid: false,
      flowsLps: [],
      errors: [`Informe ${branchCount} demandas, uma para cada ramo.`],
      warnings: [],
    };
  }

  const hasInvalidDemand = demandsLps.some((demand) => demand <= 0);

  if (hasInvalidDemand) {
    return {
      valid: false,
      flowsLps: [],
      errors: ["Todas as demandas precisam ser maiores que zero."],
      warnings: [],
    };
  }

  const sum = demandsLps.reduce((total, value) => total + value, 0);

  if (Math.abs(sum - totalFlowLps) > TOLERANCE) {
    return {
      valid: false,
      flowsLps: [],
      errors: [
        `A soma das demandas deve ser ${totalFlowLps} L/s. Soma atual: ${sum} L/s.`,
      ],
      warnings: [],
    };
  }

  return {
    valid: true,
    flowsLps: demandsLps,
    errors: [],
    warnings: [],
  };
}

export function parseBranchNumberList(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => Number(item.trim().replace(",", ".")))
      .filter((item) => Number.isFinite(item));
  }

  return [];
}