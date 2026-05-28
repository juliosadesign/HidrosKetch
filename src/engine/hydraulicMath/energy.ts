import { GRAVITY_MS2 } from "../../domain/constants/physics";

// Calcula a carga cinética do escoamento:
//
// V² / 2g
//
// Essa parcela representa a energia associada ao movimento do fluido.

export function calculateKineticHeadM(
  velocityMs: number,
  gravityMs2: number = GRAVITY_MS2
): number {
  if (velocityMs < 0) {
    throw new Error("A velocidade não pode ser negativa.");
  }

  if (gravityMs2 <= 0) {
    throw new Error("A gravidade deve ser maior que zero.");
  }

  return Math.pow(velocityMs, 2) / (2 * gravityMs2);
}