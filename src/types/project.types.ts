// Tipos de resultados calculados.
// Nesta Sprint, eles existem apenas como estrutura.
// O motor matemático real entra na Sprint 3.

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
  
    componentResults: ComponentCalculationResult[];
  
    warnings: CalculationWarning[];
    errors: CalculationError[];
  
    assumptions: string[];
  };