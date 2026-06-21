import { calculateKineticHeadM } from "./energy";
import { GRAVITY_MS2 } from "../../domain/constants/physics";

// Calcula a perda localizada de um componente:
//
// hloc = K * (V² / 2g)
//
// Onde:
// K = coeficiente de perda localizada
// V = velocidade do fluido
// g = gravidade
export function calculateLocalLossMca(
  kValue: number,
  velocityMs: number,
  gravityMs2: number = GRAVITY_MS2
): number {
  if (kValue < 0) {
    throw new Error("O coeficiente K não pode ser negativo.");
  }

  const kineticHeadM = calculateKineticHeadM(velocityMs, gravityMs2);

  return kValue * kineticHeadM;
}

// Soma várias perdas localizadas individuais.
export function sumLocalLossesMca(lossesMca: number[]): number {
  return lossesMca.reduce((total, current) => total + current, 0);
}