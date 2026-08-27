import { Box, IconButton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PermDataSettingIcon from "@mui/icons-material/PermDataSetting";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  memo,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import ShapePreviewComponent from "../../ShapePreviewComponent";
import { appColors } from "../../../theme";
import type { BeatShape } from "../../../types/shapes";

type ShapePanelComponentProps = {
  shapePanelOpen: boolean;
  setShapePanelOpen: Dispatch<SetStateAction<boolean>>;
  shapes: BeatShape[];
  setPaused: (shapeId: string) => void;
  setShapeMuted: (shapeId: string) => void;
  setVisibility: (shapeId: string) => void;
  deleteShapeFromList: (shape: BeatShape) => void;
  manageEditShapeDialog: (shape: BeatShape) => void;
  reorderShapes: (
    draggedShapeId: string,
    targetShapeId: string,
    position: "before" | "after",
  ) => void;
};

function ShapePanelComponent({
  shapePanelOpen,
  setShapePanelOpen,
  shapes,
  setPaused,
  setShapeMuted,
  setVisibility,
  deleteShapeFromList,
  manageEditShapeDialog,
  reorderShapes,
}: ShapePanelComponentProps) {
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    shapeId: string;
    position: "before" | "after";
  } | null>(null);

  function handleDragStart(event: DragEvent<HTMLDivElement>, shapeId: string) {
    setDraggedShapeId(shapeId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", shapeId);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, shapeId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const rect = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rect.top + rect.height / 2 ? "before" : "after";

    setDragOverTarget({ shapeId, position });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetShapeId: string) {
    event.preventDefault();
    const draggedId =
      draggedShapeId || event.dataTransfer.getData("text/plain");
    const position =
      dragOverTarget?.shapeId === targetShapeId
        ? dragOverTarget.position
        : "before";

    if (draggedId && draggedId !== targetShapeId) {
      reorderShapes(draggedId, targetShapeId, position);
    }

    setDraggedShapeId(null);
    setDragOverTarget(null);
  }

  function resetDragState() {
    setDraggedShapeId(null);
    setDragOverTarget(null);
  }

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        pointerEvents: "none",
        minHeight: 0,
      }}
    >
      <Box
        onMouseDown={(event) => (shapePanelOpen ? event.stopPropagation() : {})}
        onClick={(event) => (shapePanelOpen ? event.stopPropagation() : {})}
        sx={{
          pointerEvents: "auto",
          cursor: "default",
          position: "relative",
          width: shapePanelOpen ? "100%" : 45,
          height: shapePanelOpen ? "100%" : 45,
          minHeight: 45,
          maxHeight: "100%",
          marginLeft: "auto",
          overflow: "hidden",
          backgroundColor: alpha(appColors.background, 0.5),
          boxShadow: 3,
          backdropFilter: "blur(8px)",
          transition: "width 180ms ease, height 180ms ease",
          p: 1.5,
          pl: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 1,
            display: "grid",
            gridTemplateColumns: "1fr 45px",
          }}
        >
          <Box>
            <Typography variant="h2" sx={{ mt: -1.3, ml: -0.3 }}>
              Beatshapes
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={() => setShapePanelOpen((prev) => !prev)}
              sx={{
                pointerEvents: "auto",
                position: "absolute",
                top: 0,
                right: 0,
                width: 45,
                height: 45,
                borderRadius: 0,
                backgroundColor: shapePanelOpen
                  ? alpha(appColors.background, 0.1)
                  : appColors.black,
                color: shapePanelOpen ? appColors.black : appColors.white,
                "&:hover": {
                  backgroundColor: appColors.black,
                  color: appColors.white,
                },
              }}
            >
              {shapePanelOpen ? (
                <ArrowForwardIosIcon sx={{ fontSize: 25 }} />
              ) : (
                <PermDataSettingIcon sx={{ fontSize: 25 }} />
              )}
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 1,
            maxHeight: "calc(100% - 60px)",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
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
          {shapes.map((shape) => (
            <Box
              key={shape.id}
              onDragOver={(event) => handleDragOver(event, shape.id)}
              onDragLeave={() => setDragOverTarget(null)}
              onDrop={(event) => handleDrop(event, shape.id)}
              sx={{
                backgroundColor: alpha(shape.fillColor, 0.1),
                borderRadius: 2,
                display: "grid",
                gridTemplateColumns: "24px 1fr",
                alignItems: "start",
                opacity: draggedShapeId === shape.id ? 0.45 : 1,
                borderTop:
                  dragOverTarget?.shapeId === shape.id &&
                  dragOverTarget.position === "before" &&
                  draggedShapeId !== shape.id
                    ? `4px solid ${appColors.black}`
                    : "4px solid transparent",
                borderBottom:
                  dragOverTarget?.shapeId === shape.id &&
                  dragOverTarget.position === "after" &&
                  draggedShapeId !== shape.id
                    ? `4px solid ${appColors.black}`
                    : "4px solid transparent",
                transition: "opacity 120ms ease, border-color 120ms ease",
              }}
            >
              <Box
                draggable
                onDragStart={(event) => handleDragStart(event, shape.id)}
                onDragEnd={resetDragState}
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: alpha(appColors.black, 0.65),
                  cursor: "grab",
                  pointerEvents: "auto",
                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 22 }} />
              </Box>
              <ShapePreviewComponent
                shape={shape}
                setPaused={setPaused}
                setShapeMuted={setShapeMuted}
                setVisibility={setVisibility}
                deleteShapeFromList={deleteShapeFromList}
                manageEditShapeDialog={manageEditShapeDialog}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ShapePanelComponent);
