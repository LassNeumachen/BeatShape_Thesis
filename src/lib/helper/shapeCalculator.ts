import type { CustomPathData, Point2D } from "../../types/shapes";

export function calculateShapePoints(notesValues: number[]) {
  return buildPolygonFromLengths(notesValues);
}

function buildPolygonFromLengths(notesValues: number[]): CustomPathData | null {
  const total = notesValues.reduce((sum, current) => sum + current, 0);
  if (total <= 0) {
    return null;
  }

  const displayLengths = getDisplayLengths(notesValues);
  const r = findRadius(displayLengths);
  if (!r) {
    return null;
  }

  const centralAngles = displayLengths.map(
    (length) => 2 * Math.asin(length / (2 * r)),
  );

  const circleAngles = [0];
  let current = 0;

  for (const angle of centralAngles) {
    current += angle;
    circleAngles.push(current);
  }

  const points: Point2D[] = circleAngles.map((angle) => [
    r * Math.cos(angle),
    r * Math.sin(angle),
  ]);
  const [start] = points;

  if (!start) {
    return null;
  }

  const segments = notesValues.map((beatLength, index) => {
    const from = points[index];
    const to = index === notesValues.length - 1 ? start : points[index + 1];
    const displayLength = displayLengths[index];
    const preferScreenClockwiseArc = notesValues.length === 2;

    if (!from || !to || displayLength === undefined) {
      return null;
    }

    if (beatLength >= total / 2) {
      return {
        kind: "arc" as const,
        to,
        through: calculateArcThroughPoint(
          from,
          to,
          beatLength,
          displayLength,
          preferScreenClockwiseArc,
        ),
      };
    }

    return {
      kind: "line" as const,
      to,
    };
  });

  return normalizePathData({
    start,
    segments: segments.filter((segment) => segment !== null),
    baseRadius: r,
  });
}

function normalizePathData(pathData: CustomPathData): CustomPathData {
  const points = [
    pathData.start,
    ...pathData.segments.flatMap((segment) =>
      segment.kind === "line" ? [segment.to] : [segment.to, segment.through],
    ),
  ];

  const minX = Math.min(...points.map((point) => point[0]));
  const maxX = Math.max(...points.map((point) => point[0]));
  const minY = Math.min(...points.map((point) => point[1]));
  const maxY = Math.max(...points.map((point) => point[1]));
  const center: Point2D = [(minX + maxX) / 2, (minY + maxY) / 2];

  const normalizedStart = normalizePoint(pathData.start, center);
  const normalizedSegments = pathData.segments.map((segment) =>
    segment.kind === "line"
      ? {
          kind: "line" as const,
          to: normalizePoint(segment.to, center),
        }
      : {
          kind: "arc" as const,
          to: normalizePoint(segment.to, center),
          through: normalizePoint(segment.through, center),
        },
  );

  const normalizedPoints = [
    normalizedStart,
    ...normalizedSegments.flatMap((segment) =>
      segment.kind === "line" ? [segment.to] : [segment.to, segment.through],
    ),
  ];
  const baseRadius = Math.max(
    ...normalizedPoints.map((point) => Math.hypot(point[0], point[1])),
  );

  return {
    start: normalizedStart,
    segments: normalizedSegments,
    baseRadius,
  };
}

function normalizePoint(point: Point2D, center: Point2D): Point2D {
  return [point[0] - center[0], point[1] - center[1]];
}

function getDisplayLengths(notesValues: number[]) {
  const total = notesValues.reduce((sum, value) => sum + value, 0);

  if (notesValues.length === 2) {
    const [first, second] = notesValues;

    if (first === undefined || second === undefined) {
      return notesValues;
    }

    const chordLength =
      first >= total / 2 && second >= total / 2
        ? (total * 13) / 30 // die beiden Punkte sind 13/30 der Gesamtlänge voneinander entfernt
        : Math.min(first, second);

    return [chordLength, chordLength];
  }

  return notesValues.map((value) => {
    if (value < total / 2) {
      return value;
    }

    return Math.max(((total - value) * 2) / 3);
  });
}

