import type { FluidProperties } from "../../types/hydraulic.types";

// Constantes físicas padrão da V1.
// A V1 usa água como fluido padrão.

export const GRAVITY_MS2 = 9.81;

export const WATER_DENSITY_KG_M3 = 1000;

export const WATER_SPECIFIC_WEIGHT_N_M3 =
  WATER_DENSITY_KG_M3 * GRAVITY_MS2;

export const WATER_PROPERTIES: FluidProperties = {
  type: "water",
  name: "Água",
  densityKgM3: WATER_DENSITY_KG_M3,
  gravityMS2: GRAVITY_MS2,
  specificWeightNM3: WATER_SPECIFIC_WEIGHT_N_M3,
};

// Valor padrão da bomba na V1.
// O usuário poderá alterar depois no painel de propriedades.
export const DEFAULT_PUMP_HEAD_MCA = 10;

// Valor padrão de diâmetro apenas para criação rápida de componentes.
// O usuário poderá alterar.
export const DEFAULT_DIAMETER_MM = 50;

// Vazão padrão usada em casos de teste.
// Em projeto real, o usuário deverá preencher.
export const DEFAULT_FLOW_LPS = 2;