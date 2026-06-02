import type { HydroComponent, HydroConnection } from "./component.types";
import type {
  ProjectHydraulicSettings,
  ProjectStatus,
} from "./hydraulic.types";
import type { HydroCalculationResult } from "./result.types";

export type ProjectMetadata = {
  id: string;
  name: string;
  description?: string;
  author?: string;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  lastCalculatedAt: string | null;
};

export type HydroSketchProject = {
  metadata: ProjectMetadata;
  status: ProjectStatus;
  settings: ProjectHydraulicSettings;
  components: HydroComponent[];
  connections: HydroConnection[];
  lastResult: HydroCalculationResult | null;
};