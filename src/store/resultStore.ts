import type { ProjectValidationResult } from "../engine/validation/validation.types";
import type { HydroCalculationResult } from "../types/result.types";

export type CalculationAttemptStatus = "idle" | "blocked" | "success" | "failed";

export type StoredCalculationState = {
  status: CalculationAttemptStatus;
  lastResult: HydroCalculationResult | null;
  lastValidation: ProjectValidationResult | null;
  lastCalculatedAt: string | null;
};

export const EMPTY_RESULT_STORE: StoredCalculationState = {
  status: "idle",
  lastResult: null,
  lastValidation: null,
  lastCalculatedAt: null,
};