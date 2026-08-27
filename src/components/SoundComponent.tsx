import type { Sound, SoundType } from "../types/sounds";
import ToggleButton from "@mui/material/ToggleButton";
import { Box, Typography } from "@mui/material";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import { appColors } from "../theme";
import { alpha } from "@mui/material/styles";

export type SoundComponentProps = {
  soundType: SoundType;
  activeSound: SoundType;
  setActiveSound: (key: SoundType) => void;
  volume: number;
  color: string;
  label?: string;
};

export function SoundComponent(props: SoundComponentProps) {
  const isSelected = props.soundType === props.activeSound;

  return (
    <ToggleButton
      value={props.soundType}
      selected={isSelected}
      onChange={() => props.setActiveSound(props.soundType)}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "start",
        border: !isSelected
          ? `0px solid ${appColors.black}`
          : `4px solid ${appColors.black}`,
        borderRadius: 0,
        p: 0.5,
        pl: 2,
        bgcolor: isSelected ? props.color : alpha(props.color, 0.15),

        "&.Mui-selected": {
          bgcolor: appColors.background,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AudiotrackIcon sx={{ fontSize: 30, color: appColors.black }} />
        </Box>
        <Typography variant="body2">
          {props.label ?? props.soundType}
        </Typography>
      </Box>
    </ToggleButton>
  );
}
