import { Box, Typography } from "@mui/material";
import { memo } from "react";
import { appColors } from "../../theme";

type StageEmptyHintComponentProps = {
  visible: boolean;
};

function StageEmptyHintComponent({ visible }: StageEmptyHintComponentProps) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      <Typography
        variant="h2"
        textAlign="center"
        sx={{ color: appColors.lightBlack }}
      >
        Klick irgendwo auf die Fläche um auf der Stage eine Beatshape zu
        erstellen!
      </Typography>
    </Box>
  );
}

export default memo(StageEmptyHintComponent);
