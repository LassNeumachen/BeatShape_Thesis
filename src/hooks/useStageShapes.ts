import { useEffect, useRef } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ActiveBeats, BeatShape } from "../types/shapes";
import type { MetronomeRuntime, RuntimeShape } from "../types/runtime";
import { getOffsetBeforeStart } from "../lib/constants/stageTiming";
import {
  createRuntimeShapes,
  setRuntimeShapeVisual,
} from "../lib/services/StageShapeRendererService";

type UseStageShapesParams = {
  shapes: BeatShape[];
  setShapes: Dispatch<SetStateAction<BeatShape[]>>;
  paperScopeRef: MutableRefObject<paper.PaperScope | null>;
  metronomeRuntimeRef: MutableRefObject<MetronomeRuntime | null>;
  stageBackgroundRef: MutableRefObject<paper.Group | null>;
  pitchSections: number[];
  sekToEncircle: number;
  play: boolean;
  activeBeatRef: MutableRefObject<number>;
  beatNumberRef: MutableRefObject<number>;
  setActiveBeat: (activeBeat: number) => void;
  setBeatNumber: (beatNumber: number) => void;
  setBeatProgress: (beatProgress: ActiveBeats) => void;
  renderStageBackground: (scope: paper.PaperScope) => void;
  setupMetronomeRuntime: (scope: paper.PaperScope) => void;
};

export function useStageShapes({
  shapes,
  setShapes,
  paperScopeRef,
  metronomeRuntimeRef,
  stageBackgroundRef,
  pitchSections,
  sekToEncircle,
  play,
  activeBeatRef,
  beatNumberRef,
  setActiveBeat,
  setBeatNumber,
  setBeatProgress,
  renderStageBackground,
  setupMetronomeRuntime,
}: UseStageShapesParams) {
  const runtimeShapesRef = useRef<RuntimeShape[]>([]);

  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope) return;

    scope.activate();
    scope.project.clear();
    stageBackgroundRef.current = null;
    renderStageBackground(scope);
    setupMetronomeRuntime(scope);
    resetAllRuntimeShapes();

    runtimeShapesRef.current = createRuntimeShapes({
      shapes,
      scope,
      pitchSections,
      loopDuration: sekToEncircle,
      globalPaused: !play,
    });
  }, [shapes, sekToEncircle, pitchSections]);

  useEffect(() => {
    for (const runtime of runtimeShapesRef.current) {
      setRuntimeShapeVisual(runtime, !play);
    }
  }, [play, shapes]);

  function resetAllRuntimeShapes() {
    activeBeatRef.current = 0;
    setActiveBeat(0);
    beatNumberRef.current = 0;
    setBeatNumber(0);
    setBeatProgress([true, false, false, false]);

    if (metronomeRuntimeRef.current) {
      metronomeRuntimeRef.current.offset = 0;
    }

    for (const runtime of runtimeShapesRef.current) {
      runtime.offset = getOffsetBeforeStart(
        runtime.startOffset,
        runtime.path.length,
      );
      runtime.marker.position =
        runtime.path.getPointAt(runtime.offset) ?? runtime.path.position;

      runtime.glowMarker.position = runtime.marker.position;

      if (runtime.label) {
        runtime.label.position = runtime.path.position;
      }
    }
  }

  function syncRuntimeOffsetsToShapes() {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        const runtime = runtimeShapesRef.current.find(
          (item) => item.id === shape.id,
        );
        if (!runtime) return shape;

        return {
          ...shape,
          offset: runtime.offset,
          lastOffset: runtime.offset,
        };
      }),
    );
  }

  return {
    runtimeShapesRef,
    resetAllRuntimeShapes,
    syncRuntimeOffsetsToShapes,
  };
}
