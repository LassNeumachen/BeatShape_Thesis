import { Box, Typography } from "@mui/material";
import { memo } from "react";
import { appColors } from "../../theme";
import SwapVertIcon from "@mui/icons-material/SwapVert";

type MoveShapesToPitchHintComponentProps = {
  visible: boolean;
  counter: number;
};

function MoveShapesToPitchHintComponent({
  visible,
  counter,
}: MoveShapesToPitchHintComponentProps) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      <SwapVertIcon
        sx={{ color: appColors.lightBlack, fontSize: 200 }}
      ></SwapVertIcon>

      <Box>
        <Typography
          variant="h2"
          sx={{
            color: appColors.lightBlack,
            whiteSpace: "pre-line",
          }}
        >
          {
            "Verschiebe die Beatshape nach oben oder unten,\num den Sound höher oder tiefer zu pitchen."
          }
        </Typography>
        <Typography
          variant="h1"
          sx={{
            color: appColors.lightBlack,
            whiteSpace: "pre-line",
          }}
        >
          {counter + " / 3"}
        </Typography>
      </Box>
    </Box>
  );
}

export default memo(MoveShapesToPitchHintComponent);
