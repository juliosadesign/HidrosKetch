import type { Node } from "@xyflow/react";

import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";
import type { HydroNodeData } from "../editor.types";

export function createNodeFromCatalogItem(
  component: ComponentCatalogItem,
  sequence: number
): Node<HydroNodeData> {
  const positionOffset = sequence * 35;

  return {
    id: `${component.kind}_${component.id}_${Date.now()}_${sequence}`,
    type: component.kind,
    position: {
      x: 120 + positionOffset,
      y: 100 + positionOffset,
    },
    selected: true,
    data: {
      label: component.name,
      description: component.description,
      catalogItemId: component.id,
      componentKind: component.kind,
      defaultData: component.defaultData,
    },
  };
}