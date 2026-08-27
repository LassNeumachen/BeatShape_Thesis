import type { CustomPathData, Point2D } from "../../types/shapes";

export function transformPoint(
  [x, y]: Point2D,
  scale: number,
  offsetX: number,
  offsetY: number,
): Point2D {
  return [x * scale + offsetX, y * scale + offsetY];
}

export function transformPathData(
  pathData: CustomPathData,
  scale: number,
  offsetX: number,
  offsetY: number,
): CustomPathData {
  return {
    ...pathData,
    start: transformPoint(pathData.start, scale, offsetX, offsetY),
    segments: pathData.segments.map((segment) =>
      segment.kind === "line"
        ? {
            kind: "line",
            to: transformPoint(segment.to, scale, offsetX, offsetY),
          }
        : {
            kind: "arc",
            to: transformPoint(segment.to, scale, offsetX, offsetY),
            through: transformPoint(segment.through, scale, offsetX, offsetY),
          },
    ),
  };
}

export function inverseTransformPoint(
  [x, y]: Point2D,
  scale: number,
  offsetX: number,
  offsetY: number,
): Point2D {
  return [(x - offsetX) / scale, (y - offsetY) / scale];
}

export function inverseTransformPathData(
  pathData: CustomPathData,
  scale: number,
  offsetX: number,
  offsetY: number,
): CustomPathData {
  if (!Number.isFinite(scale) || Math.abs(scale) <= Number.EPSILON) {
    return pathData;
  }

  return {
    ...pathData,
    start: inverseTransformPoint(pathData.start, scale, offsetX, offsetY),
    segments: pathData.segments.map((segment) =>
      segment.kind === "line"
        ? {
            kind: "line",
            to: inverseTransformPoint(segment.to, scale, offsetX, offsetY),
          }
        : {
            kind: "arc",
            to: inverseTransformPoint(segment.to, scale, offsetX, offsetY),
            through: inverseTransformPoint(
              segment.through,
              scale,
              offsetX,
              offsetY,
            ),
          },
    ),
  };
}

export function buildPaperPath(
  scope: paper.PaperScope,
  pathData: CustomPathData,
  fillColor: string,
) {
  const path = new scope.Path();
  path.moveTo(new scope.Point(pathData.start[0], pathData.start[1]));

  for (const segment of pathData.segments) {
    if (segment.kind === "line") {
      path.lineTo(new scope.Point(segment.to[0], segment.to[1]));
    } else {
      const through = new scope.Point(segment.through[0], segment.through[1]);
      const to = new scope.Point(segment.to[0], segment.to[1]);

      if (canBuildArc(path.lastSegment?.point, through, to)) {
        try {
          path.arcTo(through, to);
        } catch {
          path.lineTo(to);
        }
      } else {
        path.lineTo(to);
      }
    }
  }

  path.closed = true;
  path.fillColor = fillColor as never;
  path.rotation = 180;
  return path;
}

export function buildTippedCirclePath(
  scope: paper.PaperScope,
  center: paper.Point,
  radius: number,
  fillColor: string,
) {
  const tipLength = Math.min(12, Math.max(4, radius * 0.08));
  const bodyRadius = Math.max(1, radius - tipLength);
  const tipDistance = bodyRadius + tipLength;
  const tangentAngle = Math.acos(bodyRadius / tipDistance);
  const segmentCount = 150;
  const path = new scope.Path();

  path.add(new scope.Point(center.x + radius, center.y));

  for (let index = 0; index <= segmentCount; index++) {
    const progress = index / segmentCount;
    const angle = tangentAngle + progress * (Math.PI * 2 - tangentAngle * 2);

    path.add(
      new scope.Point(
        center.x + Math.cos(angle) * bodyRadius,
        center.y + Math.sin(angle) * bodyRadius,
      ),
    );
  }

  path.closed = true;
  path.fillColor = fillColor as never;
  path.rotation = 180;
  return path;
}

function canBuildArc(
  from: paper.Point | null | undefined,
  through: paper.Point,
  to: paper.Point,
) {
  if (!from) return false;

  const points = [from, through, to];
  const hasOnlyFiniteCoordinates = points.every(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
  );

  if (!hasOnlyFiniteCoordinates) return false;

  const minDistance = 0.001;
  if (
    from.getDistance(through) < minDistance ||
    through.getDistance(to) < minDistance ||
    from.getDistance(to) < minDistance
  ) {
    return false;
  }

  const area =
    (through.x - from.x) * (to.y - from.y) -
    (through.y - from.y) * (to.x - from.x);

  return Math.abs(area) >= minDistance;
}
