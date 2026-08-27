import { Box, Button, IconButton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { memo, type Dispatch, type SetStateAction } from "react";
import MetronomeComponent from "../../MetronomeComponent";
import BeatSelectionComponent from "../../BeatSelectionComponent";
import SliderComponent from "../../SliderComponent";
import { appColors } from "../../../theme";
import type { ActiveBeats } from "../../../types/shapes";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import BeatshapeTooltip from "../../BeatshapeTooltip";

type SettingsPanelComponentProps = {
  settingsPanelOpen: boolean;
  setSettingsPanelOpen: Dispatch<SetStateAction<boolean>>;
  activeBeat: number;
  onStartStop: () => void;
  play: boolean;
  beatProgress: ActiveBeats;
  selectBeatNumber: (index: number) => void;
  bpm: number;
  setNewSpeed: (speed: number) => void;
  volume: number;
  changeVolume: (value: number) => void;
  showPitchlines: boolean;
  setPitchlineVisable: () => void;
};

function SettingsPanelComponent({
  settingsPanelOpen,
  setSettingsPanelOpen,
  activeBeat,
  onStartStop,
  play,
  beatProgress,
  selectBeatNumber,
  bpm,
  setNewSpeed,
  volume,
  changeVolume,
  showPitchlines,
  setPitchlineVisable,
}: SettingsPanelComponentProps) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
      }}
    >
      <Box
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        sx={{
          pointerEvents: settingsPanelOpen ? "auto" : "none",
          position: "relative",
          width: settingsPanelOpen ? "100%" : 45,
          height: settingsPanelOpen ? "auto" : 45,
          minHeight: 45,
          marginLeft: "auto",
          overflow: "hidden",
          boxSizing: "border-box",
          p: settingsPanelOpen ? 3 : 0,
          alignItems: "center",
          rowGap: 3,
          backgroundColor: alpha(appColors.background, 0.5),
          boxShadow: 3,
          backdropFilter: "blur(8px)",
          transition: "width 180ms ease, height 180ms ease",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Box sx={{ mt: -1.7, ml: -1.2 }}>
            <Typography variant="h2">Einstellungen</Typography>
          </Box>
          <IconButton
            onClick={() => setSettingsPanelOpen((prev) => !prev)}
            sx={{
              pointerEvents: "auto",
              position: "absolute",
              top: 0,
              right: 0,
              width: 45,
              height: 45,
              borderRadius: 0,
              backgroundColor: settingsPanelOpen
                ? alpha(appColors.background, 0.1)
                : appColors.black,
              color: settingsPanelOpen ? appColors.black : appColors.white,
              "&:hover": {
                backgroundColor: appColors.black,
                color: appColors.white,
              },
            }}
          >
            {settingsPanelOpen ? (
              <ArrowForwardIosIcon sx={{ fontSize: 25 }} />
            ) : (
              <SettingsIcon sx={{ fontSize: 25 }} />
            )}
          </IconButton>
        </Box>
        <MetronomeComponent
          activeBeat={activeBeat}
          onStartStop={onStartStop}
          play={play}
        />
        <BeatSelectionComponent
          color={appColors.black}
          value={beatProgress}
          fontColor={appColors.white}
          onBeatSelect={selectBeatNumber}
          showOnly
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="h5">BPM</Typography>
          <BeatshapeTooltip
            title="BPM"
            description1={
              "BPM bedeutet Beats per Minute.\n\nJe höher der Wert ist, desto schneller bewegen sich die Marker und desto schneller laufen die Takte."
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
        <SliderComponent
          value={bpm}
          min={60}
          max={220}
          valueLabelDisplay="on"
          color={appColors.black}
          marks={[]}
          setValue={setNewSpeed}
          commitOnRelease
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            gap: 2,
          }}
        >
          <Typography variant="h5">Lautstärke</Typography>
          {volume === 0 && <VolumeOffIcon sx={{ fontSize: 20, pb: 0.2 }} />}
        </Box>
        <SliderComponent
          value={volume}
          min={0}
          max={100}
          valueLabelDisplay="auto"
          color={appColors.black}
          marks={[]}
          setValue={changeVolume}
        />
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="h5">Pitchabteile</Typography>
            <BeatshapeTooltip
              title="Pitchtabelle"
              description1={
                "Die Pitchabteile teilen die Stage horizontal in Tonhöhenbereiche.\n\nJe höher eine Shape liegt, desto höher kann ihr Sound auf der pentatonischen Leiter gepitcht werden.\n\nDie Zahlen auf der Linken seite der Abteile zeigen an um wie viele Halbtöne der Sound von dem ausgegangen wird verändert wird."
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
          <Box sx={{ display: "flex" }}>
            <Button
              fullWidth
              onClick={setPitchlineVisable}
              startIcon={
                showPitchlines ? <VisibilityIcon /> : <VisibilityOffIcon />
              }
              sx={{
                justifyContent: "flex-start",
                color: appColors.black,
                backgroundColor: alpha(appColors.black, 0.08),
              }}
            >
              {showPitchlines
                ? "Pitchabteile ausblenden"
                : "Pitchtabteile anzeigen"}
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} />
      </Box>
    </Box>
  );
}

export default memo(SettingsPanelComponent);
