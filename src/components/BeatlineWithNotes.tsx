import { Box, LinearProgress } from "@mui/material";
import beatLine from "../assets/beatlines/Taktlinie.svg";
import beatLineLong from "../assets/beatlines/Taktlinie_long.svg";
import beatLineSyncopic from "../assets/beatlines/Taktlinie_Synkopisch.svg";
import beatLineSyncopic2 from "../assets/beatlines/Taktlinie_Synkopisch_2.svg";
import ganzeNote from "../assets/notes/Noten_Ganze_Note.svg";
import halbeNote from "../assets/notes/Noten_Halbe_Note.svg";
import viertelNote from "../assets/notes/Noten_Viertel_Note.svg";
import achtelNote from "../assets/notes/Noten_Achtel_Note.svg";
import achtelEnd from "../assets/notes/Noten_Achtel_End.svg";
import achtelEndLong from "../assets/notes/Noten_Achtel_End_Long.svg";
import sechzehntelNote from "../assets/notes/Noten_Sechzehntel_Note.svg";
import sechzehntelNoteEnd from "../assets/notes/Noten_Sechzehntel_Note_End.svg";
import sechzehntelNoteEndLong from "../assets/notes/Noten_Sechzehntel_Note_End_Long.svg";
import zweiunddreissigstelNote from "../assets/notes/Noten_Zweiunddreißigstel_Note.svg";
import zweiunddreissigstelNoteEnd from "../assets/notes/Noten_Zweiunddreißigstel_Note_End.svg";
import dotted from "../assets/notes/Punktiert.svg";
import doubleDotted from "../assets/notes/DoppeltPunktiert.svg";
import tieBow from "../assets/notes/Haltebogen.svg";
import tieBowExplanation from "../assets/explanations/Tie_Explanation.png";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { alpha } from "@mui/material/styles";
import { appColors } from "../theme";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import BeatshapeTooltip from "./BeatshapeTooltip";

type BeatlineWithNotesProps = {
  beatValues: number[];
  height?: number;
  showProgress: boolean;
  getBeatSlotSegment?: (
    sectionWidth: number,
    fullWidth: number,
    start: number,
  ) => void;
  color?: string;
  popLastValue?: () => void;
  hoveredValues?: number;
  showPlayhead?: boolean;
  playheadRunning?: boolean;
  playheadLoopDuration?: number;
  playheadSyncStartAt?: number | null;
  playheadColor?: string;
  beatNoationTooltip?: boolean;
  tieBowTolltip?: boolean;
  useRotatedValues?: boolean;
  rotatedValues?: number[];
  useDefaultBeatline?: boolean;
  notePlacements?: BeatlineNotePlacement[] | undefined;
  beatlinesForPreview?: boolean;
};

type NoteImageData = {
  noteSrc: string;
  dotSrc?: string;
};

export type BeatlineNotePlacement = {
  value: number;
  slot: number;
  visualSlot?: number;
  tie?: "toNext" | "fromPrevious";
  isSplitPart?: boolean;
  splitPartIndex?: number;
  splitPartCount?: number;
};

type RenderedBeatlineNote = {
  value: number;
  index: number;
  placement: BeatlineNotePlacement | undefined;
  slot: number;
  isOutside: boolean;
  notationIndex: number | null;
};

type TieBowMetrics = {
  left: number;
  width: number;
};

