import { Box, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { appColors } from "../../theme";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";

type MinimapComponentProps = {
  stageWorldWidth: number;
  stageWorldHeight: number;
  getVisibleWorldRect: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

export default function MinimapComponent(props: MinimapComponentProps) {
  const minimapWidth = 180;
  const minimapViewportHeight = 102;

  const minimapScale = minimapWidth / props.stageWorldWidth;
  const minimapHeight = props.stageWorldHeight * minimapScale;
  const visibleRect = props.getVisibleWorldRect();

  const viewportX = visibleRect.x * minimapScale;
  const viewportY = visibleRect.y * minimapScale;
  const viewportWidth = visibleRect.width * minimapScale;
  const viewportHeight = visibleRect.height * minimapScale;

  return (
    <Box
      sx={{
        position: "absolute",
        left: 16,
        top: 55,
        width: minimapWidth + 40,
        zIndex: 4,
        pointerEvents: "auto",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: minimapWidth,
          height: minimapViewportHeight,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: (minimapViewportHeight - minimapHeight) / 2,
            width: minimapWidth,
            height: minimapHeight,
            backgroundColor: "transparent",
            border: `2px solid ${alpha(appColors.black, 0.12)}`,
            boxSizing: "border-box",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: viewportX,
            top: (minimapViewportHeight - minimapHeight) / 2 + viewportY,
            width: viewportWidth,
            height: viewportHeight,
            border: `2px solid ${appColors.black}`,
            backgroundColor: alpha(appColors.black, 0.12),
            boxSizing: "border-box",
          }}
        />
      </Box>

      <Box
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        sx={{
          mt: -3,
          display: "flex",
          flexDirection: "row",
          gap: 0,
          pointerEvents: "auto",
        }}
      >
        <IconButton onClick={props.onZoomIn}>
          <ZoomInIcon sx={{ fontSize: 30 }} />
        </IconButton>
        <IconButton onClick={props.onZoomOut}>
          <ZoomOutIcon sx={{ fontSize: 30 }} />
        </IconButton>
        <IconButton onClick={props.onResetZoom}>
          <FitScreenIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
