import { Box, Typography } from "@mui/material";
import Tooltip, { type TooltipProps } from "@mui/material/Tooltip";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { appColors } from "../theme";

type BeatshapeTooltipProps = Omit<
  TooltipProps,
  | "title"
  | "open"
  | "onOpen"
  | "onClose"
  | "disableHoverListener"
  | "disableFocusListener"
  | "disableTouchListener"
> & {
  title: string;
  description1?: string;
  description2?: string;
  imageSrc1?: string;
  imageSrc2?: string;
};

export default function BeatshapeTooltip(props: BeatshapeTooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const {
    title,
    description1,
    description2,
    imageSrc1,
    imageSrc2,
    placement = "left",
    arrow = true,
    children,
    ...rest
  } = props;

  const tooltipTitle = description1 ? (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Staatliches", sans-serif',
          fontSize: 18,
          color: appColors.white,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 12,
          color: appColors.white,
          opacity: 0.8,
          whiteSpace: "pre-line",
        }}
      >
        {description1}
      </Typography>

      {imageSrc1 && (
        <Box
          component="img"
          src={imageSrc1}
          alt=""
          sx={{
            display: "block",
            width: 140,
            mt: 2,
            mb: 2,
            ml: 1.5,
          }}
        />
      )}

      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 12,
          color: appColors.white,
          opacity: 0.8,
          whiteSpace: "pre-line",
          mt: 1,
        }}
      >
        {description2}
      </Typography>

      {imageSrc2 && (
        <Box
          component="img"
          src={imageSrc2}
          alt=""
          sx={{
            display: "block",
            width: 140,
            mt: 2,
            mb: 3,
            ml: 1.5,
          }}
        />
      )}
    </Box>
  ) : (
    title
  );

  function toggleTooltip(event: MouseEvent<HTMLSpanElement>) {
    event.stopPropagation();
    setOpen((currentOpen) => !currentOpen);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.stopPropagation();
    setOpen((currentOpen) => !currentOpen);
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && triggerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    document.addEventListener("keydown", closeOnEscape, true);

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOnOutsidePointerDown,
        true,
      );
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [open]);

  return (
    <Tooltip
      open={open}
      title={tooltipTitle}
      placement={placement}
      arrow={arrow}
      disableHoverListener
      disableFocusListener
      disableTouchListener
      slotProps={{
        tooltip: {
          sx: {
            fontFamily: '"Inter", sans-serif',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: appColors.black,
            color: appColors.white,
            borderRadius: 0,
          },
        },
        arrow: {
          sx: {
            color: appColors.black,
          },
        },
      }}
      {...rest}
    >
      <Box
        component="span"
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={toggleTooltip}
        onKeyDown={handleKeyDown}
        sx={{ display: "inline-flex", alignItems: "center" }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
