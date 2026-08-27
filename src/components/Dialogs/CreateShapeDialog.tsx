import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CreateShapeInput } from "../../lib/shapeFactory";
import type { ActiveBeats, BeatShape, ShapeKey } from "../../types/shapes";
import type { Sound, SoundType } from "../../types/sounds";
import { startAudio } from "../../lib/audioEngine";
import { calculateShapePoints } from "../../lib/helper/shapeCalculator";
import { transformPathData } from "../../lib/helper/paperPath";
import { beatShapeToShapeKey } from "../../lib/helper/shapeKeyMapper";
import { useShapeLibraryStore } from "../../stores/shapeLibaryStore";
import { appColors } from "../../theme";
import ConfirmDialog from "./ConfirmDialog";
import ShapeEditorDialog from "./ShapeEditorDialog";
import PreviewComponent from "./dialogComponents/PreviewComponent";
import ShapeOptionsComponent from "./dialogComponents/ShapeOptionsComponent";
import SoundOptionsComponent from "./dialogComponents/SoundOptionsComponent";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import type { BeatlineNotePlacement } from "../BeatlineWithNotes";
import { alpha } from "@mui/material/styles";
import { getStageShapeSizeFromVolume } from "../../lib/helper/shapeSize";

type CreateShapeDialogProps = {
  open: boolean;
  x: number;
  y: number;
  bpm: number;
  previewStartPoint: number;
  syncStartAt: number | null;
  onPreviewReady: () => void;
  onClose: () => void;
  onCreateShape: (input: CreateShapeInput) => void;
  onChangeShape: () => void;
  editingShape: BeatShape | null;
  deleteShape: (id: string) => void;
  editedShapeMuted: boolean;
  onStartStopStage: () => void;
  stagePlay: boolean;
  pitchSection: number;
};

const colors = [
  appColors.orange,
  appColors.red,
  appColors.purple,
  appColors.lightBlue,
  appColors.yellow,
  appColors.green,
];

const defaultSound: Sound = {
  soundType: "kickdrum_1",
  note: "C",
  duration: "8n",
  volume: 0,
};

const defaultActiveBeats: ActiveBeats = [true, true, true, true];

const defaultShape: ShapeKey = {
  corners: 4,
  type: "polygon",
  value: [1 / 4, 1 / 4, 1 / 4, 1 / 4],
  createdByUser: false,
};

const defaultShapeName = "Beatshape";

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)]!;
}

