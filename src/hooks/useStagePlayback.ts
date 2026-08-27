import { useEffect } from "react";
import type { MutableRefObject } from "react";
import type { ActiveBeats } from "../types/shapes";
import type { MetronomeRuntime, RuntimeShape } from "../types/runtime";
import { checkTriggerCrossing } from "../lib/helper/TriggerHelper";
import { playSound } from "../lib/audioEngine";
import { updateMetronome } from "../lib/services/MetronomeService";

type UseStagePlaybackParams = {
  paperScopeRef: MutableRefObject<paper.PaperScope | null>;
  runtimeShapesRef: MutableRefObject<RuntimeShape[]>;
  metronomeRuntimeRef: MutableRefObject<MetronomeRuntime | null>;
  dialogSyncStartAtRef: MutableRefObject<number | null>;
  activeBeatRef: MutableRefObject<number>;
  beatNumberRef: MutableRefObject<number>;
  play: boolean;
  muted: boolean;
  sekToEncircle: number;
  manageDialog: boolean;
  setActiveBeat: (activeBeat: number) => void;
  setBeatNumber: (beatNumber: number) => void;
  setBeatProgress: (beatProgress: ActiveBeats) => void;
};

export function useStagePlayback({
  paperScopeRef,
  runtimeShapesRef,
  metronomeRuntimeRef,
  dialogSyncStartAtRef,
  activeBeatRef,
  beatNumberRef,
  play,
  muted,
  sekToEncircle,
  manageDialog,
  setActiveBeat,
  setBeatNumber,
  setBeatProgress,
}: UseStagePlaybackParams) {
  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope) return;

    if (!play) {
      scope.view.onFrame = null;
      return;
    }

    setBeatProgress([true, false, false, false]);
    setBeatNumber(0);

    scope.view.onFrame = (event: { delta: number }) => {
      let synchronizedElapsed: number | null = null;

      if (manageDialog) {
        const startAt = dialogSyncStartAtRef.current;
        if (startAt === null) return;

        synchronizedElapsed = (performance.now() - startAt) / 1000;
        if (synchronizedElapsed < 0) return;
      }

      const metronome = metronomeRuntimeRef.current;
      if (metronome) {
        updateMetronome({
          metronome,
          delta: event.delta,
          sekToEncircle,
          synchronizedElapsed,
          activeBeatRef,
          beatNumberRef,
          setActiveBeat,
          setBeatNumber,
          setBeatProgress,
        });
      }

      for (const runtime of runtimeShapesRef.current) {
        const oldOffset = runtime.offset;
        const calculatedNewOffset =
          synchronizedElapsed === null
            ? (runtime.offset +
                (runtime.path.length / runtime.loopDuration) * event.delta) %
              runtime.path.length
            : (runtime.startOffset +
                (runtime.path.length * synchronizedElapsed) /
                  runtime.loopDuration) %
              runtime.path.length;
        const currentBeatIsActive = runtime.activeBeats[beatNumberRef.current];
        const newOffset = calculatedNewOffset;

        const triggered = checkTriggerCrossing(
          runtime.triggerOffsets,
          oldOffset,
          newOffset,
          runtime.path.length,
        );

        runtime.offset = newOffset;

        if (!runtime.paused && currentBeatIsActive) {
          runtime.marker.position =
            runtime.path.getPointAt(runtime.offset) ?? runtime.path.position;

          runtime.glowMarker.position = runtime.marker.position;

          if (triggered) {
            runtime.glow = 1;

            if (!muted && !runtime.muted) {
              playSound(runtime.id, runtime.sound, runtime.pitchSection);
            }
          }
        }

        if (!runtime.muted) {
          runtime.glow = Math.max(0, runtime.glow - event.delta * 1.8);
          runtime.glowMarker.opacity = runtime.glow * 0.8;
          runtime.glowMarker.shadowBlur = runtime.glow * 20;
        }
      }
    };

    return () => {
      scope.view.onFrame = null;
    };
  }, [play, muted, sekToEncircle, manageDialog]);
}
