export type TotalDynamicHeadInput = {
  geometricHeadM: number;
  totalLocalLossMca: number;
  requiredPressureHeadMca: number;
};

export function calculateGeometricHeadM(
  originElevationM: number,
  destinationElevationM: number
): number {
  return destinationElevationM - originElevationM;
}

export function kilopascalToMetersOfWaterColumn(pressureKpa: number): number {
  return pressureKpa / 9.81;
}

export function calculateTotalDynamicHeadMca(
  input: TotalDynamicHeadInput
): number {
  const rawHead =
    input.geometricHeadM +
    input.totalLocalLossMca +
    input.requiredPressureHeadMca;

  return Math.max(0, rawHead);
}
