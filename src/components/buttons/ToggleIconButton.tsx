import IconButton from "@mui/material/IconButton";
import { appColors } from "../../theme";
import type { SvgIconComponent } from "@mui/icons-material";

export type ToggleButtonProps = {
  setRunning: () => void;
  running?: boolean;
  iconOne: SvgIconComponent;
  iconTwo?: SvgIconComponent;
  size: number;
  noPadding?: boolean;
  paddingRight?: number;
  paddingBottom?: number;
  color?: string;
};

export default function ToggleIconButton(props: ToggleButtonProps) {
  const Icon =
    props.running === undefined || props.iconTwo === undefined
      ? props.iconOne
      : props.running
        ? props.iconOne
        : props.iconTwo;

  return (
    <IconButton
      disableRipple
      onClick={props.setRunning}
      sx={{
        padding: props.noPadding ? 0 : 1,
        paddingRight: props.paddingRight ?? 0,
        paddingBottom: props.paddingBottom ?? 0,
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
        },
      }}
    >
      <Icon
        sx={{
          fontSize: props.size,
          color: props.color ?? appColors.black,
        }}
      />
    </IconButton>
  );
}
