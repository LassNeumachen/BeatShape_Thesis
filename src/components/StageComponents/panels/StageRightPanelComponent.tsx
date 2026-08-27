import { Box } from "@mui/material";
import { memo, type Dispatch, type SetStateAction } from "react";
import type { ActiveBeats, BeatShape } from "../../../types/shapes";
import SettingsPanelComponent from "./SettingsPanelComponent";
import ShapePanelComponent from "./ShapePanelComponent";
import ImportExportPanelComponent from "./ImportExportPanelComponent";

type StageRightPanelComponentProps = {
  settingsPanelOpen: boolean;
  setSettingsPanelOpen: Dispatch<SetStateAction<boolean>>;
  shapePanelOpen: boolean;
  setShapePanelOpen: Dispatch<SetStateAction<boolean>>;
  importExportPanelOpen: boolean;
  setImportExportPanelOpen: Dispatch<SetStateAction<boolean>>;
  activeBeat: number;
  onStartStop: () => void;
  play: boolean;
  beatProgress: ActiveBeats;
  selectBeatNumber: (index: number) => void;
  bpm: number;
  setNewSpeed: (speed: number) => void;
  volume: number;
  changeVolume: (value: number) => void;
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
  showPitchlines: boolean;
  setShowPitchlines: () => void;
  onExportCode: () => void;
  onImportCode: () => void;
  onExportLink: () => void;
};

function StageRightPanelComponent({
  settingsPanelOpen,
  setSettingsPanelOpen,
  shapePanelOpen,
  setShapePanelOpen,
  importExportPanelOpen,
  setImportExportPanelOpen,
  activeBeat,
  onStartStop,
  play,
  beatProgress,
  selectBeatNumber,
  bpm,
  setNewSpeed,
  volume,
  changeVolume,
  shapes,
  setPaused,
  setShapeMuted,
  setVisibility,
  deleteShapeFromList,
  manageEditShapeDialog,
  reorderShapes,
  showPitchlines,
  setShowPitchlines,
  onExportCode,
  onImportCode,
  onExportLink,
}: StageRightPanelComponentProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 4,
        bottom: 16,
        right: 16,
        zIndex: 10,
        width: 315,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 2,
        pointerEvents: "none",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end" }} />

      <SettingsPanelComponent
        settingsPanelOpen={settingsPanelOpen}
        setSettingsPanelOpen={setSettingsPanelOpen}
        activeBeat={activeBeat}
        onStartStop={onStartStop}
        play={play}
        beatProgress={beatProgress}
        selectBeatNumber={selectBeatNumber}
        bpm={bpm}
        setNewSpeed={setNewSpeed}
        volume={volume}
        changeVolume={changeVolume}
        showPitchlines={showPitchlines}
        setPitchlineVisable={setShowPitchlines}
      />

      <ShapePanelComponent
        shapePanelOpen={shapePanelOpen}
        setShapePanelOpen={setShapePanelOpen}
        shapes={shapes}
        setPaused={setPaused}
        setShapeMuted={setShapeMuted}
        setVisibility={setVisibility}
        deleteShapeFromList={deleteShapeFromList}
        manageEditShapeDialog={manageEditShapeDialog}
        reorderShapes={reorderShapes}
      />

      <ImportExportPanelComponent
        importExportPanelOpen={importExportPanelOpen}
        setImportExportPanelOpen={setImportExportPanelOpen}
        onExportCode={onExportCode}
        onImportCode={onImportCode}
        onExportLink={onExportLink}
      />
    </Box>
  );
}

export default memo(StageRightPanelComponent);
