import paper from "paper";
import type { BeatShape, CustomBS } from "../../types/shapes";
import type { RuntimeShape } from "../../types/runtime";
import { appColors } from "../../theme";
import {
  getPitchAdjustedFillColor,
  getPitchSection,
} from "../helper/PitchHelper";
import { buildPaperPath, buildTippedCirclePath } from "../helper/paperPath";
import { getOffsetBeforeStart } from "../constants/stageTiming";

type CreateRuntimeShapesParams = {
  shapes: BeatShape[];
  scope: paper.PaperScope;
  pitchSections: number[];
  loopDuration: number;
  globalPaused: boolean;
};

type CreateRuntimeShapeParams = {
  shape: BeatShape;
  scope: paper.PaperScope;
  pitchSections: number[];
  loopDuration: number;
};

export function createRuntimeShapes({
  shapes,
  scope,
  pitchSections,
  loopDuration,
  globalPaused,
}: CreateRuntimeShapesParams) {
  return shapes.map((shape) => {
    const runtime = createRuntimeShape({
      shape,
      scope,
      pitchSections,
      loopDuration,
    });

    setRuntimeShapeVisual(runtime, globalPaused);
    return runtime;
  });
}

export function createRuntimeShape({
  shape,
  scope,
  pitchSections,
  loopDuration,
}: CreateRuntimeShapeParams) {
  const pitchSection = getPitchSection(shape.y, pitchSections);
  const pitchAdjustedFillColor = getPitchAdjustedFillColor(
    shape.fillColor,
    pitchSection,
  );
  const path = createPathForShape(scope, shape, pitchAdjustedFillColor);

  path.data.sound = shape.sound;
  path.data.shapeId = shape.id;

  const triggerOffsets = getTriggerOffsets(scope, shape, path);

  if (shape.rotation !== undefined) {
    path.rotation = shape.rotation;
  }

  const phaseOffset = ((shape.rotation ?? 0) / 360) * path.length;
  const startOffset = phaseOffset % path.length;
  const initialOffset = getOffsetBeforeStart(startOffset, path.length);
  const marker = createMarker(scope, path, initialOffset);
  const label = createShapeLabel(scope, shape, path);
  const glowMarker = createGlowMarker(scope, marker);

  return {
    id: shape.id,
    path,
    label,
    glowMarker,
    marker,
    offset: initialOffset,
    startOffset,
    loopDuration,
    triggerOffsets,
    sound: shape.sound,
    glow: 0,
    paused: shape.paused,
    visible: shape.visable,
    muted: shape.muted,
    activeBeats: shape.activeBeats,
    pitchSection,
    fillColor: shape.fillColor,
  } satisfies RuntimeShape;
}

export function setRuntimeShapeVisual(
  runtime: RuntimeShape,
  globalPaused: boolean,
) {
  if (!runtime.visible) {
    runtime.path.opacity = 0;
    if (runtime.label) {
      runtime.label.opacity = 0;
    }
    runtime.marker.opacity = 0;
    runtime.glow = 0;
    runtime.glowMarker.opacity = 0;
    runtime.glowMarker.shadowBlur = 0;
    return;
  }

  runtime.path.opacity = runtime.muted || runtime.paused ? 0.45 : 1;
  if (runtime.label) {
    runtime.label.opacity = runtime.muted || runtime.paused ? 0.45 : 1;
    runtime.label.position = runtime.path.position;
  }
  runtime.marker.fillColor = new paper.Color(
    runtime.muted ? appColors.pausedBall : appColors.black,
  );
  if (runtime.paused || globalPaused) {
    runtime.glow = 0;
    runtime.glowMarker.opacity = 0;
    runtime.glowMarker.shadowBlur = 0;
  }
}

function createPathForShape(
  scope: paper.PaperScope,
  shape: BeatShape,
  fillColor: string,
) {
  if (shape.type === "polygon") {
    return new scope.Path.RegularPolygon({
      center: new scope.Point(shape.x, shape.y),
      sides: shape.corners,
      radius: shape.size,
      fillColor,
      sound: shape.sound,
    });
  }

  if (shape.type === "circle") {
    return buildTippedCirclePath(
      scope,
      new scope.Point(shape.x, shape.y),
      shape.radius,
      fillColor,
    );
  }

  return buildPaperPath(scope, shape.pathData, fillColor);
}

function getTriggerOffsets(
  scope: paper.PaperScope,
  shape: BeatShape,
  path: paper.Path,
) {
  if (shape.type === "circle") {
    return [0];
  }

  if (shape.type === "custom") {
    return getCustomTriggerPointsOnPath(scope, shape, path)
      .map((point) => path.getOffsetOf(point))
      .filter((offset): offset is number => offset !== null);
  }

  return path.segments
    .map((segment) => path.getOffsetOf(segment.point))
    .filter((offset): offset is number => offset !== null);
}

function getCustomTriggerPointsOnPath(
  scope: paper.PaperScope,
  shape: CustomBS,
  path: paper.Path,
) {
  return [
    shape.pathData.start,
    ...shape.pathData.segments.map((segment) => segment.to),
  ].map(([x, y]) => {
    return new scope.Point(path.position.x * 2 - x, path.position.y * 2 - y);
  });
}

function createMarker(
  scope: paper.PaperScope,
  path: paper.Path,
  offset: number,
) {
  return new scope.Path.Circle({
    center: path.getPointAt(offset) ?? path.position,
    radius: 15,
    fillColor: new scope.Color(appColors.black),
  });
}

function createShapeLabel(
  scope: paper.PaperScope,
  shape: BeatShape,
  path: paper.Path,
) {
  if (!shape.name || shape.name.trim().length === 0) return null;

  const label = new scope.PointText({
    point: path.position,
    content: shape.name,
    fillColor: new scope.Color(appColors.black),
    fontFamily: "Staatliches, sans-serif",
    fontSize: 24,
    justification: "center",
  });

  label.data.shapeId = shape.id;
  label.position = path.position;
  label.insertAbove(path);
  return label;
}

function createGlowMarker(scope: paper.PaperScope, marker: paper.Path.Circle) {
  const glowMarker = new scope.Path.Circle({
    center: marker.position,
    radius: 22,
    fillColor: new scope.Color("#ffffff"),
  });

  glowMarker.opacity = 0;
  glowMarker.shadowColor = new scope.Color(appColors.glowColor);
  glowMarker.shadowBlur = 0;
  glowMarker.shadowOffset = new scope.Point(0, 0);
  glowMarker.insertBelow(marker);
  return glowMarker;
}
