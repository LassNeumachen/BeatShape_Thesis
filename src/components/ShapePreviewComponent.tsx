import { NoMovementCanvas } from "./canvas/noMovementCanvas";
import { memo } from "react";
import { beatShapeToShapeKey } from "../lib/helper/shapeKeyMapper";
import BeatlineWithNotes from "./BeatlineWithNotes";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { appColors } from "../theme";
import ToggleIconButton from "./buttons/ToggleIconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { BeatShape } from "../types/shapes";

type ShapePreviewComponentProps = {
  shape: BeatShape;
  setPaused: (shapeId: string) => void;
  setShapeMuted: (shapeId: string) => void;
  setVisibility: (shapeId: string) => void;
  deleteShapeFromList: (shape: BeatShape) => void;
  manageEditShapeDialog: (shape: BeatShape) => void;
};

function ShapePreviewComponent({
  shape,
  setPaused,
  setShapeMuted,
  setVisibility,
  deleteShapeFromList,
  manageEditShapeDialog,
}: ShapePreviewComponentProps) {
  const iconSize = 15;
  const showRotatedBeatline =
    shape.rotation !== 0 && shape.rotatedValues.length > 0;
  const showSyncopatedBeatline =
    showRotatedBeatline &&
    shape.notePlacements !== undefined &&
    shape.notePlacements.length > 0;

  function hasName(shapeName: string | undefined) {
    return shapeName !== undefined && shapeName.length > 0;
  }

  return (
    <Box key={shape.id}>
      {hasName(shape.name) ? (
        <Typography
          variant="h5"
          sx={{
            color: appColors.black,
            lineHeight: 1,
            mb: 1,
            pl: 1.2,
            pt: 0.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {shape.name}
        </Typography>
      ) : (
        <Box sx={{ height: 7 }} />
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "50px 1fr",
          alignItems: "start",
          zIndex: 1,
        }}
      >
        <Box sx={{ pointerEvents: "auto", cursor: "pointer" }}>
          <NoMovementCanvas
            color={shape.fillColor}
            shape={beatShapeToShapeKey(shape)}
            width={50}
            height={50}
            radius={22}
            onEditClick={() => manageEditShapeDialog(shape)}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minWidth: 0,
          }}
        >
          <Box sx={{ pointerEvents: "none" }}>
            <BeatlineWithNotes
              beatValues={shape.value}
              height={40}
              showProgress={false}
              useRotatedValues={showRotatedBeatline}
              rotatedValues={shape.rotatedValues}
              useDefaultBeatline={!showSyncopatedBeatline}
              notePlacements={
                showSyncopatedBeatline ? shape.notePlacements : undefined
              }
              beatlinesForPreview
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 0.7,
              mt: -1.2,
              zIndex: 2,
            }}
          >
            <ToggleIconButton
              setRunning={() => setPaused(shape.id)}
              running={shape.paused}
              size={iconSize}
              iconOne={PlayArrowIcon}
              iconTwo={PauseIcon}
              color={alpha(appColors.black, 0.8)}
            />
            <ToggleIconButton
              setRunning={() => setShapeMuted(shape.id)}
              running={shape.muted}
              size={iconSize}
              iconOne={VolumeOffIcon}
              iconTwo={VolumeUpIcon}
              color={alpha(appColors.black, 0.8)}
            />
            <ToggleIconButton
              setRunning={() => setVisibility(shape.id)}
              running={shape.visable}
              size={iconSize}
              iconOne={VisibilityIcon}
              iconTwo={VisibilityOffIcon}
              color={alpha(appColors.black, 0.8)}
            />
            <ToggleIconButton
              setRunning={() => manageEditShapeDialog(shape)}
              size={iconSize}
              iconOne={EditIcon}
              color={alpha(appColors.black, 0.8)}
            />
            <ToggleIconButton
              setRunning={() => deleteShapeFromList(shape)}
              size={iconSize}
              iconOne={DeleteIcon}
              color={alpha(appColors.black, 0.8)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ShapePreviewComponent);
