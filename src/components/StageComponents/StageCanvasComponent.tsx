import { memo, type RefObject } from "react";
import addShapePointer3 from "../../assets/pointers/AddShapePointer3_32px.png";
import type { MouseState } from "./stageComponentTypes";

type StageCanvasComponentProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  mouseState: MouseState;
  width: number;
  height: number;
};

function StageCanvasComponent({
  canvasRef,
  mouseState,
  width,
  height,
}: StageCanvasComponentProps) {
  return (
    <canvas
      ref={canvasRef}
      id="MainCanvas"
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        touchAction: "none",
        cursor:
          mouseState === "default"
            ? `url(${addShapePointer3}) 16 16, crosshair`
            : mouseState === "pointer"
              ? "pointer"
              : "grabbing",
      }}
    />
  );
}

export default memo(StageCanvasComponent);
