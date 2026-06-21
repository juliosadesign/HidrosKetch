import type { UnitSettings } from "../../types/hydraulic.types";

// Unidades padrão da interface.
// Internamente, o motor matemático converterá para SI na Sprint 3.

export const DEFAULT_UNITS: UnitSettings = {
  flow: "L/s",
  diameter: "mm",
  length: "m",
  pressure: "kPa",
  head: "mca",
  density: "kg/m³",
};

export const UNIT_LABELS = {
  flow: {
    Lps: "L/s",
    m3s: "m³/s",
  },
  diameter: {
    mm: "mm",
    m: "m",
  },
  pressure: {
    Pa: "Pa",
    kPa: "kPa",
    mca: "mca",
  },
  head: {
    mca: "mca",
    m: "m",
  },
};