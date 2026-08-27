import type { CustomPathData, Point2D, ShapeKey } from "../../types/shapes";
import { memo, useEffect, useRef } from "react";
import paper from "paper";
import { appColors } from "../../theme";
import { Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  buildPaperPath,
  buildTippedCirclePath,
  transformPathData,
} from "../../lib/helper/paperPath";

type NoMovementCanvasProps = {
  color: string;
  shape: ShapeKey;
  width: number;
  height: number;
  radius?: number;
  editButton?: boolean;
  onEditClick?: () => void;
  editOpen?: boolean;
};

function NoMovementCanvasComponent(props: NoMovementCanvasProps) {
  const shapeCanvas = useRef<HTMLCanvasElement | null>(null);
  const canvasSize = {
    width: props.width,
    height: props.height,
  };

  const availableRadius = Math.min(canvasSize.width, canvasSize.height) / 2;

  useEffect(() => {
    if (!shapeCanvas.current) return;

    shapeCanvas.current.width = canvasSize.width;
    shapeCanvas.current.height = canvasSize.height;

    const scope = new paper.PaperScope();
    scope.setup(shapeCanvas.current);
    scope.project.clear();

    const center = scope.view.center;
    const viewSize = scope.view.viewSize;

    if (props.shape.type === "polygon") {
      new scope.Path.RegularPolygon({
        center,
        sides: props.shape.corners,
        radius: props.radius
          ? Math.min(props.radius, availableRadius)
          : availableRadius,
        fillColor: props.color,
      });
    } else if (props.shape.type === "circle") {
      buildTippedCirclePath(
        scope,
        center,
        props.radius
          ? Math.min(props.radius, availableRadius)
          : availableRadius,
        props.color,
      );
    } else if (props.shape.type === "custom") {
      const transformedPathData = fitPathDataToCanvas(
        props.shape.pathData,
        viewSize.width,
        viewSize.height,
        4,
      );

      buildPaperPath(scope, transformedPathData, props.color);
    }

    return () => {
      scope.project.clear();
    };
  }, [
    props.shape,
    props.color,
    props.radius,
    props.width,
    props.height,
    availableRadius,
  ]);

  return (
    <Box
      onClick={props.onEditClick ? props.onEditClick : undefined}
      sx={{
        position: "relative",
        width: props.width,
        height: props.height,
        minWidth: props.width,
        minHeight: props.height,
        flexShrink: 0,
      }}
    >
      <canvas
        ref={shapeCanvas}
        data-role="shapeCard"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          display: "block",
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      />
      {props.editButton === true && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 0,
            width: 28,
            height: 28,
            p: 0,
          }}
        >
          {props.editOpen === true ? (
            <KeyboardArrowUpIcon
              sx={{ fontSize: 28, color: appColors.black }}
            />
          ) : (
            <KeyboardArrowDownIcon
              sx={{ fontSize: 28, color: appColors.black }}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export const NoMovementCanvas = memo(NoMovementCanvasComponent);

function fitPathDataToCanvas(
  pathData: CustomPathData,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
) {
  const effectivePadding = Math.min(padding, canvasWidth / 4, canvasHeight / 4);
  const points = getPathDataPoints(pathData);
  const minX = Math.min(...points.map((point) => point[0]));
  const maxX = Math.max(...points.map((point) => point[0]));
  const minY = Math.min(...points.map((point) => point[1]));
  const maxY = Math.max(...points.map((point) => point[1]));
  const width = Math.max(maxX - minX, Number.EPSILON);
  const height = Math.max(maxY - minY, Number.EPSILON);
  const availableWidth = Math.max(
    canvasWidth - effectivePadding * 2,
    Number.EPSILON,
  );
  const availableHeight = Math.max(
    canvasHeight - effectivePadding * 2,
    Number.EPSILON,
  );
  const scale = Math.min(availableWidth / width, availableHeight / height);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const offsetX = canvasWidth / 2 - centerX * scale;
  const offsetY = canvasHeight / 2 - centerY * scale;

  return transformPathData(pathData, scale, offsetX, offsetY);
}

function getPathDataPoints(pathData: CustomPathData): Point2D[] {
  return [
    pathData.start,
    ...pathData.segments.flatMap((segment) =>
      segment.kind === "arc" ? [segment.through, segment.to] : [segment.to],
    ),
  ];
}
