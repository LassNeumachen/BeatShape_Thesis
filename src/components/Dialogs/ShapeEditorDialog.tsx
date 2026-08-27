import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import { formatBeatValue } from "../../lib/helper/beatValueFormatter";

import ganzeNote from "../../assets/notes/Noten_Ganze_Note.svg";
import halbeNote from "../../assets/notes/Noten_Halbe_Note.svg";
import viertelNote from "../../assets/notes/Noten_Viertel_Note.svg";
import achtelNote from "../../assets/notes/Noten_Achtel_Note.svg";
import sechzehntelNote from "../../assets/notes/Noten_Sechzehntel_Note.svg";
import zweiunddreissigstelNote from "../../assets/notes/Noten_Zweiunddreißigstel_Note.svg";
import dottedImg from "../../assets/notes/Punktiert.svg";
import doubleDottedImg from "../../assets/notes/DoppeltPunktiert.svg";
import BeatlineWithNotes from "../BeatlineWithNotes";
import { appColors } from "../../theme";
import { alpha } from "@mui/material/styles";
import UndoIcon from "@mui/icons-material/Undo";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import FontDownloadOffIcon from "@mui/icons-material/FontDownloadOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { playSound } from "../../lib/audioEngine";
import type { Sound } from "../../types/sounds";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import BeatshapeTooltip from "../BeatshapeTooltip";
import dottedExplanation from "../../assets/explanations/Dotted_Explanation.svg";
import doubleDottedExplanation from "../../assets/explanations/DoubleDotted_Explanation.svg";

export type ShapeEditorProps = {
  open: boolean;
  onClose: () => void;
  createCustomShape: (beatValues: number[]) => void;
  color: string;
  bpm: number;
  sound: Sound;
};

const values: number[] = [1, 1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32];

