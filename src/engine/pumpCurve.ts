import type { PumpCurveEvaluation, PumpCurvePoint, PumpModel } from "../types/pump.types";

export function sortPumpCurvePoints(
  curvePoints: PumpCurvePoint[] | undefined
): PumpCurvePoint[] {
  return [...(curvePoints ?? [])]
    .filter(
      (point) =>
        Number.isFinite(point.flowM3h) &&
        Number.isFinite(point.headMca) &&
        point.flowM3h >= 0 &&
        point.headMca >= 0
    )
    .sort((first, second) => first.flowM3h - second.flowM3h);
}

export function interpolatePumpHeadAtFlow(
  curvePoints: PumpCurvePoint[] | undefined,
  requiredFlowM3h: number | null
): number | null {
  const sortedPoints = sortPumpCurvePoints(curvePoints);

  if (
    requiredFlowM3h === null ||
    !Number.isFinite(requiredFlowM3h) ||
    requiredFlowM3h < 0 ||
    sortedPoints.length === 0
  ) {
    return null;
  }

  const exactPoint = sortedPoints.find(
    (point) => Math.abs(point.flowM3h - requiredFlowM3h) < 0.000001
  );

  if (exactPoint) {
    return exactPoint.headMca;
  }

  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  if (requiredFlowM3h < firstPoint.flowM3h || requiredFlowM3h > lastPoint.flowM3h) {
    return null;
  }

  const nextPointIndex = sortedPoints.findIndex(
    (point) => point.flowM3h > requiredFlowM3h
  );

  if (nextPointIndex <= 0) {
    return null;
  }

  const previousPoint = sortedPoints[nextPointIndex - 1];
  const nextPoint = sortedPoints[nextPointIndex];
  const flowDelta = nextPoint.flowM3h - previousPoint.flowM3h;

  if (flowDelta === 0) {
    return previousPoint.headMca;
  }

  const ratio = (requiredFlowM3h - previousPoint.flowM3h) / flowDelta;

  return previousPoint.headMca + ratio * (nextPoint.headMca - previousPoint.headMca);
}

export function isFlowInsideCurveRange(
  curvePoints: PumpCurvePoint[] | undefined,
  requiredFlowM3h: number | null
): boolean {
  const sortedPoints = sortPumpCurvePoints(curvePoints);

  if (
    requiredFlowM3h === null ||
    !Number.isFinite(requiredFlowM3h) ||
    sortedPoints.length === 0
  ) {
    return false;
  }

  return (
    requiredFlowM3h >= sortedPoints[0].flowM3h &&
    requiredFlowM3h <= sortedPoints[sortedPoints.length - 1].flowM3h
  );
}

export function evaluatePumpCurveAtOperatingPoint(
  pump: PumpModel,
  requiredFlowM3h: number | null,
  requiredHeadMca: number | null
): PumpCurveEvaluation {
  const sortedPoints = sortPumpCurvePoints(pump.curvePoints);

  if (sortedPoints.length === 0) {
    return {
      hasCurve: false,
      isWithinCurveRange: false,
      deliveredHeadMca: null,
      requiredHeadMca,
      requiredFlowM3h,
      headMarginMca: null,
      headMarginPercent: null,
      message:
        "Esta bomba ainda não possui curva simplificada cadastrada; a comparação usa apenas dados nominais e máximos.",
    };
  }

  if (requiredFlowM3h === null || !Number.isFinite(requiredFlowM3h)) {
    return {
      hasCurve: true,
      isWithinCurveRange: false,
      deliveredHeadMca: null,
      requiredHeadMca,
      requiredFlowM3h,
      headMarginMca: null,
      headMarginPercent: null,
      message:
        "A curva existe, mas a vazão exigida ainda não foi calculada para estimar a altura entregue.",
    };
  }

  const isWithinCurveRangeValue = isFlowInsideCurveRange(
    sortedPoints,
    requiredFlowM3h
  );
  const deliveredHeadMca = interpolatePumpHeadAtFlow(sortedPoints, requiredFlowM3h);

  if (!isWithinCurveRangeValue || deliveredHeadMca === null) {
    return {
      hasCurve: true,
      isWithinCurveRange: false,
      deliveredHeadMca: null,
      requiredHeadMca,
      requiredFlowM3h,
      headMarginMca: null,
      headMarginPercent: null,
      message:
        "A vazão exigida está fora da faixa da curva simplificada cadastrada para esta bomba.",
    };
  }

  if (requiredHeadMca === null || !Number.isFinite(requiredHeadMca)) {
    return {
      hasCurve: true,
      isWithinCurveRange: true,
      deliveredHeadMca,
      requiredHeadMca,
      requiredFlowM3h,
      headMarginMca: null,
      headMarginPercent: null,
      message:
        "A altura entregue pela curva foi estimada, mas a HMT exigida ainda não foi calculada.",
    };
  }

  const headMarginMca = deliveredHeadMca - requiredHeadMca;
  const headMarginPercent = requiredHeadMca > 0 ? (headMarginMca / requiredHeadMca) * 100 : null;

  return {
    hasCurve: true,
    isWithinCurveRange: true,
    deliveredHeadMca,
    requiredHeadMca,
    requiredFlowM3h,
    headMarginMca,
    headMarginPercent,
    message:
      headMarginMca >= 0
        ? "A curva simplificada indica altura suficiente no ponto de vazão informado."
        : "A curva simplificada indica altura insuficiente no ponto de vazão informado.",
  };
}
