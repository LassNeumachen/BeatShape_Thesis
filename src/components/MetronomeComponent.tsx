import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import paper from "paper";
import { appColors } from "../theme";
import ToggleIconButton from "./buttons/ToggleIconButton";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { alpha } from "@mui/material/styles";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import BeatshapeTooltip from "./BeatshapeTooltip";

type MetronomeProps = {
  activeBeat: number;
  onStartStop: () => void;
  play: boolean;
};

export default function MetronomeComponent({
  activeBeat,
  onStartStop,
  play,
}: MetronomeProps) {
  const metronomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const circlesRef = useRef<paper.Path.Circle[]>([]);
  const scopeRef = useRef<paper.PaperScope | null>(null);
  const r = 25;
  const componentWidth = 267;
  const circleSection = componentWidth / 4;
  const height = 60;
  useEffect(() => {
    if (!metronomCanvasRef.current) return;

    const scope = new paper.PaperScope();
    scope.setup(metronomCanvasRef.current);
    scopeRef.current = scope;
    scope.project.clear();

    circlesRef.current = [
      new scope.Path.Circle({
        center: [circleSection / 2, height / 2],
        radius: r,
        fillColor: activeColor(scope),
      }),
      new scope.Path.Circle({
        center: [circleSection + circleSection / 2, height / 2],
        radius: r,
        fillColor: inactiveColor(scope),
      }),
      new scope.Path.Circle({
        center: [2 * circleSection + circleSection / 2, height / 2],
        radius: r,
        fillColor: inactiveColor(scope),
      }),
      new scope.Path.Circle({
        center: [3 * circleSection + circleSection / 2, height / 2],
        radius: r,
        fillColor: inactiveColor(scope),
      }),
    ];

    return () => {
      scope.project.clear();
      circlesRef.current = [];
    };
  }, []);

  useEffect(() => {
    setActiveBeat(activeBeat);
  }, [activeBeat]);

  function activeColor(scope: paper.PaperScope) {
    return new scope.Color(appColors.black);
  }

  function inactiveColor(scope: paper.PaperScope) {
    return new scope.Color(alpha(appColors.black, 0.15));
  }

  function setActiveBeat(index: number) {
    const scope = scopeRef.current;
    if (!scope) return;

    circlesRef.current.forEach((circle, i) => {
      circle.fillColor =
        i === index ? activeColor(scope) : inactiveColor(scope);
    });
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="h5">Metronom</Typography>
        <BeatshapeTooltip
          title="Metronom"
          description1={"Das Metronom zeigt den aktuellen Schlag im Takt."}
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

      <Box sx={{ position: "relative", width: componentWidth, height }}>
        <canvas
          ref={metronomCanvasRef}
          id="metronom"
          width={componentWidth}
          height={height}
        />
        <Box
          sx={{
            position: "absolute",
            left: circleSection / 2,
            top: height / 2 + 3.5,
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <ToggleIconButton
            setRunning={onStartStop}
            running={play}
            size={50}
            iconOne={PauseIcon}
            iconTwo={PlayArrowIcon}
            noPadding={true}
            paddingBottom={1}
            color={activeBeat === 0 ? appColors.background : appColors.black}
          />
        </Box>
      </Box>
    </Box>
  );
}
