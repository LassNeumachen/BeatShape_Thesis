import paper from "paper";
import type { MutableRefObject } from "react";
import type { MetronomeRuntime } from "../../types/runtime";
import type { ActiveBeats } from "../../types/shapes";
import { checkTriggerCrossing } from "../helper/TriggerHelper";

type UpdateMetronomeParams = {
  metronome: MetronomeRuntime;
  delta: number;
  sekToEncircle: number;
  synchronizedElapsed?: number | null;
  activeBeatRef: MutableRefObject<number>;
  beatNumberRef: MutableRefObject<number>;
  setActiveBeat: (activeBeat: number) => void;
  setBeatNumber: (beatNumber: number) => void;
  setBeatProgress: (beatProgress: ActiveBeats) => void;
};

export function setupMetronomeRuntime(scope: paper.PaperScope) {
  const path = new scope.Path.RegularPolygon({
    center: new scope.Point(-1000, -1000),
    sides: 4,
    radius: 100,
  });

  path.visible = false;

  const triggerOffsets = path.segments
    .map((segment) => path.getOffsetOf(segment.point))
    .filter((offset): offset is number => offset !== null);

  return {
    path,
    offset: 0,
    triggerOffsets,
  } satisfies MetronomeRuntime;
}

export function updateMetronome({
  metronome,
  delta,
  sekToEncircle,
  synchronizedElapsed = null,
  activeBeatRef,
  beatNumberRef,
  setActiveBeat,
  setBeatNumber,
  setBeatProgress,
}: UpdateMetronomeParams) {
  const oldOffset = metronome.offset;
  const newOffset =
    synchronizedElapsed === null
      ? (metronome.offset + (metronome.path.length / sekToEncircle) * delta) %
        metronome.path.length
      : ((metronome.path.length * synchronizedElapsed) / sekToEncircle) %
        metronome.path.length;

  const triggered = checkTriggerCrossing(
    metronome.triggerOffsets,
    oldOffset,
    newOffset,
    metronome.path.length,
  );

  metronome.offset = newOffset;

  if (triggered) {
    activeBeatRef.current = (activeBeatRef.current + 1) % 4;
    setActiveBeat(activeBeatRef.current);
    if (activeBeatRef.current === 0) {
      const next = (beatNumberRef.current + 1) % 4;
      beatNumberRef.current = next;
      setBeatNumber(next);

      const nextProgress: ActiveBeats = [false, false, false, false];
      nextProgress[next] = true;
      setBeatProgress(nextProgress);
    }
  }
}
