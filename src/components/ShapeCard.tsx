import ToggleButton from "@mui/material/ToggleButton";
import type { ShapeKey } from "../types/shapes";
import { Box } from "@mui/material";
import { appColors } from "../theme";
import BeatlineWithNotes from "./BeatlineWithNotes";
import { alpha } from "@mui/material/styles";
import { NoMovementCanvas } from "./canvas/noMovementCanvas";

export type ShapeCardProps = {
  color: string;
  shape: ShapeKey;
  activeShape: ShapeKey;
  setActiveShape: (key: ShapeKey) => void;
};

export function ShapeCard(props: ShapeCardProps) {
  const sameValues =
    props.shape.value.length === props.activeShape.value.length &&
    props.shape.value.every(
      (value, index) => value === props.activeShape.value[index],
    );

  const isSelected =
    props.shape.type === props.activeShape.type &&
    props.shape.corners === props.activeShape.corners &&
    sameValues;

  return (
    <ToggleButton
      sx={{
        width: "100%",
        minWidth: 390,
        display: "flex",
        justifyContent: "start",
        border: !isSelected
          ? `0px solid ${appColors.black}`
          : `4px solid ${appColors.black}`,
        borderRadius: 0,
        p: 0.5,
        pl: 2,
        gridTemplateColumns: "clamp(44px, 16vw, 60px) 1fr",
        bgcolor: isSelected ? props.color : alpha(props.color, 0.15),

        "&.Mui-selected": {
          bgcolor: appColors.background,
        },
      }}
      value={`${props.shape.type}-${props.shape.corners}`}
      selected={isSelected}
      onChange={() => props.setActiveShape(props.shape)}
    >
      <NoMovementCanvas
        shape={props.shape}
        color={appColors.black}
        width={60}
        height={60}
      ></NoMovementCanvas>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          pt: 1,
        }}
      >
        <BeatlineWithNotes
          beatValues={props.shape.value}
          height={70}
          showProgress={false}
        ></BeatlineWithNotes>
      </Box>
    </ToggleButton>
  );
}
