import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import paper from "paper";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type {
  ActiveBeats,
  CustomPathData,
  ShapeKey,
} from "../../../types/shapes";
import type { Sound } from "../../../types/sounds";
import { appColors } from "../../../theme";
import {
  buildPaperPath,
  buildTippedCirclePath,
  transformPathData,
} from "../../../lib/helper/paperPath";
import { checkTriggerCrossing } from "../../../lib/helper/TriggerHelper";
import { playSound, prepareSound } from "../../../lib/audioEngine";
import ToggleIconButton from "../../buttons/ToggleIconButton";
import BeatlineWithNotes from "../../BeatlineWithNotes";
import type { BeatlineNotePlacement } from "../../BeatlineWithNotes";
import BeatSelectionComponent from "../../BeatSelectionComponent";
import SliderComponent from "../../SliderComponent";
import BeatshapeTooltip from "../../BeatshapeTooltip";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";

type PreviewRuntimeShape = {
  path: paper.Path;
  glowMarker: paper.Path.Circle;
  marker: paper.Path.Circle;
  offset: number;
  startOffset: number;
  loopDuration: number;
  triggerOffsets: number[];
  sound: Sound;
  glow: number;
};

type PreviewComponentProps = {
  open: boolean;
  selectedShape: ShapeKey;
  volume: number;
  rotation: number;
  color: string;
  sound: Sound;
  activeBeats: ActiveBeats;
  bpm: number;
  previewStartPoint: number;
  syncStartAt: number | null;
  play: boolean;
  newShape: boolean;
  onPreviewReady: () => void;
  onStartStop: () => void;
  onColorChange: (color: string) => void;
  onActiveBeatsChange: (activeBeats: ActiveBeats) => void;
  onVolumeChange: (volume: number) => void;
  onSetRotation: (rotation: number) => void;
  onNewShapeHandled: () => void;
  onBeatlineChange: (
    rotatedValues: number[],
    notePlacements: BeatlineNotePlacement[] | undefined,
  ) => void;
  pitchsection: number;
};

const colors = [
  appColors.orange,
  appColors.red,
  appColors.purple,
  appColors.lightBlue,
  appColors.yellow,
  appColors.green,
];

const drawableNoteValues = [
  1,
  7 / 8,
  3 / 4,
  1 / 2,
  7 / 16,
  3 / 8,
  1 / 4,
  7 / 32,
  3 / 16,
  1 / 8,
  3 / 32,
  1 / 16,
  1 / 32,
];

