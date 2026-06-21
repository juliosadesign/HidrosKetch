export type ValidationSeverity = "error" | "warning";

export type ValidationIssueCode =
  | "missing_origin"
  | "missing_destination"
  | "invalid_flow"
  | "missing_pipe_diameter"
  | "missing_accessory_k"
  | "missing_valve_k"
  | "closed_valve"
  | "invalid_pump_head"
  | "disconnected_component"
  | "missing_branching_mode"
  | "invalid_scale"
  | "atmospheric_pressure_assumed"
  | "equal_branching_assumed"
  | "simplified_pressure_estimation"
  | "invalid_branch_count"
  | "invalid_branch_manual_sum"
  | "invalid_branch_percentage_sum"
  | "missing_branch_demands"
  | "branching_simplified";

export type ValidationIssue = {
  id: string;
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  message: string;
  componentId?: string;
};

export type ProjectValidationResult = {
  canCalculate: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};