export default function CreateShapeDialog({
  open,
  x,
  y,
  bpm,
  previewStartPoint,
  syncStartAt,
  onPreviewReady,
  onClose,
  onCreateShape,
  onChangeShape,
  editingShape,
  deleteShape,
  onStartStopStage,
  stagePlay,
  pitchSection,
}: CreateShapeDialogProps) {
  const [selectedShape, setSelectedShape] = useState<ShapeKey>(defaultShape);
  const [volume, setVolume] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [rotatedValues, setRotatedValues] = useState<number[]>([]);
  const [notePlacements, setNotePlacements] = useState<
    BeatlineNotePlacement[] | undefined
  >(undefined);
  const [color, setColor] = useState(
    editingShape ? editingShape.fillColor : getRandomColor(),
  );
  const [sound, setSound] = useState<Sound>(defaultSound);
  const [activeBeats, setActiveBeats] =
    useState<ActiveBeats>(defaultActiveBeats);
  const [play, setPlay] = useState(true);
  const [newShape, setNewShape] = useState(false);
  const [shapeName, setShapeName] = useState(defaultShapeName);
  const [openShapeEditor, setOpenShapeEditor] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const showTabs = useMediaQuery("(max-width: 1050px)");

  const shapeOptions = useShapeLibraryStore((state) => state.shapeOptions);
  const addShapeOption = useShapeLibraryStore((state) => state.addShapeOption);

  const handleNewShapeHandled = useCallback(() => setNewShape(false), []);
  const handleBeatlineChange = useCallback(
    (
      nextRotatedValues: number[],
      nextNotePlacements: BeatlineNotePlacement[] | undefined,
    ) => {
      setRotatedValues(nextRotatedValues);
      setNotePlacements(nextNotePlacements);
    },
    [],
  );

  useEffect(() => {
    if (editingShape) {
      setSelectedShape(beatShapeToShapeKey(editingShape));
      setSound(editingShape.sound);
      setVolume(editingShape.sound.volume);
      setRotation(editingShape.rotation);
      setColor(editingShape.fillColor);
      setActiveBeats(editingShape.activeBeats);
      setRotatedValues(editingShape.rotatedValues);
      setNotePlacements(editingShape.notePlacements);
      setShapeName(editingShape.name ?? defaultShapeName);
      return;
    }

    reset();
  }, [editingShape]);

  useEffect(() => {
    if (open) {
      if (!editingShape) {
        setColor(getRandomColor());
      }
      return;
    }

    reset();
  }, [open]);

  function getSizeFromVolume() {
    return getStageShapeSizeFromVolume(volume);
  }

  function reset() {
    setVolume(0);
    setRotation(0);
    setSound(defaultSound);
    setSelectedShape(defaultShape);
    setActiveBeats([...defaultActiveBeats]);
    setRotatedValues(defaultShape.value);
    setNotePlacements(undefined);
    setShapeName(defaultShapeName);
  }

  function onStartStop() {
    void startAudio();
    setPlay((previous) => !previous);
  }

  function onSetSound(soundType: SoundType) {
    void startAudio();
    setSound((previous) => ({
      ...previous,
      soundType,
    }));
    onChangeShape();
  }

  function onSetActiveShape(shape: ShapeKey) {
    onChangeShape();
    setSelectedShape(shape);
    setNewShape(true);
  }

  function onSetRotation(value: number) {
    setRotation(value);
    onChangeShape();
  }

  function onSetVolume(value: number) {
    setVolume(value);
    onChangeShape();
  }

  function handleCreate() {
    const trimmedName = shapeName.trim();
    const name =
      trimmedName.length > 0 &&
      trimmedName.toLowerCase() !== defaultShapeName.toLowerCase()
        ? trimmedName
        : undefined;
    const common = {
      x,
      y,
      fillColor: color,
      ballColor: "white",
      offset: 0,
      lastOffset: 0,
      rotation,
      rotatedValues,
      notePlacements,
      value: selectedShape.value,
      sound: {
        ...sound,
        volume,
      },
      activeBeats,
      name,
    };

    let input: CreateShapeInput;

    if (selectedShape.type === "circle") {
      input = {
        ...common,
        type: "circle",
        radius: getSizeFromVolume(),
      };
    } else if (selectedShape.type === "polygon") {
      input = {
        ...common,
        type: "polygon",
        size: getSizeFromVolume(),
        corners: selectedShape.corners,
      };
    } else {
      const scale = getSizeFromVolume() / selectedShape.pathData.baseRadius;

      input = {
        ...common,
        type: "custom",
        pathData: transformPathData(selectedShape.pathData, scale, x, y),
      };
    }

    onCreateShape(input);
  }

  function createAndAddNewShape(beatValues: number[]) {
    const existingShape = shapeOptions.find(
      (shape) => JSON.stringify(shape.value) === JSON.stringify(beatValues),
    );

    if (existingShape) {
      setSelectedShape(existingShape);
    } else {
      const pathData = calculateShapePoints(beatValues);
      if (!pathData) return;

      const newShape: ShapeKey = {
        type: "custom",
        corners: pathData.segments.length,
        value: beatValues,
        pathData,
        createdByUser: true,
      };

      addShapeOption(newShape);
      setSelectedShape(newShape);
    }

    setOpenShapeEditor(false);
    setPlay(true);
  }

  function openShapeEditorDialog() {
    setOpenShapeEditor(true);
    setPlay(false);
  }

  const previewContent = (
    <PreviewComponent
      open={open}
      pitchsection={pitchSection}
      selectedShape={selectedShape}
      volume={volume}
      rotation={rotation}
      color={color}
      sound={sound}
      activeBeats={activeBeats}
      bpm={bpm}
      previewStartPoint={previewStartPoint}
      syncStartAt={syncStartAt}
      play={play}
      newShape={newShape}
      onPreviewReady={onPreviewReady}
      onStartStop={onStartStop}
      onColorChange={setColor}
      onActiveBeatsChange={setActiveBeats}
      onVolumeChange={onSetVolume}
      onSetRotation={onSetRotation}
      onNewShapeHandled={handleNewShapeHandled}
      onBeatlineChange={handleBeatlineChange}
    />
  );

  const shapeOptionsContent = (
    <ShapeOptionsComponent
      color={color}
      shapes={shapeOptions}
      selectedShape={selectedShape}
      onSelectShape={onSetActiveShape}
      onOpenShapeEditor={openShapeEditorDialog}
    />
  );

  const soundOptionsContent = (
    <SoundOptionsComponent
      color={color}
      volume={volume}
      activeSound={sound.soundType}
      onSelectSound={onSetSound}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      PaperProps={{
        sx: {
          width: 1200,
          maxWidth: "none",
          maxHeight: "calc(100vh - 64px)",
          backgroundColor: appColors.background,
          borderRadius: 0,
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          pt: 2,
          pr: editingShape ? "310px" : "250px",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Box sx={{ maxWidth: "120px" }}>
          <Typography
            variant="h2"
            sx={{
              color: appColors.black,
              opacity: 0.8,
              flexShrink: 0,
            }}
          >
            {editingShape ? "Bearbeite" : "Erstelle"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            maxWidth: 400,
            minWidth: 0,
            borderBottom: "2px solid transparent",
            transition: "border-color 120ms ease",
            "&:hover": {
              borderBottomColor: alpha(appColors.black, 0.35),
            },
            "&:focus-within": {
              borderBottomColor: color,
            },
          }}
        >
          <InputBase
            value={shapeName}
            onChange={(event) => setShapeName(event.target.value)}
            inputProps={{ maxLength: 20 }}
            sx={{
              flex: "0 1 auto",
              width: `${Math.max(shapeName.length, 1)}ch`,
              maxWidth: 360,
              minWidth: 0,
              fontFamily: "Staatliches, sans-serif",
              fontSize: 42,
              lineHeight: 1,
              letterSpacing: 0,
              color: appColors.black,
              "& input": {
                p: 0,
                height: "auto",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <DriveFileRenameOutlineIcon
            sx={{
              color: appColors.black,
              fontSize: 28,
              ml: 1,
              flexShrink: 0,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          pb: 3,
          minWidth: 0,
          scrollbarWidth: "thin",
          scrollbarColor: `${appColors.black} transparent`,
          "&::-webkit-scrollbar": {
            width: 8,
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
            backgroundColor: appColors.lightBlack,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            display: "flex",
            flexDirection: "row",
            minWidth: 0,
            gap: 1,
          }}
        >
          <Button
            onClick={() => onStartStopStage()}
            sx={{
              minWidth: 0,
              p: 1,
              backgroundColor: appColors.black,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: appColors.white,
                px: 1,
                pt: 0.5,
                "&:hover": { color },
              }}
            >
              {stagePlay ? "Stage Pausieren" : "Stage Starten"}
            </Typography>
            {stagePlay ? (
              <PauseIcon
                sx={{
                  color: color,
                  fontSize: 30,
                }}
              />
            ) : (
              <PlayArrowIcon
                sx={{
                  color: color,
                  fontSize: 30,
                }}
              />
            )}
          </Button>
          {editingShape && (
            <Button
              onClick={() => setOpenDeleteDialog(true)}
              sx={{
                minWidth: 0,
                p: 1,
                backgroundColor: appColors.black,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: appColors.white,
                  px: 1,
                  pt: 0.5,
                  "&:hover": { color },
                }}
              >
                Löschen
              </Typography>
              <DeleteIcon sx={{ fontSize: 30, color }} />
            </Button>
          )}
        </Box>

        {showTabs ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              mt: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value: number) => setActiveTab(value)}
              variant="fullWidth"
              sx={{
                minHeight: 44,
                borderBottom: `4px solid ${appColors.black}`,
                "& .MuiTabs-indicator": {
                  height: 4,
                  backgroundColor: color,
                },
                "& .MuiTab-root": {
                  minHeight: 44,
                  color: appColors.black,
                  fontFamily: "Staatliches, sans-serif",
                  fontSize: 22,
                  letterSpacing: 0,
                  borderRadius: 0,
                  "&:hover": {
                    color: appColors.black,
                  },
                  "&.Mui-focusVisible": {
                    color: appColors.black,
                  },
                  "&.Mui-selected": {
                    color: appColors.black,
                    backgroundColor: color,
                  },
                },
                "& .MuiTab-root.Mui-selected": {
                  color: appColors.black,
                  backgroundColor: color,
                },
              }}
            >
              <Tab label="Preview" />
              <Tab label="Shapes" />
              <Tab label="Sound" />
            </Tabs>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                pt: 3,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 430,
                  mx: "auto",
                }}
              >
                <Box sx={{ display: activeTab === 0 ? "block" : "none" }}>
                  {previewContent}
                </Box>
                <Box sx={{ display: activeTab === 1 ? "block" : "none" }}>
                  {shapeOptionsContent}
                </Box>
                <Box sx={{ display: activeTab === 2 ? "block" : "none" }}>
                  {soundOptionsContent}
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.2fr 0.6fr",
              gap: 4,
              width: "100%",
              flex: 1,
              minHeight: 0,
              mt: 2,
            }}
          >
            {previewContent}
            {shapeOptionsContent}
            {soundOptionsContent}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2.5,
          pt: 0,
        }}
      >
        <Button
          sx={{
            backgroundColor: appColors.black,
            p: 2,
            color: appColors.white,
            "&:hover": { color },
          }}
          onClick={onClose}
        >
          Schließen
        </Button>
        <Button
          sx={{
            backgroundColor: color,
            p: 2,
            color: appColors.black,
            "&:hover": { color: appColors.white },
          }}
          onClick={() => {
            handleCreate();
            onClose();
          }}
        >
          {editingShape ? "Änderungen speichern" : "Erstellen"}
        </Button>
      </DialogActions>

      <ShapeEditorDialog
        open={openShapeEditor}
        onClose={() => setOpenShapeEditor(false)}
        createCustomShape={createAndAddNewShape}
        color={color}
        bpm={bpm}
        sound={sound}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        color={color}
        title="Beatshape löschen?"
        text="Soll die Beatshape wirklich gelöscht werden?"
        onConfirm={() => {
          setOpenDeleteDialog(false);
          if (editingShape) {
            deleteShape(editingShape.id);
          }
        }}
        onCancel={() => setOpenDeleteDialog(false)}
      />
    </Dialog>
  );
}
