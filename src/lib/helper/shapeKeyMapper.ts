import type { BeatShape, ShapeKey } from "../../types/shapes";
import { inverseTransformPathData } from "./paperPath";
import { getStageShapeSizeFromVolume } from "./shapeSize";

export function beatShapeToShapeKey(shape: BeatShape): ShapeKey {
  if (shape.type === "polygon") {
    return {
      type: "polygon",
      corners: shape.corners,
      value: shape.value,
      createdByUser: true,
    };
  }

  if (shape.type === "circle") {
    return {
      type: "circle",
      corners: 0,
      value: shape.value,
      createdByUser: true,
    };
  }

  const size = getStageShapeSizeFromVolume(shape.sound.volume);
  const scale = size / shape.pathData.baseRadius;

  return {
    type: "custom",
    corners: shape.pathData.segments.length,
    value: shape.value,
    createdByUser: true,
    pathData: inverseTransformPathData(shape.pathData, scale, shape.x, shape.y),
  };
}
