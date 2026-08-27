import { Box, Typography } from "@mui/material";
import type { SoundType } from "../../../types/sounds";
import {
  soundCategoryLabels,
  soundCategoryOrder,
  soundDefinitions,
} from "../../../types/sounds";
import { appColors } from "../../../theme";
import { SoundComponent } from "../../SoundComponent";

type SoundOptionsComponentProps = {
  color: string;
  volume: number;
  activeSound: SoundType;
  onSelectSound: (soundType: SoundType) => void;
};

export default function SoundOptionsComponent(
  props: SoundOptionsComponentProps,
) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: 0,
      }}
    >
      <Typography variant="h4">Sound</Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
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
        {soundCategoryOrder.map((category) => {
          const sounds = soundDefinitions.filter(
            (definition) => definition.category === category,
          );

          if (sounds.length === 0) return null;

          return (
            <Box
              key={category}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography variant="h5">
                {soundCategoryLabels[category]}
              </Typography>
              {sounds.map((sound) => (
                <SoundComponent
                  key={sound.soundType}
                  soundType={sound.soundType}
                  label={sound.label}
                  volume={props.volume}
                  activeSound={props.activeSound}
                  setActiveSound={props.onSelectSound}
                  color={props.color}
                />
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