function calculateArcThroughPoint(
  from: Point2D,
  to: Point2D,
  arcLength: number, // gewünschte Laufstrecke über den Bogen
  chordLength: number, // direkter sichtbarer Abstand zwischen from und to
  preferScreenClockwiseArc = false,
): Point2D {
  // Richtung von from nach to
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];

  // Tatsächlicher Abstand zwischen from und to
  const chord = Math.hypot(dx, dy);

  // Falls die Punkte quasi identisch sind oder kein Bogen nötig ist,
  // nimm einfach die Mitte als through-Punkt.
  if (chord <= Number.EPSILON || arcLength <= chordLength) {
    return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  }

  // Finde den Mittelpunktswinkel des Bogens.
  // chordLength / arcLength beschreibt:
  // Wie kurz ist die direkte Strecke im Verhältnis zur gewünschten Bogenstrecke?
  const theta = findArcAngle(chordLength / arcLength);

  // Bogenlänge = Radius * Winkel
  // also Radius = Bogenlänge / Winkel
  const radius = arcLength / theta;

  // Sagitta = Bogenhöhe.
  // Das ist der Abstand von der Mitte der Sehne zum Bogen.
  const archHeight = radius * (1 - Math.cos(theta / 2));

  // Mittelpunkt zwischen from und to
  const mid: Point2D = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

  // Normale auf die Linie from -> to.
  // Das ist eine Richtung, die senkrecht zur direkten Verbindung steht.
  let normal: Point2D = preferScreenClockwiseArc
    ? [dy / chord, -dx / chord]
    : [-dy / chord, dx / chord];

  // Prüft, ob mid nicht direkt im Ursprung liegt.
  const midpointIsAwayFromCenter =
    Math.abs(mid[0]) + Math.abs(mid[1]) > Number.EPSILON;

  if (!preferScreenClockwiseArc && midpointIsAwayFromCenter) {
    // Entscheidet, welche Seite "nach außen" zeigt.
    // Wenn die Normale eher nach innen zeigt, wird sie umgedreht.
    const outwardScore = normal[0] * mid[0] + normal[1] * mid[1];

    if (outwardScore < 0) {
      normal = [-normal[0], -normal[1]];
    }
  }

  // through liegt von der Mitte aus archHeight weit senkrecht nach außen.
  return [mid[0] + normal[0] * archHeight, mid[1] + normal[1] * archHeight];
}

function findArcAngle(chordToArcRatio: number) {
  const tolerance = 1e-12;
  let lo = Number.EPSILON;
  let hi = Math.PI * 2 - Number.EPSILON;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const value = (2 * Math.sin(mid / 2)) / mid;

    if (Math.abs(value - chordToArcRatio) < tolerance) {
      return mid;
    }

    if (value > chordToArcRatio) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

function findRadius(notesValues: number[]) {
  const tolerance = 1e-12;
  const maxIteration = 200;
  const total = notesValues.reduce((sum, current) => sum + current, 0);
  const lMax = Math.max(...notesValues);

  const [first, second] = notesValues;
  if (
    notesValues.length === 2 &&
    first !== undefined &&
    second !== undefined &&
    first === second
  ) {
    return first / 2;
  }

  if (total <= 0 || lMax >= total / 2) {
    return null;
  }

  let lo = lMax / 2 + 1e-15;
  let hi = total;

  while (angleSumError(hi, notesValues) > 0) {
    hi *= 2;
  }

  for (let i = 0; i < maxIteration; i++) {
    const mid = (lo + hi) / 2;
    const value = angleSumError(mid, notesValues);

    if (Math.abs(value) < tolerance) {
      return mid;
    }

    if (value > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

function angleSumError(radius: number, notesValues: number[]) {
  return (
    notesValues.reduce(
      (sum, length) => sum + 2 * Math.asin(length / (2 * radius)),
      0,
    ) -
    2 * Math.PI
  );
}
