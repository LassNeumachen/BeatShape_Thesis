import type {
  Dispatch,
  MutableRefObject,
  PointerEvent,
  SetStateAction,
} from "react";
import paper from "paper";
import type { BeatShape } from "../types/shapes";
import type { RuntimeShape } from "../types/runtime";
import { startAudio } from "../lib/audioEngine";
import { clamp } from "./useStageCamera";
import {
  getPitchAdjustedFillColor,
  getPitchSection,
} from "../lib/helper/PitchHelper";

export type InputPoint = {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
};

export type MouseState = "default" | "pointer" | "dragging";

type PanState = {
  active: boolean;
  moved: boolean;
  startClientX: number;
  startClientY: number;
  startCenterX: number;
  startCenterY: number;
};

type CameraState = {
  center: { x: number; y: number };
  zoom: number;
};

type UseStagePointerControlsParams = {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  paperScopeRef: MutableRefObject<paper.PaperScope | null>;
  runtimeShapesRef: MutableRefObject<RuntimeShape[]>;
  cameraRef: MutableRefObject<CameraState>;
  draggingShapeIdRef: MutableRefObject<string | null>;
  activePointerIdRef: MutableRefObject<number | null>;
  pointerStartInputRef: MutableRefObject<InputPoint | null>;
  dragOffsetRef: MutableRefObject<{ x: number; y: number }>;
  panRef: MutableRefObject<PanState>;
  wasDraggingRef: MutableRefObject<boolean>;
  movePitchHintMoveCountRef: MutableRefObject<number>;
  mouseStateRef: MutableRefObject<MouseState>;
  shapes: BeatShape[];
  setShapes: Dispatch<SetStateAction<BeatShape[]>>;
  pitchSections: number[];
  showMovePitchHint: boolean;
  worldWidth: number;
  worldHeight: number;
  onStageClick: ((x: number, y: number) => void) | undefined;
  setMouseState: (mouseState: MouseState) => void;
  setShowMovePitchHint: (showMovePitchHint: boolean) => void;
  setEditingShape: (shape: BeatShape | null) => void;
  setEditedShapePrevMutedState: (muted: boolean) => void;
  setCoordinates: (coordinates: { x: number; y: number }) => void;
  setManageDialog: (manageDialog: boolean) => void;
  setShapeMuted: (id: string, mute?: boolean) => void;
  beginDialogSync: () => void;
  syncRuntimeOffsetsToShapes: () => void;
  applyCamera: () => void;
  getCanvasViewPoint: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | null;
  isInsideWorld: (point: paper.Point) => boolean;
  editWasSavedRef: MutableRefObject<boolean>;
};

