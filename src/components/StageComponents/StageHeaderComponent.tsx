import { Box, Typography } from "@mui/material";
import { memo } from "react";
import { appColors } from "../../theme";

function StageHeaderComponent() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 10,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          display: "flex",
          mt: -0.5,
        }}
      >
        BEATSHAPE
      </Typography>
      <Box
        sx={{
          display: "flex",
          bgcolor: appColors.black,
          height: 45.4,
          width: 45.4,
          ml: 1.3,
          mt: 0.5,
        }}
      />
    </Box>
  );
}

export default memo(StageHeaderComponent);
