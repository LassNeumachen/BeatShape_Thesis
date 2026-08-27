import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import CreateShapeDialog from "../components/Dialogs/CreateShapeDialog";
import { type ActiveBeats, type BeatShape } from "../types/shapes";
import { createShape, type CreateShapeInput } from "../lib/shapeFactory";
import paper from "paper";
import {
  pentatonicTranslation,
  prepareSound,
  setMasterVolume,
  startAudio,
  waitForAudioLoaded,
} from "../lib/audioEngine";
import { appColors } from "../theme";
import ConfirmDialog from "../components/Dialogs/ConfirmDialog";
import StageCanvasComponent from "../components/StageComponents/StageCanvasComponent";
import StageEmptyHintComponent from "../components/StageComponents/StageEmptyHintComponent";
import StageHeaderComponent from "../components/StageComponents/StageHeaderComponent";
import StageRightPanelComponent from "../components/StageComponents/panels/StageRightPanelComponent";
import { alpha } from "@mui/material/styles";
import MoveShapesToPitchHintComponent from "../components/StageComponents/MoveShapesToPitchHintComponent";
import { useStageCamera } from "../hooks/useStageCamera";
import {
  ImportExportHelper,
  createBeatShapeProjectState,
  type BeatShapeProjectState,
} from "../lib/helper/ImportExportHelper";
import { getPitchSection } from "../lib/helper/PitchHelper";
import MinimapComponent from "../components/StageComponents/MinimapComponent";
import CopySnackbar from "../components/snackbar/CopySnackbar";
import { useShapeLibraryStore } from "../stores/shapeLibaryStore";
import { beatShapeToShapeKey } from "../lib/helper/shapeKeyMapper";
import type { MetronomeRuntime } from "../types/runtime";
import { setupMetronomeRuntime as createMetronomeRuntime } from "../lib/services/MetronomeService";
import { useStagePlayback } from "../hooks/useStagePlayback";
import { useStageShapes } from "../hooks/useStageShapes";
import {
  type InputPoint,
  type MouseState,
  useStagePointerControls,
} from "../hooks/useStagePointerControls";
type StageProps = {
  onStageClick?: (x: number, y: number) => void;
};

const STAGE_WORLD_WIDTH = 3520;
const STAGE_WORLD_HEIGHT = 1080;
const STAGE_BORDER_WIDTH = 10;
const MAX_CAMERA_ZOOM = 2.5;

