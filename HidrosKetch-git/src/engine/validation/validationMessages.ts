import type {
  ValidationIssue,
  ValidationIssueCode,
  ValidationSeverity,
} from "./validation.types";

type BuildIssueInput = {
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  message: string;
  componentId?: string;
};

export function buildValidationIssue(
  input: BuildIssueInput
): ValidationIssue {
  return {
    id: `${input.code}_${input.componentId ?? "project"}`,
    code: input.code,
    severity: input.severity,
    message: input.message,
    componentId: input.componentId,
  };
}