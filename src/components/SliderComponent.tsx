import Slider from "@mui/material/Slider";
import { appColors } from "../theme";
import { useEffect, useState } from "react";

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  valueLabelDisplay: "on" | "off" | "auto";
  color: string;
  marks: { value: number; label: string }[];
  setValue: (value: number) => void;
  step?: number;
  commitOnRelease?: boolean;
};

export default function SliderComponent(props: SliderProps) {
  const [displayValue, setDisplayValue] = useState(props.value);

  useEffect(() => {
    setDisplayValue(props.value);
  }, [props.value]);

  function getNumberValue(value: number | number[]) {
    return Array.isArray(value) ? value[0]! : value;
  }

  function handleChange(value: number | number[]) {
    const nextValue = getNumberValue(value);
    setDisplayValue(nextValue);

    if (!props.commitOnRelease) {
      props.setValue(nextValue);
    }
  }

  function handleChangeCommitted(value: number | number[]) {
    if (!props.commitOnRelease) return;

    props.setValue(getNumberValue(value));
  }

  return (
    <Slider
      value={displayValue}
      onChange={(_, value) => handleChange(value)}
      onChangeCommitted={(_, value) => handleChangeCommitted(value)}
      min={props.min}
      max={props.max}
      step={props.step ?? 1}
      marks={props.marks}
      valueLabelDisplay={props.valueLabelDisplay}
      valueLabelFormat={(value) => `${value}`}
      sx={{
        width: 230,
        color:
          props.color === appColors.black ? appColors.white : appColors.black,

        "& .MuiSlider-rail": {
          height: 8,
          opacity: 1,
          backgroundColor: appColors.black,
          borderRadius: 0,
        },

        "& .MuiSlider-track": {
          height: 8,
          backgroundColor: appColors.black,
          border: "none",
          borderRadius: 0,
        },

        "& .MuiSlider-thumb": {
          width: 30,
          height: 30,
          backgroundColor:
            props.color === appColors.black ? appColors.grey : props.color,
          boxShadow: "none",
          border: "none",
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "none",
          },
        },

        "& .MuiSlider-valueLabel": {
          backgroundColor:
            props.color === appColors.black ? appColors.grey : props.color,
          color: appColors.black,
          fontFamily: '"Inter", sans-serif',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
          borderRadius: 0,
          padding: "2px 8px",
          top: -6,
        },

        "& .MuiSlider-valueLabel::before": {
          display: "none",
        },
      }}
    />
  );
}