export default function Stage({ onStageClick }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paperScopeRef = useRef<paper.PaperScope | null>(null);
  const {
    cameraRef,
    viewportSize,
    applyCamera,
    resetCameraToFitHeight,
    getCanvasViewPoint,
    isInsideWorld,
    getVisibleWorldRect,
    zoomIn,
    zoomOut,
  } = useStageCamera({
    canvasRef,
    paperScopeRef,
    worldWidth: STAGE_WORLD_WIDTH,
    worldHeight: STAGE_WORLD_HEIGHT,
    maxZoom: MAX_CAMERA_ZOOM,
  });

  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mouseState, setMouseState] = useState<MouseState>("default");
  const mouseStateRef = useRef<MouseState>("default");
  const [manageDialog, setManageDialog] = useState(false);
  const [dialogSyncStartAt, setDialogSyncStartAt] = useState<number | null>(
    null,
  );
  const dialogSyncStartAtRef = useRef<number | null>(null);
  const dialogSyncGenerationRef = useRef(0);
  const dialogWasInitiallySyncedRef = useRef(false);

  const [beatNumber, setBeatNumber] = useState(0);
  const [beatProgress, setBeatProgress] = useState<ActiveBeats>([
    true,
    false,
    false,
    false,
  ]);
  const beatNumberRef = useRef(0);
  const [shapes, setShapes] = useState<BeatShape[]>([]);
  const metronomeRuntimeRef = useRef<MetronomeRuntime | null>(null);
  const stageBackgroundRef = useRef<paper.Group | null>(null);
  const [bpm, setBpm] = useState<number>(120);
  const [sekToEncircle, setSekToEncircle] = useState<number>(2);
  const [play, setPlay] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const [shapePanelOpen, setShapePanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);
  const [importExportPanelOpen, setImportExportPanelOpen] = useState(false);
  const [expandedShapeId, setExpandedShapeId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deleteDialogColor, setDeleteDialogColor] = useState<string>(
    appColors.black,
  );
  const [shapeToDeleteId, setShapeToDeleteId] = useState<string | null>(null);

  const [editingShape, setEditingShape] = useState<BeatShape | null>(null);
  const [editedShapePrevMutedState, setEditedShapePrevMutedState] =
    useState<boolean>(false);
  const editWasSavedRef = useRef(false);
  const draggingShapeIdRef = useRef<string | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerStartInputRef = useRef<InputPoint | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{
    active: boolean;
    moved: boolean;
    startClientX: number;
    startClientY: number;
    startCenterX: number;
    startCenterY: number;
  }>({
    active: false,
    moved: false,
    startClientX: 0,
    startClientY: 0,
    startCenterX: STAGE_WORLD_WIDTH / 2,
    startCenterY: STAGE_WORLD_HEIGHT / 2,
  });
  const wasDraggingRef = useRef(false);
  const movePitchHintMoveCountRef = useRef(0);
  const [showMovePitchHint, setShowMovePitchHint] = useState(true);

  const activeBeatRef = useRef(0);
  const [activeBeat, setActiveBeat] = useState(0);
  const [showPitchlines, setShowPitchlines] = useState(true);

  const [pitchSections, setPitchSections] = useState<number[]>([]);
  const [openCopySnackbar, setOpenCopySnackbar] = useState(false);
  const [openImportCodeDialog, setOpenImportCodeDialog] = useState(false);
  const addShapeOption = useShapeLibraryStore((state) => state.addShapeOption);

  const {
    runtimeShapesRef,
    resetAllRuntimeShapes,
    syncRuntimeOffsetsToShapes,
  } = useStageShapes({
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
  });

  const { handleInputDown, handleInputUp, handleInputCancel, handleInputMove } =
    useStagePointerControls({
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
      worldWidth: STAGE_WORLD_WIDTH,
      worldHeight: STAGE_WORLD_HEIGHT,
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
    });

  useStagePlayback({
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
  });

  useEffect(() => {
    return () => {
      dialogSyncGenerationRef.current += 1;
    };
  }, []);

  useEffect(() => {
    try {
      const project = ImportExportHelper.readFromCurrentUrl();
      if (!project) return;

      applyImportedProject(project);
    } catch (error) {
      console.error("BeatShape-Link konnte nicht importiert werden:", error);
    }
  }, []);

  useEffect(() => {
    setMasterVolume(volume);
    setMuted(volume === 0);
  }, [volume]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scope = new paper.PaperScope();
    scope.setup(canvasRef.current);
    paperScopeRef.current = scope;

    renderStageBackground(scope);
    setupMetronomeRuntime(scope);
    resetCameraToFitHeight();

    return () => {
      scope.project.clear();
      metronomeRuntimeRef.current = null;
      stageBackgroundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    calculatePitchSections(STAGE_WORLD_HEIGHT);
  }, []);

  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope) return;

    renderStageBackground(scope);
  }, [showPitchlines, pitchSections]);

  function calculatePitchSections(heigth: number) {
    let newPitchSections: number[] = [];
    for (let i = 1; i > 0; i -= 1 / 11) {
      newPitchSections.push(heigth * i);
    }
    setPitchSections(newPitchSections);
  }

  function setupMetronomeRuntime(scope: paper.PaperScope) {
    metronomeRuntimeRef.current = createMetronomeRuntime(scope);
  }

  function renderStageBackground(scope: paper.PaperScope) {
    stageBackgroundRef.current?.remove();

    const backgroundGroup = new scope.Group();
    const background = new scope.Path.Rectangle({
      point: [0, 0],
      size: [STAGE_WORLD_WIDTH, STAGE_WORLD_HEIGHT],
      fillColor: new scope.Color(appColors.background),
      strokeColor: new scope.Color(alpha(appColors.black, 0.5)),
      strokeWidth: STAGE_BORDER_WIDTH,
    });

    background.data.stageBackground = true;
    backgroundGroup.addChild(background);

    if (showPitchlines) {
      const labelColor = new scope.Color(appColors.black);
      const topLabel = new scope.PointText({
        point: new scope.Point(24, 28),
        content: "+12",
        fillColor: labelColor,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        fontWeight: "400",
      });
      backgroundGroup.addChild(topLabel);

      pitchSections.forEach((section, index) => {
        const lineColor = new scope.Color(appColors.black);
        lineColor.alpha = 0.1;

        const line = new scope.Path.Line({
          from: [0, section],
          to: [STAGE_WORLD_WIDTH, section],
          strokeColor: lineColor,
          strokeWidth: 1,
        });
        backgroundGroup.addChild(line);

        const semitoneShift = pentatonicTranslation[index - 1];
        if (semitoneShift === undefined) return;

        const label = new scope.PointText({
          point: new scope.Point(24, section + 24),
          content: `${semitoneShift > 0 ? "+" : ""}${semitoneShift}`,
          fillColor: labelColor,
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          fontWeight: "400",
        });
        backgroundGroup.addChild(label);
      });
    }

    backgroundGroup.data.stageBackground = true;
    backgroundGroup.sendToBack();
    stageBackgroundRef.current = backgroundGroup;
  }

  function selectBeatNumber(index: number) {
    beatNumberRef.current = index;
    setBeatNumber(index);

    const nextProgress: ActiveBeats = [false, false, false, false];
    nextProgress[index] = true;
    setBeatProgress(nextProgress);
  }

  function beginDialogSync() {
    dialogWasInitiallySyncedRef.current = false;
    dialogSyncGenerationRef.current += 1;
    dialogSyncStartAtRef.current = null;
    setDialogSyncStartAt(null);
    resetAllRuntimeShapes();
  }

  function handlePreviewReady() {
    const generation = ++dialogSyncGenerationRef.current;

    dialogSyncStartAtRef.current = null;
    setDialogSyncStartAt(null);
    resetAllRuntimeShapes();

    if (dialogWasInitiallySyncedRef.current) {
      const startAt = performance.now() + 50;
      dialogSyncStartAtRef.current = startAt;
      setDialogSyncStartAt(startAt);
      return;
    }
    for (const shape of shapes) {
      prepareSound(shape.id, shape.sound.soundType);
    }

    void Promise.all([
      waitForAudioLoaded(),
      new Promise<void>((done) => window.setTimeout(done, 50)),
    ])
      .catch((error) => {
        console.error("Audiodatei konnte nicht geladen werden:", error);
      })
      .finally(() => {
        if (generation !== dialogSyncGenerationRef.current) return;

        dialogWasInitiallySyncedRef.current = true;

        const startAt = performance.now() + 50;

        resetAllRuntimeShapes();
        dialogSyncStartAtRef.current = startAt;
        setDialogSyncStartAt(startAt);
      });
  }

  function handleCloseDialog() {
    dialogWasInitiallySyncedRef.current = false;

    dialogSyncGenerationRef.current += 1;
    dialogSyncStartAtRef.current = null;
    setDialogSyncStartAt(null);
    setManageDialog(false);
    if (editingShape && !editWasSavedRef.current) {
      setShapeMuted(editingShape.id, editedShapePrevMutedState);
    }
    editWasSavedRef.current = false;
    setEditedShapePrevMutedState(false);
    setEditingShape(null);
  }

  function onStartStop() {
    void startAudio();
    setPlay((prev) => !prev);
  }

  function setNewSpeed(speed: number) {
    setBpm(speed);
    setSekToEncircle((60 / speed) * 4);
  }

  function getProjectState(): BeatShapeProjectState {
    return createBeatShapeProjectState({
      shapes,
      bpm,
    });
  }

  function applyImportedProject(project: BeatShapeProjectState) {
    project.shapes.forEach((shape) => {
      addShapeOption(beatShapeToShapeKey(shape));
    });
    setShapes(project.shapes);
    setBpm(project.bpm);
    setSekToEncircle((60 / project.bpm) * 4);
    resetAllRuntimeShapes();
  }

  async function copyText(text: string) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }
    window.prompt("Kopieren:", text);
  }

  function exportBeatCode() {
    const code = ImportExportHelper.encode(getProjectState());
    setOpenCopySnackbar(true);
    void copyText(code);
  }

  function exportBeatLink() {
    const url = ImportExportHelper.createShareUrl(getProjectState());
    window.history.replaceState(null, "", url);
    setOpenCopySnackbar(true);
    void copyText(url);
  }

  function importBeatCode(code: string) {
    if (!code) return;
    try {
      applyImportedProject(ImportExportHelper.decode(code));
      setOpenImportCodeDialog(false);
      setShowMovePitchHint(false);
    } catch (error) {
      console.error("BeatShape-Code konnte nicht importiert werden:", error);
      window.alert("Der BeatShape-Code konnte nicht importiert werden.");
    }
  }

  function deleteShape(id: string) {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));

    if (expandedShapeId === id) {
      setExpandedShapeId(null);
    }

    if (editingShape?.id === id) {
      setEditingShape(null);
      setManageDialog(false);
    }
  }

  function changeVolume(value: number) {
    setVolume(value);
  }

  function setPaused(id: string) {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === id ? { ...shape, paused: !shape.paused } : shape,
      ),
    );
  }

  function setVisibility(id: string) {
    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id !== id) return shape;

        const nextVisable = !shape.visable;

        return {
          ...shape,
          visable: nextVisable,
          muted: nextVisable ? shape.muted : true,
        };
      }),
    );
  }

  function setShapeMuted(id: string, mute?: boolean) {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === id ? { ...shape, muted: mute ?? !shape.muted } : shape,
      ),
    );
  }

  function manageEditShapeDialog(shape: BeatShape) {
    beginDialogSync();
    editWasSavedRef.current = false;
    setEditedShapePrevMutedState(shape.muted);
    setShapeMuted(shape.id, true);
    setEditingShape(shape);
    setCoordinates({ x: shape.x, y: shape.y });
    setManageDialog(true);
  }

  function deleteShapeFromList(shape: BeatShape) {
    setShapeToDeleteId(shape.id);
    setDeleteDialogColor(shape.fillColor);
    setOpenDeleteDialog(true);
  }

  const handleSetPaused = useCallback((shapeId: string) => {
    setPaused(shapeId);
  }, []);

  const handleSetShapeMuted = useCallback((shapeId: string) => {
    setShapeMuted(shapeId);
  }, []);

  const handleSetVisibility = useCallback((shapeId: string) => {
    setVisibility(shapeId);
  }, []);

  const handleDeleteShapeFromList = useCallback((shape: BeatShape) => {
    deleteShapeFromList(shape);
  }, []);

  const handleManageEditShapeDialog = useCallback((shape: BeatShape) => {
    manageEditShapeDialog(shape);
  }, []);

  const reorderShapes = useCallback(
    (
      draggedShapeId: string,
      targetShapeId: string,
      position: "before" | "after",
    ) => {
      setShapes((prev) => {
        const draggedIndex = prev.findIndex(
          (shape) => shape.id === draggedShapeId,
        );
        const targetIndex = prev.findIndex(
          (shape) => shape.id === targetShapeId,
        );

        if (
          draggedIndex === -1 ||
          targetIndex === -1 ||
          draggedIndex === targetIndex
        ) {
          return prev;
        }

        const next = [...prev];
        const [draggedShape] = next.splice(draggedIndex, 1);

        if (!draggedShape) {
          return prev;
        }

        const targetIndexAfterRemoval = next.findIndex(
          (shape) => shape.id === targetShapeId,
        );

        if (targetIndexAfterRemoval === -1) {
          return prev;
        }

        const insertIndex =
          position === "before"
            ? targetIndexAfterRemoval
            : targetIndexAfterRemoval + 1;

        next.splice(insertIndex, 0, draggedShape);
        return next;
      });
    },
    [],
  );

  return (
    <Box
      onPointerDown={handleInputDown}
      onPointerUp={handleInputUp}
      onPointerCancel={handleInputCancel}
      onPointerMove={handleInputMove}
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgb(86,86,86)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        touchAction: "none",
      }}
    >
      <Box sx={{ zIndex: 1 }}>
        <StageCanvasComponent
          canvasRef={canvasRef}
          mouseState={mouseState}
          width={viewportSize.width}
          height={viewportSize.height}
        />
      </Box>
      <StageEmptyHintComponent visible={shapes.length === 0} />
      <MoveShapesToPitchHintComponent
        visible={shapes.length === 1 && showMovePitchHint}
        counter={movePitchHintMoveCountRef.current}
      />
      <MinimapComponent
        getVisibleWorldRect={getVisibleWorldRect}
        stageWorldHeight={STAGE_WORLD_HEIGHT}
        stageWorldWidth={STAGE_WORLD_WIDTH}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetCameraToFitHeight}
      />

      <StageHeaderComponent />
      <StageRightPanelComponent
        settingsPanelOpen={settingsPanelOpen}
        setSettingsPanelOpen={setSettingsPanelOpen}
        shapePanelOpen={shapePanelOpen}
        setShapePanelOpen={setShapePanelOpen}
        importExportPanelOpen={importExportPanelOpen}
        setImportExportPanelOpen={setImportExportPanelOpen}
        activeBeat={activeBeat}
        onStartStop={onStartStop}
        play={play}
        beatProgress={beatProgress}
        selectBeatNumber={selectBeatNumber}
        bpm={bpm}
        setNewSpeed={setNewSpeed}
        volume={volume}
        changeVolume={changeVolume}
        shapes={shapes}
        setPaused={handleSetPaused}
        setShapeMuted={handleSetShapeMuted}
        setVisibility={handleSetVisibility}
        deleteShapeFromList={handleDeleteShapeFromList}
        manageEditShapeDialog={handleManageEditShapeDialog}
        reorderShapes={reorderShapes}
        showPitchlines={showPitchlines}
        setShowPitchlines={() => setShowPitchlines((prev) => !prev)}
        onExportCode={exportBeatCode}
        onImportCode={() => setOpenImportCodeDialog(true)}
        onExportLink={exportBeatLink}
      />
      {manageDialog && (
        <CreateShapeDialog
          open={manageDialog}
          syncStartAt={dialogSyncStartAt}
          onStartStopStage={onStartStop}
          stagePlay={play}
          onPreviewReady={handlePreviewReady}
          onClose={handleCloseDialog}
          onChangeShape={resetAllRuntimeShapes}
          onCreateShape={(input: CreateShapeInput) => {
            if (editingShape) {
              editWasSavedRef.current = true;
              setShapes((prev) =>
                prev.map((shape) =>
                  shape.id === editingShape.id
                    ? {
                        ...createShape(input),
                        id: editingShape.id,
                        muted: false,
                      }
                    : shape,
                ),
              );
            } else {
              setShapes((prev) => [...prev, createShape(input)]);
            }
            setPlay(true);
          }}
          editingShape={editingShape}
          editedShapeMuted={editedShapePrevMutedState}
          x={editingShape ? editingShape.x : coordinates.x}
          y={editingShape ? editingShape.y : coordinates.y}
          pitchSection={
            editingShape
              ? getPitchSection(editingShape.y, pitchSections)
              : getPitchSection(coordinates.y, pitchSections)
          }
          bpm={sekToEncircle}
          previewStartPoint={0}
          deleteShape={deleteShape}
        />
      )}
      <ConfirmDialog
        open={openDeleteDialog}
        color={deleteDialogColor}
        title={"From Löschen?"}
        text={"Soll die Form wirklich gelöscht werden?"}
        onConfirm={() => {
          if (shapeToDeleteId) {
            deleteShape(shapeToDeleteId);
          }

          setOpenDeleteDialog(false);
          setShapeToDeleteId(null);
        }}
        onCancel={() => {
          setOpenDeleteDialog(false);
          setShapeToDeleteId(null);
        }}
      />
      <CopySnackbar
        open={openCopySnackbar}
        handleClose={() => setOpenCopySnackbar((prev) => !prev)}
      />
      <ConfirmDialog
        open={openImportCodeDialog}
        title={"Beatshapes Importieren"}
        text={"Zum Importieren Code hier einfügen."}
        onConfirm={() => {}}
        confirmCode={importBeatCode}
        onCancel={() => setOpenImportCodeDialog((prev) => !prev)}
        showTextfield={true}
      />
    </Box>
  );
}