export default function PreviewComponent(props: PreviewComponentProps) {
  const previewCanvas = useRef<HTMLCanvasElement | null>(null);
  const [previewCanvasReady, setPreviewCanvasReady] = useState(false);
  const previewScopeRef = useRef<paper.PaperScope | null>(null);
  const previewRuntimeRef = useRef<PreviewRuntimeShape | null>(null);
  const previewAnimationFrameRef = useRef<number | null>(null);
  const previousPreviewFrameTimeRef = useRef<number | null>(null);
  const syncStartAtRef = useRef<number | null>(props.syncStartAt);
  const onPreviewReadyRef = useRef(props.onPreviewReady);
  const rotatedBeatline = useMemo(
    () => rotateBeatValuesByRotation(props.selectedShape.value, props.rotation),
    [props.selectedShape.value, props.rotation],
  );
  const setPreviewCanvasRef = useCallback(
    (element: HTMLCanvasElement | null) => {
      previewCanvas.current = element;
      setPreviewCanvasReady(element !== null);
    },
    [],
  );

  useEffect(() => {
    syncStartAtRef.current = props.syncStartAt;
  }, [props.syncStartAt]);

  useEffect(() => {
    onPreviewReadyRef.current = props.onPreviewReady;
  }, [props.onPreviewReady]);

  useEffect(() => {
    props.onBeatlineChange(
      rotatedBeatline.values,
      props.rotation !== 0 && !rotatedBeatline.cleanCut
        ? rotatedBeatline.placements
        : undefined,
    );
  }, [props.rotation, rotatedBeatline, props.onBeatlineChange]);

  function stopPreviewLoop() {
    if (previewAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(previewAnimationFrameRef.current);
      previewAnimationFrameRef.current = null;
    }

    previousPreviewFrameTimeRef.current = null;
  }

  useEffect(() => {
    if (props.open) return;

    stopPreviewLoop();

    if (previewScopeRef.current) {
      previewScopeRef.current.view.onFrame = null;
      previewScopeRef.current.project.clear();
      previewScopeRef.current = null;
    }

    previewRuntimeRef.current = null;
  }, [props.open]);

  useEffect(() => {
    return () => {
      stopPreviewLoop();

      if (previewScopeRef.current) {
        previewScopeRef.current.view.onFrame = null;
        previewScopeRef.current.project.clear();
        previewScopeRef.current = null;
      }

      previewRuntimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!props.open || !previewCanvasReady) return;
    stopPreviewLoop();

    const canvas = previewCanvas.current;
    if (!canvas) return;

    let scope = previewScopeRef.current;
    if (!scope) {
      scope = new paper.PaperScope();
      scope.setup(canvas);
      previewScopeRef.current = scope;
    }

    if (!props.play && !props.newShape) {
      scope.view.onFrame = null;
      return;
    }

    scope.activate();
    scope.project.clear();

    const center = scope.view.center;
    const size = props.volume * 2.5 + 90;
    let path: paper.Path;
    let customPathData: CustomPathData | null = null;

    if (props.selectedShape.type === "polygon") {
      path = new scope.Path.RegularPolygon({
        center,
        sides: props.selectedShape.corners,
        radius: size,
        fillColor: props.color,
      });
    } else if (props.selectedShape.type === "custom") {
      const scale = size / props.selectedShape.pathData.baseRadius;
      customPathData = transformPathData(
        props.selectedShape.pathData,
        scale,
        center.x,
        center.y,
      );

      path = buildPaperPath(scope, customPathData, props.color);
    } else {
      path = buildTippedCirclePath(scope, center, size, props.color);
    }

    const triggerOffsets =
      props.selectedShape.type === "circle"
        ? [0]
        : props.selectedShape.type === "custom"
          ? customPathData === null
            ? []
            : getCustomTriggerPointsOnPath(scope, customPathData, path)
                .map((point) => path.getOffsetOf(point))
                .filter((offset): offset is number => offset !== null)
          : path.segments
              .map((segment) => path.getOffsetOf(segment.point))
              .filter((offset): offset is number => offset !== null);

    path.rotation = props.rotation;

    const phaseOffset = (props.rotation / 360) * path.length;
    const startOffset =
      (props.previewStartPoint * path.length + phaseOffset) % path.length;

    const marker = new scope.Path.Circle({
      center: path.getPointAt(startOffset) ?? path.position,
      radius: 15,
      fillColor: appColors.black,
    });

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

    previewRuntimeRef.current = {
      path,
      glowMarker,
      marker,
      offset: startOffset,
      startOffset,
      loopDuration: props.bpm,
      triggerOffsets,
      sound: {
        ...props.sound,
        volume: props.volume,
      },
      glow: 0,
    };

    scope.view.onFrame = null;

    function runPreviewFrame(now: number) {
      const runtime = previewRuntimeRef.current;
      if (!runtime) return;

      const previousFrameTime = previousPreviewFrameTimeRef.current ?? now;
      const delta = (now - previousFrameTime) / 1000;
      previousPreviewFrameTimeRef.current = now;

      const startAt = syncStartAtRef.current;
      if (startAt === null) {
        previewAnimationFrameRef.current =
          window.requestAnimationFrame(runPreviewFrame);
        return;
      }

      const elapsedSeconds = (now - startAt) / 1000;
      if (elapsedSeconds < 0) {
        previewAnimationFrameRef.current =
          window.requestAnimationFrame(runPreviewFrame);
        return;
      }

      const oldOffset = runtime.offset;
      const newOffset =
        (runtime.startOffset +
          (runtime.path.length * elapsedSeconds) / runtime.loopDuration) %
        runtime.path.length;

      const triggered = checkTriggerCrossing(
        runtime.triggerOffsets,
        oldOffset,
        newOffset,
        runtime.path.length,
      );

      runtime.offset = newOffset;

      if (props.newShape && !props.play) {
        props.onNewShapeHandled();
        return;
      }

      runtime.marker.position =
        runtime.path.getPointAt(runtime.offset) ?? runtime.path.position;
      runtime.glowMarker.position = runtime.marker.position;

      if (triggered) {
        runtime.glow = 1;
        playSound("preview-shape", runtime.sound, props.pitchsection);
      }

      runtime.glow = Math.max(0, runtime.glow - delta * 1.8);
      runtime.glowMarker.opacity = runtime.glow * 0.8;
      runtime.glowMarker.shadowBlur = runtime.glow * 20;

      previewAnimationFrameRef.current =
        window.requestAnimationFrame(runPreviewFrame);
    }

    previewAnimationFrameRef.current =
      window.requestAnimationFrame(runPreviewFrame);

    prepareSound("preview-shape", props.sound.soundType);
    onPreviewReadyRef.current();

    return () => {
      stopPreviewLoop();
    };
  }, [
    props.open,
    props.play,
    props.newShape,
    previewCanvasReady,
    props.selectedShape,
    props.volume,
    props.rotation,
    props.color,
    props.sound,
    props.bpm,
    props.previewStartPoint,
    props.onNewShapeHandled,
  ]);
  function rotateAfterIndex(arr: number[], index: number): number[] {
    return [...arr.slice(index + 1), ...arr.slice(0, index + 1)];
  }

  function rotateBeatValuesByRotation(values: number[], rotation: number) {
    if (values.length === 0) {
      return { values, cleanCut: true };
    }

    const normalizedRotation = rotation / 360;
    const offset =
      normalizedRotation < 0 ? normalizedRotation + 1 : normalizedRotation;
    if (offset === 0 || offset === 1) {
      return { values, cleanCut: true };
    }

    let coveredValue = 0;

    for (let index = 0; index < values.length; index++) {
      const value = values[index]!;
      const nextCoveredValue = coveredValue + value;

      if (Math.abs(nextCoveredValue - offset) < 0) {
        return {
          values: [...values.slice(index + 1), ...values.slice(0, index + 1)],
          cleanCut: true,
        };
      }

      if (nextCoveredValue > offset) {
        const consumedPart = offset - coveredValue;
        const remainingPart = nextCoveredValue - offset;
        const rotatedValues = [
          remainingPart,
          ...values.slice(index + 1),
          ...values.slice(0, index),
          consumedPart,
        ].filter((value) => value > 0);
        const placements = getSyncopatedPlacements(
          rotatedValues,
          consumedPart,
          remainingPart,
        );

        return {
          values: rotatedValues,
          cleanCut: false,
          placements,
        };
      }

      if (nextCoveredValue === offset) {
        return {
          values: rotateAfterIndex(values, index),
          cleanCut: true,
        };
      }
      coveredValue = nextCoveredValue;
    }
    return { values, cleanCut: true };
  }

  function getSyncopatedPlacements(
    values: number[],
    consumedPart: number,
    remainingPart: number,
  ): BeatlineNotePlacement[] {
    let slotProgress = 0;
    const placements = values.map((value, index) => {
      const placement: BeatlineNotePlacement = {
        value,
        slot: slotProgress,
      };

      if (index === 0) {
        placement.tie = "fromPrevious";
      }

      if (index === values.length - 1) {
        placement.tie = "toNext";
      }

      slotProgress += value * 32;
      return placement;
    });

    const rawPlacements: BeatlineNotePlacement[] = [
      {
        value: consumedPart,
        slot: -5,
        tie: "toNext" as const,
      },
      ...placements,
      {
        value: remainingPart,
        slot: 34,
        tie: "fromPrevious" as const,
      },
    ].filter((placement) => placement.value > 0);

    return rawPlacements.flatMap(expandPlacementToDrawableNotes);
  }

  function expandPlacementToDrawableNotes(
    placement: BeatlineNotePlacement,
  ): BeatlineNotePlacement[] {
    const parts = splitIntoDrawableNotes(placement.value);
    let slot = placement.slot;
    let visualSlot = placement.visualSlot ?? placement.slot;
    const visualPartSpacing = 2;

    return parts.map((part, index) => {
      const isFirst = index === 0;
      const shouldCarryIncomingTie =
        placement.tie === "fromPrevious" && isFirst;
      const shouldCarryOutgoingTie = placement.tie === "toNext" && isFirst;
      const nextPlacement: BeatlineNotePlacement = {
        value: part,
        slot,
        visualSlot,
      };

      if (parts.length > 1) {
        nextPlacement.isSplitPart = true;
        nextPlacement.splitPartIndex = index;
        nextPlacement.splitPartCount = parts.length;
      }

      if (shouldCarryIncomingTie) {
        nextPlacement.tie = "fromPrevious";
      }

      if (shouldCarryOutgoingTie) {
        nextPlacement.tie = "toNext";
      }

      slot += part * 32;
      visualSlot += visualPartSpacing;
      return nextPlacement;
    });
  }

  function splitIntoDrawableNotes(value: number): number[] {
    const tolerance = 0.000001;
    const result: number[] = [];
    let rest = value;

    for (const noteValue of drawableNoteValues) {
      while (rest + tolerance >= noteValue) {
        result.push(noteValue);
        rest -= noteValue;
      }
    }

    if (Math.abs(rest) > tolerance || result.length === 0) {
      return [value];
    }
    return result;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: 0,
        minWidth: 363,
        scrollbarWidth: "thin",
        scrollbarColor: `${appColors.black} transparent`,

        "&::-webkit-scrollbar": {
          height: 8,
        },

        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },

        "&::-webkit-scrollbar-thumb": {
          backgroundColor: appColors.black,
          borderRadius: 0,
        },

        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#333",
        },
      }}
    >
      <Typography variant="h5">Vorschau</Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 1,
          pb: 8,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          scrollbarWidth: "thin",
          scrollbarColor: `${appColors.black} transparent`,
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: appColors.black,
            borderRadius: 0,
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#333" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            border: `4px solid ${appColors.black}`,
            minWidth: 345,
          }}
        >
          <Box sx={{ position: "relative", width: 300, height: 300 }}>
            <canvas
              ref={setPreviewCanvasRef}
              height={300}
              width={300}
              style={{ display: "block" }}
            />
            <Box sx={{ position: "absolute", top: 8, left: -10, zIndex: 2 }}>
              <ToggleIconButton
                setRunning={props.onStartStop}
                running={props.play}
                size={30}
                iconOne={PauseIcon}
                iconTwo={PlayArrowIcon}
              />
            </Box>
          </Box>
        </Box>
        <Box>
          <BeatlineWithNotes
            beatValues={props.selectedShape.value}
            height={84}
            showProgress={false}
            showPlayhead
            playheadRunning={props.play}
            playheadLoopDuration={props.bpm}
            playheadSyncStartAt={props.syncStartAt}
            playheadColor={props.color}
            useRotatedValues={props.rotation !== 0}
            rotatedValues={rotatedBeatline.values}
            useDefaultBeatline={
              props.rotation === 0 || rotatedBeatline.cleanCut
            }
            notePlacements={
              props.rotation !== 0 && !rotatedBeatline.cleanCut
                ? rotatedBeatline.placements
                : undefined
            }
            color={props.color}
            tieBowTolltip={props.rotation !== 0 && !rotatedBeatline.cleanCut}
          />
        </Box>

        <Typography variant="h5">Größe / Lautstärke</Typography>
        <Box sx={{ pl: 2 }}>
          <SliderComponent
            value={props.volume}
            min={-20}
            max={20}
            valueLabelDisplay="off"
            color={props.color}
            marks={[]}
            setValue={props.onVolumeChange}
          />
        </Box>
        <Typography variant="h5">Verschiebung</Typography>
        <Box sx={{ pl: 2 }}>
          <SliderComponent
            value={props.rotation}
            min={-180}
            max={180}
            valueLabelDisplay={"auto"}
            color={props.color}
            marks={[
              { value: -180, label: "-1/4" },
              { value: -135, label: "-1/4" },
              { value: -90, label: "-1/4" },
              { value: -45, label: "-1/8" },
              { value: 0, label: "0" },
              { value: 45, label: "-1/8" },
              { value: 90, label: "1/4" },
              { value: 135, label: "1/4" },
              { value: 180, label: "1/2" },
            ]}
            setValue={props.onSetRotation}
            step={22.5}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="h5">
            Für welche Takte soll die Form aktiv sein?
          </Typography>
          <BeatshapeTooltip
            title="Aktive Takte"
            description1={
              "In BeatShape werden immer vier Takte nacheinander abgespielt und anschließend wiederholt.\n\nHier legst du fest, in welchen dieser vier Takte die Form aktiv ist. Ist ein Takt abgewählt, bleibt die Beatshape in diesem Durchlauf stumm.\n\nSo können Wiederholungen aufegbrochen und kleine Variationen im Rhythmus erzeugt werden."
            }
            placement="top"
          >
            <HelpCenterIcon
              sx={{
                borderRadius: 0.95,
                backgroundColor: appColors.black,
                color: props.color,
                fontSize: 20,
                cursor: "help",
                mb: 0.5,
              }}
            />
          </BeatshapeTooltip>
        </Box>

        <BeatSelectionComponent
          color={props.color}
          value={props.activeBeats}
          onChange={props.onActiveBeatsChange}
          lightColor
        />

        <Typography variant="h5"> Farbe Auswählen</Typography>

        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
          {colors.map((colorOption) => (
            <Box
              key={colorOption}
              onClick={() => props.onColorChange(colorOption)}
              sx={{
                flex: 1,
                height: 30,
                backgroundColor: colorOption,
                cursor: "pointer",
                border:
                  props.color === colorOption
                    ? `4px solid ${appColors.black}`
                    : "4px solid transparent",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function getCustomTriggerPointsOnPath(
  scope: paper.PaperScope,
  pathData: CustomPathData,
  path: paper.Path,
) {
  return [
    pathData.start,
    ...pathData.segments.map((segment) => segment.to),
  ].map(([x, y]) => {
    return new scope.Point(path.position.x * 2 - x, path.position.y * 2 - y);
  });
}
