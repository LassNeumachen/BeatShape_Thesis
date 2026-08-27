import ToggleButton from "@mui/material/ToggleButton";
import { Box, Typography } from "@mui/material";
import type { ActiveBeats } from "../types/shapes";
import { useState } from "react";
import { appColors } from "../theme";
import { alpha } from "@mui/material/styles";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import BeatshapeTooltip from "./BeatshapeTooltip";

type BeatSelectionProps = {
  color: string;
  value?: ActiveBeats;
  onChange?: (activeBeats: ActiveBeats) => void;
  onBeatSelect?: (index: number) => void;
  showOnly?: boolean;
  fontColor?: string;
  lightColor?: boolean;
};

export default function BeatSelectionComponent(props: BeatSelectionProps) {
  const [internalActiveBeats, setInternalActiveBeats] = useState<ActiveBeats>([
    true,
    true,
    true,
    true,
  ]);
  const activeBeats = props.value ?? internalActiveBeats;
  const activeColor = props.lightColor ? alpha(props.color, 0.5) : props.color;

  function changeActiveBeat(index: number) {
    if (props.showOnly) {
      props.onBeatSelect?.(index);
      return;
    }

    const newValue: ActiveBeats = [...activeBeats];
    newValue[index] = !activeBeats[index];

    if (props.onChange) {
      props.onChange(newValue);
    } else {
      setInternalActiveBeats(newValue);
    }
  }

  return (
    <Box sx={{ mt: props.showOnly ? 1 : 0, mb: props.showOnly ? 2 : 0 }}>
      {props.showOnly && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="h5">Aktiver Takt</Typography>
          <BeatshapeTooltip
            title="Aktiver Takt"
            description1={
              "Die Anzeige zeigt, in welchem der vier Takte du dich gerade befindest.\n\nDu kannst einen Takt anklicken, um direkt zu diesem Takt zu springen."
            }
            placement="top"
          >
            <HelpCenterIcon
              sx={{
                color: appColors.black,
                fontSize: 18,
                cursor: "help",
                mb: 0.4,
              }}
            />
          </BeatshapeTooltip>
        </Box>
      )}
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        }}
      >
        {activeBeats.map((isActive, index) => {
          const startsActiveBlock = isActive && !activeBeats[index - 1];
          const endsActiveBlock = isActive && !activeBeats[index + 1];

          return (
            <ToggleButton
              key={index}
              value={index}
              selected={isActive}
              onChange={() => changeActiveBeat(index)}
              aria-disabled={props.showOnly && !props.onBeatSelect}
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: 48,
                p: 1,
                borderRadius: 0,
                borderTop: isActive
                  ? `4px solid ${appColors.black}`
                  : `4px solid ${appColors.background}`,
                borderBottom: isActive
                  ? `4px solid ${appColors.black}`
                  : `4px solid ${appColors.background}`,
                borderLeft: startsActiveBlock
                  ? `4px solid ${appColors.black}`
                  : `4px solid ${appColors.background}`,
                borderRight: endsActiveBlock
                  ? `4px solid ${appColors.black}`
                  : `4px solid ${appColors.background}`,
                backgroundColor: isActive
                  ? activeColor
                  : alpha(props.color, 0.15),
                color: appColors.black,
                pointerEvents:
                  props.showOnly && !props.onBeatSelect ? "none" : "auto",
                cursor: props.onBeatSelect ? "pointer" : "default",
                "&.Mui-selected": {
                  backgroundColor: activeColor,
                  color: props.fontColor ?? appColors.black,
                },
                "&.Mui-selected:hover": {
                  backgroundColor: appColors.background,
                  color: appColors.black,
                },
                "&:hover": {
                  backgroundColor: appColors.background2,
                },
              }}
            >
              {index + 1}
            </ToggleButton>
          );
        })}
      </Box>
    </Box>
  );
}
