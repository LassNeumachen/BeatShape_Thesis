import { Box, Grid, Typography } from "@mui/material";
import type { ShapeKey } from "../../../types/shapes";
import { appColors } from "../../../theme";
import BuildNewBeatshapeButton from "../../buttons/BuildNewBeatshapeButton";
import { ShapeCard } from "../../ShapeCard";

type ShapeOptionsComponentProps = {
  color: string;
  shapes: ShapeKey[];
  selectedShape: ShapeKey;
  onSelectShape: (shape: ShapeKey) => void;
  onOpenShapeEditor: () => void;
};

export default function ShapeOptionsComponent(
  props: ShapeOptionsComponentProps,
) {
  const userShapes = props.shapes.filter((shape) => shape.createdByUser);
  const defaultShapes = props.shapes.filter((shape) => !shape.createdByUser);

  function renderShapeCards(shapes: ShapeKey[]) {
    return shapes.map((shape) => (
      <Grid
        key={`${shape.type}-${shape.corners}-${shape.value.join("-")}-${shape.type === "custom" ? JSON.stringify(shape.pathData) : ""}`}
        size={12}
      >
        <ShapeCard
          color={props.color}
          shape={shape}
          activeShape={props.selectedShape}
          setActiveShape={props.onSelectShape}
        />
      </Grid>
    ));
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: 0,
      }}
    >
      <Typography variant="h4">Form/Takt Optionen</Typography>

      <Box
        sx={{
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
        <Grid container spacing={1}>
          <Typography variant="h4">Eigene Takte</Typography>
          <BuildNewBeatshapeButton
            openDialog={props.onOpenShapeEditor}
            color={props.color}
          />

          {renderShapeCards(userShapes)}

          <Grid size={12}>
            <Typography variant="h4">Standard Takte</Typography>
          </Grid>

          {renderShapeCards(defaultShapes)}
        </Grid>
      </Box>
    </Box>
  );
}