function BeatlineWithNotes(props: BeatlineWithNotesProps) {
  const beatValuesToShow =
    props.notePlacements && props.notePlacements.length > 0
      ? props.notePlacements.map((placement) => placement.value)
      : props.useRotatedValues &&
          props.rotatedValues &&
          props.rotatedValues.length > 0
        ? props.rotatedValues
        : props.beatValues;
  const useDefaultBeatline = props.useDefaultBeatline ?? true;
  const height = props.height ?? 90;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beatSlotsSegment, setBeatSlotsSegment] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });
  const [beatSpace, setBeatSpace] = useState<number>(0);
  const availableSlots: number = 32;
  const cordsForNotes = useMemo(
    () =>
      props.notePlacements && props.notePlacements.length > 0
        ? props.notePlacements.map((placement) => placement.slot)
        : getNoteScaleAndPosition(beatValuesToShow),
    [beatValuesToShow, props.notePlacements],
  );
  const smallestValue = useMemo(
    () => (beatValuesToShow.length > 0 ? Math.min(...beatValuesToShow) : 0),
    [beatValuesToShow],
  );

  const noteLayout = useMemo(
    () => getNoteLayout(height),
    [height, smallestValue],
  );
  const tieBowStartOffset = noteLayout.height * 0.14;
  const beatValue = useMemo(
    () => beatValuesToShow.reduce((sum, value) => sum + value, 0),
    [beatValuesToShow],
  );
  const renderedNotes = useMemo<RenderedBeatlineNote[]>(() => {
    let notationIndex = 0;

    return beatValuesToShow.map((value, index) => {
      const placement = props.notePlacements?.[index];
      const slot =
        placement?.visualSlot ?? placement?.slot ?? cordsForNotes[index] ?? 0;
      const isOutside = placement
        ? placement.slot < 0 || placement.slot >= 32
        : false;
      const currentNotationIndex = isOutside ? null : notationIndex;

      if (!isOutside) {
        notationIndex++;
      }

      return {
        value,
        index,
        placement,
        slot,
        isOutside,
        notationIndex: currentNotationIndex,
      };
    });
  }, [beatValuesToShow, cordsForNotes, props.notePlacements]);
  const valuesForNotation = useMemo(
    () =>
      renderedNotes.filter((note) => !note.isOutside).map((note) => note.value),
    [renderedNotes],
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    function updateSize() {
      const rect = element.getBoundingClientRect();
      const width = rect.width;

      const start = width * 0.22;
      const end = width * 0.88;
      const space = end - start;

      setContainerWidth(width);
      if (props.getBeatSlotSegment) {
        props.getBeatSlotSegment(space, width, start);
      }
      setBeatSlotsSegment({ start, end });
      setBeatSpace(space);
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      !props.showPlayhead ||
      !props.playheadRunning ||
      props.playheadSyncStartAt === null ||
      props.playheadSyncStartAt === undefined ||
      props.playheadLoopDuration === undefined ||
      props.playheadLoopDuration <= 0
    ) {
      if (playheadRef.current) {
        playheadRef.current.style.transform = "translateX(-50%)";
      }
      return;
    }

    let animationFrameId = 0;

    function updatePlayhead() {
      const syncStartAt = props.playheadSyncStartAt;
      const loopDuration = props.playheadLoopDuration;

      if (
        syncStartAt === null ||
        syncStartAt === undefined ||
        loopDuration === undefined ||
        loopDuration <= 0
      ) {
        return;
      }

      const elapsedSeconds = (performance.now() - syncStartAt) / 1000;
      const progress =
        elapsedSeconds < 0 ? 0 : (elapsedSeconds % loopDuration) / loopDuration;

      if (playheadRef.current) {
        playheadRef.current.style.transform = `translateX(${beatSpace * progress}px) translateX(-50%)`;
      }

      animationFrameId = requestAnimationFrame(updatePlayhead);
    }

    updatePlayhead();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    props.showPlayhead,
    props.playheadRunning,
    props.playheadLoopDuration,
    props.playheadSyncStartAt,
    beatSpace,
  ]);

  function getPositionInSameValueBlock(
    index: number,
    values: number[],
    blockSize: number,
  ) {
    const value = values[index];
    if (value === undefined) return 0;

    let streakLength = 0;

    for (let i = index; i >= 0; i--) {
      if (values[i] !== value) {
        break;
      }

      streakLength++;
    }

    return ((streakLength - 1) % blockSize) + 1;
  }

  function isEighthEnd(index: number, values: number[]) {
    return getPositionInSameValueBlock(index, values, 2) === 2;
  }

  function isSixteenthEnd(index: number, values: number[]) {
    const positionInBlock = getPositionInSameValueBlock(index, values, 4);
    return positionInBlock > 1;
  }

  function isThirtySecondEnd(index: number, values: number[]) {
    const positionInBlock = getPositionInSameValueBlock(index, values, 8);

    return positionInBlock > 1;
  }

  function getBeatValueImage(
    value: number,
    index: number,
    values: number[],
  ): NoteImageData {
    switch (value) {
      case 1:
        return { noteSrc: ganzeNote };

      case 1 / 2:
        return { noteSrc: halbeNote };
      case 3 / 4:
        return { noteSrc: halbeNote, dotSrc: dotted };
      case 7 / 8:
        return { noteSrc: halbeNote, dotSrc: doubleDotted };
      case 1 / 4:
        return { noteSrc: viertelNote };
      case 3 / 8:
        return { noteSrc: viertelNote, dotSrc: dotted };
      case 7 / 16:
        return { noteSrc: viertelNote, dotSrc: doubleDotted };
      case 1 / 8:
        return isEighthEnd(index, values)
          ? smallestValue > 1 / 32
            ? { noteSrc: achtelEnd }
            : { noteSrc: achtelEndLong }
          : { noteSrc: achtelNote };
      case 3 / 16:
        return { noteSrc: achtelNote, dotSrc: dotted };
      case 7 / 32:
        return { noteSrc: achtelNote, dotSrc: doubleDotted };
      case 1 / 16:
        return isSixteenthEnd(index, values)
          ? smallestValue > 1 / 32
            ? { noteSrc: sechzehntelNoteEnd }
            : { noteSrc: sechzehntelNoteEndLong }
          : { noteSrc: sechzehntelNote };
      case 3 / 32:
        return { noteSrc: sechzehntelNote, dotSrc: dotted };
      case 1 / 32:
        return isThirtySecondEnd(index, values)
          ? { noteSrc: zweiunddreissigstelNoteEnd }
          : { noteSrc: zweiunddreissigstelNote };

      default:
        return { noteSrc: "" };
    }
  }

  function getNoteXShift(src: string) {
    switch (src) {
      case achtelEnd:
        return -containerWidth / 22;
      case achtelEndLong:
        return -containerWidth / 16;
      case sechzehntelNoteEnd:
        return -containerWidth / 68;
      case sechzehntelNoteEndLong:
        return -containerWidth / 41;
      case zweiunddreissigstelNoteEnd:
        return -containerWidth / 700;
      default:
        return 0;
    }
  }

  function getNoteScaleAndPosition(values: number[]) {
    let slotProgress = 0;
    return values.map((value) => {
      const position = slotProgress;
      const slot = availableSlots * value;
      slotProgress += slot;
      return position;
    });
  }

  function getNoteLayout(containerHeight: number) {
    if (smallestValue === 0) {
      return { top: 0, height: 0 };
    }

    if (smallestValue > 1 / 16) {
      return { top: -containerHeight * 0.08, height: containerHeight * 0.73 };
    } else if (smallestValue > 1 / 32) {
      return { top: containerHeight * 0.16, height: containerHeight * 0.48 };
    } else {
      return { top: containerHeight * 0.28, height: containerHeight * 0.3 };
    }
  }

  function getSlotX(slot: number) {
    return beatSlotsSegment.start + (beatSpace * slot) / availableSlots;
  }

  function getTieBowWidth(fromX: number, toX: number) {
    const result = Math.max(beatSpace / 16, toX - fromX);
    return result;
  }

  function getRenderedNoteImageData(note: RenderedBeatlineNote) {
    const notationValues = note.isOutside ? [note.value] : valuesForNotation;

    return getBeatValueImage(
      note.value,
      note.notationIndex ?? 0,
      notationValues,
    );
  }

  function getRenderedNoteLeft(note: RenderedBeatlineNote, noteSrc?: string) {
    const src = noteSrc ?? getRenderedNoteImageData(note).noteSrc;
    return getSlotX(note.slot) + getNoteXShift(src);
  }

  function getLastSplitNoteInGroup(index: number, note: RenderedBeatlineNote) {
    const placement = note.placement;

    if (
      !placement?.isSplitPart ||
      placement.splitPartIndex === undefined ||
      placement.splitPartCount === undefined
    ) {
      return note;
    }

    const lastIndex =
      index + placement.splitPartCount - placement.splitPartIndex - 1;

    return renderedNotes[lastIndex] ?? note;
  }

  function getTieTargetNote(index: number) {
    for (
      let nextIndex = index + 1;
      nextIndex < renderedNotes.length;
      nextIndex++
    ) {
      const candidate = renderedNotes[nextIndex];

      if (candidate?.placement?.tie === "fromPrevious") {
        return getLastSplitNoteInGroup(nextIndex, candidate);
      }
    }

    const nextNote = renderedNotes[index + 1];

    return nextNote ? getLastSplitNoteInGroup(index + 1, nextNote) : undefined;
  }

  function getTieBowMetrics(
    note: RenderedBeatlineNote,
    noteLeft: number,
  ): TieBowMetrics | null {
    if (note.placement?.tie !== "toNext") {
      return null;
    }

    const targetNote = getTieTargetNote(note.index);
    const startX = noteLeft + tieBowStartOffset;
    const endX =
      targetNote !== undefined
        ? getRenderedNoteLeft(targetNote)
        : noteLeft + (beatSpace * 4) / availableSlots;

    return {
      left: tieBowStartOffset,
      width: getTieBowWidth(startX, endX),
    };
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 200,
        maxWidth: 600,
        height,
      }}
    >
      {props.beatNoationTooltip && (
        <Box
          sx={{
            position: "absolute",
            top: 26,
            left: "11%",
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <BeatshapeTooltip
            title="4/4-Takt"
            description1={
              "Ein 4/4-Takt ist ein Takt mit vier Grundschlägen.\n\nDie obere 4 bedeutet: Es gibt vier Schläge im Takt.\n\nDie untere 4 bedeutet: Eine Viertelnote zählt als ein Schlag. Der Takt kann also mit vier Viertelnoten ausgefüllt werden"
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
      )}
      {props.tieBowTolltip && (
        <Box
          sx={{
            position: "absolute",
            top: -6,
            left: 2,
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <BeatshapeTooltip
            title="Haltebögen"
            description1={
              "So können auch Notendauern dargestellt werden, für die kein einzelner passender Notenwert zur Verfügung steht.\n\nBeispiel:\n\n"
            }
            imageSrc1={tieBowExplanation}
            description2={
              "So können auch Notenwerte dargestellt werden, die mit einer einzelnen Note oder Punktierung nicht gut passen.\n\n" +
              "Der Bereich vor dem Takt hilft bei verschobenen Rhythmen: Manche Noten beginnen eigentlich schon vor dem sichtbaren Takt und werden mit einem Haltebogen hineingezogen. Das ist typisch für synkopische Rhythmen, also Rhythmen, die gegen die erwarteten Zählzeiten verschoben sind."
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
      )}
      {/* Taktlinie */}
      <Box
        sx={{
          position: "absolute",
          left: useDefaultBeatline || props.beatlinesForPreview ? "5%" : 0,
          right: useDefaultBeatline || props.beatlinesForPreview ? "5%" : 0,
          top:
            useDefaultBeatline || props.beatlinesForPreview
              ? height! * 0.2
              : height! * 0.23,
        }}
        component="img"
        src={
          useDefaultBeatline
            ? props.beatlinesForPreview
              ? beatLineLong
              : beatLine
            : props.beatlinesForPreview
              ? beatLineSyncopic2
              : beatLineSyncopic
        }
      />

      {props.showProgress && (
        <>
          <LinearProgress
            variant="determinate"
            value={Math.min(beatValue * 100, 100)}
            sx={{
              position: "absolute",
              width: beatSpace,
              height: 110,
              left: beatSlotsSegment.start,
              top: -20,
              zIndex: 0,
              backgroundColor: "rgba(150,150,150,0.12)",

              "& .MuiLinearProgress-bar": {
                backgroundColor: alpha(props.color ?? appColors.green, 0.6),
              },
            }}
          />

          {props.hoveredValues !== undefined && (
            <LinearProgress
              variant="determinate"
              value={props.hoveredValues * 100}
              sx={{
                position: "absolute",
                width: beatSpace,
                height: 110,
                left: beatSlotsSegment.start,
                top: -20,
                zIndex: 0,
                backgroundColor: "rgba(150,150,150,0.0)",

                "& .MuiLinearProgress-bar": {
                  backgroundColor: alpha(props.color ?? appColors.green, 0.25),
                },
              }}
            />
          )}

          <Box
            onClick={() => props.popLastValue?.()}
            sx={{
              position: "absolute",
              width: beatSpace,
              height: 110,
              left: beatSlotsSegment.start,
              top: -20,
              zIndex: 3,
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
          />
        </>
      )}

      {props.showPlayhead && props.playheadRunning && (
        <Box
          ref={playheadRef}
          sx={{
            position: "absolute",
            left: beatSlotsSegment.start,
            top: -20,
            width: 3,
            height: 110,
            transform: "translateX(-50%)",
            backgroundColor: props.playheadColor ?? appColors.black,
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Noten */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          zIndex: 1,
        }}
      >
        {containerWidth > 0 &&
          renderedNotes.map((note) => {
            const noteInfo = getRenderedNoteImageData(note);

            if (!noteInfo.noteSrc) return null;
            const noteLeft = getRenderedNoteLeft(note, noteInfo.noteSrc);
            const tieBowMetrics = getTieBowMetrics(note, noteLeft);

            return (
              <Box
                key={`${note.value}-${note.index}-${note.slot}`}
                sx={{
                  position: "absolute",
                  top: noteLayout.top,
                  left: noteLeft,
                  height: noteLayout.height,
                }}
              >
                {tieBowMetrics && (
                  <Box
                    component="img"
                    src={tieBow}
                    sx={{
                      position: "absolute",
                      left: tieBowMetrics.left,
                      top: noteLayout.height,
                      width: tieBowMetrics.width,
                      objectFit: "fill",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <Box
                  component="img"
                  src={noteInfo.noteSrc}
                  sx={{
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
                {noteInfo.dotSrc && (
                  <Box
                    component="img"
                    src={noteInfo.dotSrc}
                    sx={{
                      position: "absolute",
                      height: "100%",
                      left: noteLayout.height * 0.35,
                    }}
                  ></Box>
                )}
              </Box>
            );
          })}
      </Box>
    </Box>
  );
}

export default memo(BeatlineWithNotes);