export function useStagePointerControls({
  canvasRef,
  paperScopeRef,
  runtimeShapesRef,
  cameraRef,
  draggingShapeIdRef,
  activePointerIdRef,
  pointerStartInputRef,
  dragOffsetRef,
  panRef,
  wasDraggingRef,
  movePitchHintMoveCountRef,
  mouseStateRef,
  shapes,
  setShapes,
  pitchSections,
  showMovePitchHint,
  worldWidth,
  worldHeight,
  onStageClick,
  setMouseState,
  setShowMovePitchHint,
  setEditingShape,
  setEditedShapePrevMutedState,
  setCoordinates,
  setManageDialog,
  setShapeMuted,
  beginDialogSync,
  syncRuntimeOffsetsToShapes,
  applyCamera,
  getCanvasViewPoint,
  isInsideWorld,
  editWasSavedRef,
}: UseStagePointerControlsParams) {
  function openShapeDialogAtInput(input: InputPoint) {
    if (!(input.target instanceof HTMLElement)) return;

    const target = input.target;

    if (
      target.tagName.toLowerCase() !== "canvas" ||
      target.id !== "MainCanvas"
    ) {
      return;
    }

    const scope = paperScopeRef.current;
    if (!scope || !canvasRef.current) return;

    const point = getCanvasPoint(input.clientX, input.clientY);
    if (!point || !isInsideWorld(point)) return;

    onStageClick?.(point.x, point.y);

    const hitResult = scope.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 8,
    });

    const hitShapeId = hitResult?.item?.data?.shapeId;

    beginDialogSync();
    syncRuntimeOffsetsToShapes();

    if (hitShapeId) {
      const foundShape =
        shapes.find((shape) => shape.id === hitShapeId) ?? null;
      setEditingShape(foundShape);

      if (foundShape) {
        editWasSavedRef.current = false;
        setEditedShapePrevMutedState(foundShape.muted);
        setShapeMuted(hitShapeId, true);
        setCoordinates({ x: foundShape.x, y: foundShape.y });
      }
    } else {
      editWasSavedRef.current = false;
      setEditingShape(null);
      setCoordinates({ x: point.x, y: point.y });
    }

    setManageDialog(true);
  }

  function handleInputMove(event: PointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current !== null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return;
    }

    const input = getInputPoint(event);
    event.preventDefault();

    if (panRef.current.active) {
      const dx = input.clientX - panRef.current.startClientX;
      const dy = input.clientY - panRef.current.startClientY;

      if (Math.hypot(dx, dy) > 3) {
        panRef.current.moved = true;
        wasDraggingRef.current = true;
      }

      cameraRef.current = {
        ...cameraRef.current,
        center: {
          x: panRef.current.startCenterX - dx / cameraRef.current.zoom,
          y: panRef.current.startCenterY - dy / cameraRef.current.zoom,
        },
      };
      applyCamera();
      return;
    }

    const point = getCanvasPoint(input.clientX, input.clientY);
    const draggingShapeId = draggingShapeIdRef.current;

    if (point && paperScopeRef.current && !draggingShapeId) {
      const hitResult = paperScopeRef.current.project.hitTest(point, {
        fill: true,
        stroke: true,
        tolerance: 8,
      });
      const hitShapeId = hitResult?.item?.data?.shapeId;
      updateMouseState(hitShapeId ? "pointer" : "default");
    }
    if (!point) return;

    if (!draggingShapeId) return;
    wasDraggingRef.current = true;

    const runtime = runtimeShapesRef.current.find(
      (item) => item.id === draggingShapeId,
    );
    if (!runtime) return;

    const nextPosition = new paper.Point(
      clamp(point.x + dragOffsetRef.current.x, 0, worldWidth),
      clamp(point.y + dragOffsetRef.current.y, 0, worldHeight),
    );
    runtime.path.position = nextPosition;
    runtime.pitchSection = getPitchSection(nextPosition.y, pitchSections);
    runtime.path.fillColor = getPitchAdjustedFillColor(
      runtime.fillColor,
      runtime.pitchSection,
    ) as never;
    runtime.marker.position =
      runtime.path.getPointAt(runtime.offset) ?? runtime.path.position;

    if (runtime.label) {
      runtime.label.position = runtime.path.position;
    }
  }

  function getCanvasPoint(clientX: number, clientY: number) {
    if (!canvasRef.current || !paperScopeRef.current) return null;

    const viewPoint = getCanvasViewPoint(clientX, clientY);
    if (!viewPoint) return null;

    return paperScopeRef.current.view.viewToProject(
      new paperScopeRef.current.Point(viewPoint.x, viewPoint.y),
    );
  }

  function getInputPoint(event: PointerEvent<HTMLDivElement>): InputPoint {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.target,
    };
  }

  function handleInputDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    void startAudio();

    const input = getInputPoint(event);
    if (!(input.target instanceof HTMLElement)) return;

    wasDraggingRef.current = false;
    const target = input.target;

    if (
      target.tagName.toLowerCase() !== "canvas" ||
      target.id !== "MainCanvas"
    ) {
      return;
    }

    const scope = paperScopeRef.current;
    if (!scope) return;

    const point = getCanvasPoint(input.clientX, input.clientY);
    if (!point) return;

    activePointerIdRef.current = event.pointerId;
    pointerStartInputRef.current = input;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();

    const hitResult = scope.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 8,
    });

    const hitShapeId = hitResult?.item?.data?.shapeId;

    if (!hitShapeId) {
      panRef.current = {
        active: true,
        moved: false,
        startClientX: input.clientX,
        startClientY: input.clientY,
        startCenterX: cameraRef.current.center.x,
        startCenterY: cameraRef.current.center.y,
      };
      draggingShapeIdRef.current = null;
      updateMouseState("dragging");
      return;
    }

    const runtime = runtimeShapesRef.current.find(
      (item) => item.id === hitShapeId,
    );
    if (!runtime) {
      releaseActivePointer(event);
      return;
    }

    draggingShapeIdRef.current = hitShapeId;
    updateMouseState("dragging");
    dragOffsetRef.current = {
      x: runtime.path.position.x - point.x,
      y: runtime.path.position.y - point.y,
    };
  }

  function handleInputUp(event: PointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current !== null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return;
    }

    const input = getInputPoint(event);
    const tapInput = pointerStartInputRef.current
      ? {
          ...input,
          target: pointerStartInputRef.current.target,
        }
      : input;
    releaseActivePointer(event);

    if (panRef.current.active) {
      const moved = panRef.current.moved;
      panRef.current = {
        ...panRef.current,
        active: false,
        moved: false,
      };
      updateMouseState("default");

      if (moved) {
        wasDraggingRef.current = true;
      }

      const draggingShapeId = draggingShapeIdRef.current;

      if (!draggingShapeId) {
        if (!moved) {
          openShapeDialogAtInput(tapInput);
        }
        return;
      }
    }

    const draggingShapeId = draggingShapeIdRef.current;
    if (!draggingShapeId) return;

    const runtime = runtimeShapesRef.current.find(
      (item) => item.id === draggingShapeId,
    );
    if (!runtime) {
      draggingShapeIdRef.current = null;
      updateMouseState("pointer");
      return;
    }

    const draggedShape = shapes.find((shape) => shape.id === draggingShapeId);
    const shapeWasMoved =
      wasDraggingRef.current &&
      (!draggedShape ||
        Math.hypot(
          runtime.path.position.x - draggedShape.x,
          runtime.path.position.y - draggedShape.y,
        ) > 1);

    if (shapeWasMoved) {
      registerMovePitchHintMove();
    }

    if (shapeWasMoved) {
      setShapes((prev) =>
        prev.map((shape) => {
          if (shape.id !== draggingShapeId) return shape;

          if (shape.type === "custom") {
            return {
              ...shape,
              x: runtime.path.position.x,
              y: runtime.path.position.y,
              pathData: {
                ...shape.pathData,
                start: [
                  shape.pathData.start[0] + runtime.path.position.x - shape.x,
                  shape.pathData.start[1] + runtime.path.position.y - shape.y,
                ],
                segments: shape.pathData.segments.map((segment) =>
                  segment.kind === "line"
                    ? {
                        ...segment,
                        to: [
                          segment.to[0] + runtime.path.position.x - shape.x,
                          segment.to[1] + runtime.path.position.y - shape.y,
                        ],
                      }
                    : {
                        ...segment,
                        to: [
                          segment.to[0] + runtime.path.position.x - shape.x,
                          segment.to[1] + runtime.path.position.y - shape.y,
                        ],
                        through: [
                          segment.through[0] +
                            runtime.path.position.x -
                            shape.x,
                          segment.through[1] +
                            runtime.path.position.y -
                            shape.y,
                        ],
                      },
                ),
              },
            };
          }

          return {
            ...shape,
            x: runtime.path.position.x,
            y: runtime.path.position.y,
          };
        }),
      );
    }

    draggingShapeIdRef.current = null;
    updateMouseState("pointer");

    if (!shapeWasMoved) {
      openShapeDialogAtInput(tapInput);
    }
  }

  function handleInputCancel(event: PointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current !== null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return;
    }

    releaseActivePointer(event);
    panRef.current = {
      ...panRef.current,
      active: false,
      moved: false,
    };
    draggingShapeIdRef.current = null;
    updateMouseState("default");
  }

  function releaseActivePointer(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerIdRef.current = null;
    pointerStartInputRef.current = null;
  }

  function registerMovePitchHintMove() {
    if (!showMovePitchHint) return;

    movePitchHintMoveCountRef.current += 1;

    if (movePitchHintMoveCountRef.current >= 3) {
      setShowMovePitchHint(false);
    }
  }

  function updateMouseState(nextState: MouseState) {
    if (mouseStateRef.current === nextState) return;

    mouseStateRef.current = nextState;
    setMouseState(nextState);
  }

  return {
    handleInputDown,
    handleInputUp,
    handleInputCancel,
    handleInputMove,
  };
}
