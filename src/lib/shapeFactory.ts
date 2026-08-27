import type { ActiveBeats, BeatShape, CustomPathData } from "../types/shapes";
import type { Sound } from "../types/sounds";
import type { BeatlineNotePlacement } from "../components/BeatlineWithNotes";

export type CreateShapeInput =
  | {
      type: "polygon";
      x: number;
      y: number;
      fillColor: string;
      ballColor: string;
      offset: number;
      lastOffset: number;
      triggerOffsets?: number[];
      size: number;
      corners: number;
      rotation: number;
      value: number[];
      sound: Sound;
      activeBeats: ActiveBeats;
      rotatedValues: number[];
      notePlacements: BeatlineNotePlacement[] | undefined;
      name?: string | undefined;
    }
  | {
      type: "circle";
      x: number;
      y: number;
      fillColor: string;
      ballColor: string;
      offset: number;
      lastOffset: number;
      triggerOffsets?: number[];
      radius: number;
      rotation: number;
      value: number[];
      sound: Sound;
      activeBeats: ActiveBeats;
      rotatedValues: number[];
      notePlacements: BeatlineNotePlacement[] | undefined;
      name?: string | undefined;
    }
  | {
      type: "custom";
      x: number;
      y: number;
      fillColor: string;
      ballColor: string;
      offset: number;
      lastOffset: number;
      triggerOffsets?: number[];
      pathData: CustomPathData;
      rotation: number;
      value: number[];
      sound: Sound;
      activeBeats: ActiveBeats;
      rotatedValues: number[];
      notePlacements: BeatlineNotePlacement[] | undefined;
      name?: string | undefined;
    };

export function createShape(input: CreateShapeInput): BeatShape {
  const base = {
    id: crypto.randomUUID(),
    type: input.type,
    x: input.x,
    y: input.y,
    fillColor: input.fillColor,
    ballColor: input.ballColor,
    startOffset: 0,
    offset: input.offset,
    lastOffset: input.lastOffset,
    rotation: input.rotation,
    value: input.value,
    sound: input.sound,
    paused: false,
    visable: true,
    activeBeats: input.activeBeats,
    muted: false,
    ...(input.triggerOffsets !== undefined
      ? { triggerOffsets: input.triggerOffsets }
      : {}),
    rotatedValues: input.rotatedValues,
    notePlacements: input.notePlacements,
    ...(input.name ? { name: input.name } : {}),
  };

  if (input.type === "polygon") {
    return {
      ...base,
      type: "polygon",
      size: input.size,
      corners: input.corners,
    };
  }

  if (input.type === "circle") {
    return {
      ...base,
      type: "circle",
      radius: input.radius,
    };
  }

  return {
    ...base,
    type: "custom",
    pathData: input.pathData,
  };
}
