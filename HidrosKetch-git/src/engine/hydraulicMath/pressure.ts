import { WATER_SPECIFIC_WEIGHT_N_M3 } from "../../domain/constants/physics";
import { pascalToKilopascal } from "./unitConversion";

// Calcula a carga residual simplificada:
//
// Hresidual = HpressaoInicial + Hbomba - hlocTotal - Δz
//
// Nesta V1, isso deve ser usado para caminho simples ou caminhos controlados.

export type ResidualHeadInput = {
  initialPressureHeadMca?: number;
  totalPumpHeadMca: number;
  totalLocalLossMca: number;
  elevationDifferenceM: number;
};

export function calculateResidualHeadMca(input: ResidualHeadInput): number {
  const initialPressureHeadMca = input.initialPressureHeadMca ?? 0;

  return (
    initialPressureHeadMca +
    input.totalPumpHeadMca -
    input.totalLocalLossMca -
    input.elevationDifferenceM
  );
}

// Converte carga residual em pressão estimada:
//
// P = γ * H
//
// Para água:
// γ = 9810 N/m³
//
// O resultado é retornado em kPa.

export function estimatePressureKpaFromHeadMca(
  headMca: number,
  specificWeightNM3: number = WATER_SPECIFIC_WEIGHT_N_M3
): number {
  const pressurePa = specificWeightNM3 * headMca;

  return pascalToKilopascal(pressurePa);
}