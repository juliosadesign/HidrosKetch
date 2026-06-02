export function pixelsToMeters(
    pixels: number,
    pixelsPerMeter: number
  ): number {
    if (pixelsPerMeter <= 0) {
      return 0;
    }
  
    return pixels / pixelsPerMeter;
  }
  
  export function metersToPixels(
    meters: number,
    pixelsPerMeter: number
  ): number {
    return meters * pixelsPerMeter;
  }
  
  export function formatMeters(value: number): string {
    if (!Number.isFinite(value)) {
      return "-";
    }
  
    if (value < 1) {
      return `${value.toFixed(2)} m`;
    }
  
    return `${value.toFixed(1)} m`;
  }