export default function ShapeEditorDialog(props: ShapeEditorProps) {
  const [beatValue, setBeatValue] = useState(0);
  const [hoverdBeatValue, setHoveredBeatValue] = useState(0);
  const [beatValues, setBeatValues] = useState<number[]>([]);
  const [dotted, setDotted] = useState(false);
  const [doubleDotted, setDoubleDotted] = useState(false);
  const [beatlineMetrics, setBeatlineMetrics] = useState({
    segmentWidth: 0,
    containerWidth: 0,
    start: 0,
  });
  const [showFullValueName, setShowFullValueName] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [playheadStartAt, setPlayheadStartAt] = useState<number | null>(null);

  useEffect(() => {
    setHoveredBeatValue(beatValue);
  }, [beatValue]);

  function getBeatValueImage(value: number) {
    switch (value) {
      case 1:
        return ganzeNote;

      case 1 / 2:
        return halbeNote;

      case 1 / 4:
        return viertelNote;

      case 1 / 8:
        return achtelNote;

      case 1 / 16:
        return sechzehntelNote;

      case 1 / 32:
        return zweiunddreissigstelNote;

      default:
        return "";
    }
  }

  function addBeatValue(value: number) {
    if (dotted) {
      value += value / 2;
      setDotted(false);
    }

    if (doubleDotted) {
      value += value / 2 + value / 4;
      setDoubleDotted(false);
    }

    setBeatValue((current) => current + value);
    setBeatValues((prev) => [...prev, value]);
  }

  function addHoveredValue(value: number) {
    if (dotted) {
      value += value / 2;
    }

    if (doubleDotted) {
      value += value / 2 + value / 4;
    }
    setHoveredBeatValue((prev) => prev + value);
  }

  function manageDotting(singelDotting: boolean) {
    if (singelDotting) {
      setDotted(!dotted);
      setDoubleDotted(false);
    } else {
      setDoubleDotted(!doubleDotted);
      setDotted(false);
    }
  }

  function beatSlotSegmentWidthSetter(
    segmentWidth: number,
    containerWidth: number,
    start: number,
  ) {
    setBeatlineMetrics({
      segmentWidth,
      containerWidth,
      start,
    });
  }

  function getEffectiveBeatValue(value: number) {
    if (dotted) {
      return value + value / 2;
    }

    if (doubleDotted) {
      return value + value / 2 + value / 4;
    }

    return value;
  }

  function reset() {
    setBeatValue(0);
    setBeatValues([]);
    setDotted(false);
    setDoubleDotted(false);
  }

  function removeLastBeatValue() {
    setBeatValues((prev) => {
      const lastValue = prev[prev.length - 1];
      if (lastValue === undefined) return prev;

      setBeatValue((current) => current - lastValue);
      return prev.slice(0, -1);
    });
  }

  function reziproke(value: number) {
    return value ** -1;
  }

  function getBaseNoteName(value: number) {
    switch (value) {
      case 1:
        return "Ganze Note";
      case 1 / 2:
        return "Halbe Note";
      case 1 / 4:
        return "Viertelnote";
      case 1 / 8:
        return "Achtelnote";
      case 1 / 16:
        return "Sechzehntelnote";
      case 1 / 32:
        return "Zweiunddreissigstelnote";
      default:
        return formatBeatValue(value);
    }
  }

  function getFullBeatValueName(value: number) {
    const noteName = getBaseNoteName(value);

    if (dotted) {
      return `Punktierte ${noteName}`;
    }

    if (doubleDotted) {
      return `Doppelt punktierte ${noteName}`;
    }

    return noteName;
  }

  function getFullValueButtonWidth(label: string) {
    return Math.max(132, label.length * 8 + 68);
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function playBeat() {
    const beatMs = (60000 / (props.bpm * 60)) * 4;
    const startAt = performance.now();

    setPlayheadStartAt(startAt);
    setIsPreviewPlaying(true);

    for (const beatValue of beatValues) {
      playSound("shapeEditior", props.sound, 5);

      await sleep(beatMs * beatValue);
    }
    setIsPreviewPlaying(false);
  }

  return (
    <Dialog
      open={props.open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          reset();
          props.onClose();
        }
      }}
      PaperProps={{
        sx: {
          width: 650,
          maxWidth: "calc(100vw - 64px)",
          backgroundColor: appColors.background,
          borderRadius: 0,
          backdropFilter: "blur(20px)",
        },
      }}
    >
      <DialogTitle variant="h2">Neue Form Erstellen</DialogTitle>

      <Box sx={{ p: 3, pb: 0, pt: 3 }}>
        <BeatlineWithNotes
          beatValues={beatValues}
          height={130}
          showProgress={true}
          getBeatSlotSegment={beatSlotSegmentWidthSetter}
          color={props.color}
          popLastValue={removeLastBeatValue}
          hoveredValues={hoverdBeatValue}
          showPlayhead={true}
          playheadRunning={isPreviewPlaying}
          playheadColor={appColors.black}
          playheadLoopDuration={props.bpm}
          playheadSyncStartAt={playheadStartAt}
          beatNoationTooltip={true}
        ></BeatlineWithNotes>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${beatlineMetrics.start}px ${beatlineMetrics.segmentWidth}px ${beatlineMetrics.containerWidth - beatlineMetrics.start - beatlineMetrics.segmentWidth}px`,
            width: "100%",
          }}
        >
          <Box sx={{ pr: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                height: 30,
              }}
            >
              <Typography variant="h5">Punktieren</Typography>
              <BeatshapeTooltip
                title="Punktieren"
                imageSrc1={dottedExplanation}
                description1={
                  "Verlängert den ausgewählten Notenwert um die Hälfte oder um drei Viertel.\n\n Eine Viertelnote wird also durch eine einfach Punktierung um die hälfte verlänger.\n[Viertelnote + Achtelnote]"
                }
                imageSrc2={doubleDottedExplanation}
                description2={
                  "Eine Doppelt Punktierte Note wird noch ein weiteres mal um die Hälfte verlängert.\n[Viertelnote + Achtelnote + Sechzehntelnote]"
                }
                placement="top"
              >
                <HelpCenterIcon
                  sx={{
                    borderRadius: 0.95,
                    backgroundColor: appColors.black,
                    color: props.color,
                    fontSize: 20,
                    cursor: "help",
                    mb: 0.5,
                  }}
                />
              </BeatshapeTooltip>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <ToggleButton
                value="dotted"
                selected={dotted}
                onClick={() => manageDotting(true)}
                sx={{
                  backgroundColor: dotted ? props.color : appColors.background2,
                  border: `4px solid ${appColors.black}`,
                  "&:hover": {
                    backgroundColor: dotted
                      ? props.color
                      : alpha(props.color, 0.2),
                  },
                  "&.Mui-selected": {
                    backgroundColor: props.color,
                  },
                }}
              >
                <Box
                  component="img"
                  src={dottedImg}
                  sx={{
                    width: 20,
                    height: 50,
                    objectFit: "contain",
                  }}
                />
              </ToggleButton>

              <ToggleButton
                value="dotted"
                selected={doubleDotted}
                onClick={() => manageDotting(false)}
                sx={{
                  backgroundColor: doubleDotted
                    ? props.color
                    : appColors.background2,
                  border: `4px solid ${appColors.black}`,
                  "&:hover": {
                    backgroundColor: doubleDotted
                      ? props.color
                      : alpha(props.color, 0.2),
                  },
                  "&.Mui-selected": {
                    backgroundColor: props.color,
                  },
                }}
              >
                <Box
                  component="img"
                  src={doubleDottedImg}
                  sx={{
                    width: 20,
                    height: 50,
                    objectFit: "contain",
                  }}
                />
              </ToggleButton>
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                height: 30,
              }}
            >
              <Typography variant="h5">Notenwert auswählen</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "flex-start",
                maxHeight: 350,
                overflowY: "auto",
                pr: 1,
                scrollbarWidth: "thin",
                scrollbarColor: `${appColors.black} transparent`,
                "&::-webkit-scrollbar": {
                  width: 8,
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: appColors.black,
                  borderRadius: 0,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: appColors.lightBlack,
                },
              }}
            >
              {values.map((value) => {
                const effectiveValue = getEffectiveBeatValue(value);
                const noteBlockWidth =
                  beatlineMetrics.segmentWidth * effectiveValue;
                const fullValueName = getFullBeatValueName(value);
                const buttonWidth = Math.max(
                  noteBlockWidth,
                  showFullValueName
                    ? getFullValueButtonWidth(fullValueName)
                    : 74,
                );
                const disabeldButton = dotted
                  ? beatValue + value + value / 2 > 1 || value < 1 / 16
                  : doubleDotted
                    ? beatValue + value + value / 2 + value / 4 > 1 ||
                      value < 1 / 8
                    : beatValue + value > 1;

                return (
                  <Button
                    key={value}
                    disabled={disabeldButton}
                    onMouseEnter={() => {
                      addHoveredValue(value);
                    }}
                    onMouseLeave={() => {
                      setHoveredBeatValue(beatValue);
                    }}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      justifyContent: "start",
                      alignItems: "center",
                      p: 0,
                      minWidth: 0,
                      minHeight: 80,
                      border: disabeldButton
                        ? `4px solid ${alpha(appColors.black, 0.4)}`
                        : `4px solid ${appColors.black}`,
                      borderRight:
                        (dotted || doubleDotted) && value === 1
                          ? 0
                          : disabeldButton
                            ? `4px solid ${alpha(appColors.black, 0.4)}`
                            : `4px solid ${appColors.black}`,
                      borderRadius: 0,
                      width: buttonWidth,
                      backgroundColor: appColors.background2,
                      "&:hover": {},
                    }}
                    onClick={() => addBeatValue(value)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: noteBlockWidth,
                        backgroundColor: disabeldButton
                          ? alpha(props.color, 0.15)
                          : alpha(props.color, 0.5),
                        "&:hover": {
                          backgroundColor: alpha(props.color, 0.2),
                        },
                      }}
                    />

                    <Box
                      component="img"
                      src={getBeatValueImage(value)}
                      alt={formatBeatValue(value)}
                      sx={{
                        opacity: disabeldButton ? 0.4 : 1,
                        position: "relative",
                        zIndex: 1,
                        width: 40,
                        height: 40,
                        pointerEvents: "none",
                      }}
                    />

                    {showFullValueName ? (
                      <Typography
                        variant="h5"
                        sx={{
                          opacity: disabeldButton ? 0.4 : 1,
                          position: "absolute",
                          top: 8,
                          right: 8,
                          left: 52,
                          color: appColors.black,
                          zIndex: 4,
                          pointerEvents: "none",
                          textAlign: "right",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {fullValueName}
                      </Typography>
                    ) : (
                      value > 1 / 8 && (
                        <Typography
                          variant="h5"
                          sx={{
                            opacity: disabeldButton ? 0.4 : 1,
                            position: "absolute",
                            top: 8,
                            right: 22,
                            color: appColors.black,
                            zIndex: 4,
                            pointerEvents: "none",
                          }}
                        >
                          {value > 1 / 4 ? "Notenwert:" : "N.:"}
                        </Typography>
                      )
                    )}

                    {!showFullValueName && (
                      <Box
                        sx={{
                          opacity: disabeldButton ? 0.4 : 1,
                          position: "absolute",
                          top: 8,
                          right: 6,
                          zIndex: 4,
                          display: "flex",
                          flexDirection: "column",
                          pl: 1,
                        }}
                      >
                        {value === 1 && !(dotted || doubleDotted) ? (
                          <>
                            <Typography
                              variant="h2"
                              sx={{ color: appColors.black, zIndex: 4 }}
                            >
                              {value}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography
                              variant="h5"
                              sx={{ color: appColors.black, zIndex: 4 }}
                            >
                              {dotted ? 3 : doubleDotted ? 7 : 1}
                            </Typography>
                            <Box
                              sx={{
                                backgroundColor: appColors.black,
                                height: 4,
                                minWidth: 10,
                              }}
                            ></Box>
                            <Typography
                              variant="h4"
                              sx={{ color: appColors.black, zIndex: 4 }}
                            >
                              {dotted
                                ? reziproke(value / 2)
                                : doubleDotted
                                  ? reziproke(value / 4)
                                  : reziproke(value)}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  </Button>
                );
              })}
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="start"
            alignItems="end"
            flexDirection="column"
            sx={{ p: 0, mt: 1.3 }}
          >
            <Button
              onClick={playBeat}
              disabled={!(beatValue > 0) || isPreviewPlaying}
              sx={{
                p: 0,
                mt: 2.5,
                ml: 1,
                minWidth: 53,
                height: 53,
                backgroundColor: appColors.black,
                borderRadius: 0,
                color: appColors.white,
                "&:hover": {
                  backgroundColor: appColors.black,
                  color: props.color,
                },
                "&:disabled": {
                  color: alpha(appColors.white, 0.6),
                  backgroundColor: alpha(appColors.black, 0.6),
                },
              }}
            >
              {isPreviewPlaying ? (
                <VolumeUpIcon
                  sx={{
                    color: props.color,
                    fontSize: 45,
                  }}
                />
              ) : (
                <PlayArrowIcon
                  sx={{
                    color: "currentColor",
                    fontSize: 45,
                  }}
                />
              )}
            </Button>
            <Button
              disabled={!(beatValue > 0)}
              onClick={removeLastBeatValue}
              sx={{
                p: 0,
                mt: 1.2,
                ml: 1,
                minWidth: 53,
                height: 53,
                backgroundColor: appColors.black,
                borderRadius: 0,
                color: appColors.white,
                "&:hover": {
                  backgroundColor: appColors.black,
                  color: props.color,
                },
                "&:disabled": {
                  color: alpha(appColors.white, 0.6),
                  backgroundColor: alpha(appColors.black, 0.6),
                },
              }}
            >
              <UndoIcon
                sx={{
                  color: "currentColor",
                  fontSize: 45,
                }}
              />
            </Button>

            <Button
              onClick={() => reset()}
              disabled={!(beatValue > 0)}
              sx={{
                p: 0,
                mt: 1.2,
                ml: 1,
                minWidth: 53,
                height: 53,
                backgroundColor: appColors.black,
                borderRadius: 0,
                color: appColors.white,
                "&:hover": {
                  backgroundColor: appColors.black,
                  color: props.color,
                },
                "&:disabled": {
                  color: alpha(appColors.white, 0.6),
                  backgroundColor: alpha(appColors.black, 0.6),
                },
              }}
            >
              <RefreshIcon
                sx={{
                  color: "currentColor",
                  fontSize: 45,
                  transform: "scaleX(-1)",
                }}
              />
            </Button>

            <Button
              onClick={() => setShowFullValueName((prev) => !prev)}
              sx={{
                p: 0,
                mt: 1.2,
                ml: 1,
                minWidth: 53,
                height: 53,
                backgroundColor: appColors.black,
                borderRadius: 0,
                color: appColors.white,
                "&:hover": {
                  backgroundColor: appColors.black,
                  color: props.color,
                },
              }}
            >
              {showFullValueName ? (
                <FontDownloadIcon
                  sx={{
                    color: "currentColor",
                    fontSize: 35,
                  }}
                />
              ) : (
                <FontDownloadOffIcon
                  sx={{
                    color: "currentColor",
                    fontSize: 35,
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Box>
      <DialogActions sx={{ display: "flex", padding: 2.5 }}>
        <Button
          sx={{
            backgroundColor: appColors.black,
            borderRadius: 0,
            color: appColors.white,
            display: "flex",
            padding: 2,
            "&:hover": {
              color: props.color,
            },
          }}
          onClick={() => {
            props.onClose();
            reset();
          }}
        >
          Schließen
        </Button>
        <BeatshapeTooltip
          title={
            beatValue === 1
              ? "Beatshape erstellen"
              : "Takt noch nicht vollständig"
          }
          description1={
            beatValue === 1
              ? "Erstellt aus den gesetzten Noten eine neue Beatshape."
              : "Eine Beatshape kann erst erstellt werden, wenn der ganze 4/4-Takt gefüllt ist."
          }
          placement="top"
        >
          <span>
            <Button
              disabled={beatValue !== 1}
              sx={{
                backgroundColor: props.color,
                borderRadius: 0,
                color: appColors.black,
                display: "flex",
                padding: 2,
                "&.Mui-disabled": {
                  backgroundColor: alpha(props.color, 0.35),
                  color: alpha(appColors.black, 0.45),
                },
                "&:hover": {
                  color: appColors.white,
                },
              }}
              onClick={() => {
                props.createCustomShape(beatValues);
                reset();
              }}
            >
              Erstellen
            </Button>
          </span>
        </BeatshapeTooltip>
      </DialogActions>
    </Dialog>
  );
}
