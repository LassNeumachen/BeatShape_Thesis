import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type Point = {
  x: number;
  y: number;
};

type StageCameraOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  paperScopeRef: RefObject<paper.PaperScope | null>;
  worldWidth: number;
  worldHeight: number;
  maxZoom: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useStageCamera({
  canvasRef,
  paperScopeRef,
  worldWidth,
  worldHeight,
  maxZoom,
}: StageCameraOptions) {
  const cameraRef = useRef({
    center: { x: worldWidth / 2, y: worldHeight / 2 },
    zoom: 1,
  });
  const [cameraState, setCameraState] = useState(cameraRef.current);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getMinCameraZoom = useCallback(
    () => viewportSize.height / worldHeight,
    [viewportSize.height, worldHeight],
  );

  const clampCamera = useCallback(
    (center: Point, zoom: number) => {
      const visibleWidth = viewportSize.width / zoom;
      const visibleHeight = viewportSize.height / zoom;
      const minX =
        visibleWidth >= worldWidth ? worldWidth / 2 : visibleWidth / 2;
      const maxX =
        visibleWidth >= worldWidth
          ? worldWidth / 2
          : worldWidth - visibleWidth / 2;
      const minY =
        visibleHeight >= worldHeight ? worldHeight / 2 : visibleHeight / 2;
      const maxY =
        visibleHeight >= worldHeight
          ? worldHeight / 2
          : worldHeight - visibleHeight / 2;

      return {
        x: clamp(center.x, minX, maxX),
        y: clamp(center.y, minY, maxY),
      };
    },
    [viewportSize, worldHeight, worldWidth],
  );

  const applyCamera = useCallback(() => {
    const scope = paperScopeRef.current;
    if (!scope) return;

    const zoom = clamp(cameraRef.current.zoom, getMinCameraZoom(), maxZoom);
    const center = clampCamera(cameraRef.current.center, zoom);

    cameraRef.current = { center, zoom };
    scope.view.zoom = zoom;
    scope.view.center = new scope.Point(center.x, center.y);
    setCameraState(cameraRef.current);
  }, [clampCamera, getMinCameraZoom, maxZoom, paperScopeRef]);

  const resetCameraToFitHeight = useCallback(() => {
    cameraRef.current = {
      center: { x: worldWidth / 2, y: worldHeight / 2 },
      zoom: getMinCameraZoom(),
    };
    applyCamera();
  }, [applyCamera, getMinCameraZoom, worldHeight, worldWidth]);

  useEffect(() => {
    function updateViewportSize() {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope) return;

    scope.view.viewSize = new scope.Size(
      viewportSize.width,
      viewportSize.height,
    );

    if (cameraRef.current.zoom < getMinCameraZoom()) {
      cameraRef.current = {
        ...cameraRef.current,
        zoom: getMinCameraZoom(),
      };
    }

    applyCamera();
  }, [applyCamera, getMinCameraZoom, paperScopeRef, viewportSize]);

  const getCanvasViewPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return null;

      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [canvasRef],
  );

  function isInsideWorld(point: paper.Point) {
    return (
      point.x >= 0 &&
      point.x <= worldWidth &&
      point.y >= 0 &&
      point.y <= worldHeight
    );
  }

  function worldToScreen(point: Point) {
    return {
      x:
        (point.x - cameraState.center.x) * cameraState.zoom +
        viewportSize.width / 2,
      y:
        (point.y - cameraState.center.y) * cameraState.zoom +
        viewportSize.height / 2,
    };
  }

  function getVisibleWorldRect() {
    const width = viewportSize.width / cameraState.zoom;
    const height = viewportSize.height / cameraState.zoom;

    return {
      x: cameraState.center.x - width / 2,
      y: cameraState.center.y - height / 2,
      width,
      height,
    };
  }

  const zoomBy = useCallback(
    (factor: number) => {
      cameraRef.current = {
        ...cameraRef.current,
        zoom: cameraRef.current.zoom * factor,
      };
      applyCamera();
    },
    [applyCamera],
  );

  const zoomIn = useCallback(() => {
    zoomBy(1.35);
  }, [zoomBy]);

  const zoomOut = useCallback(() => {
    zoomBy(1 / 1.35);
  }, [zoomBy]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const target = event.target as HTMLElement;

      if (target.tagName.toLowerCase() !== "canvas") {
        return;
      }

      event.preventDefault();

      const scope = paperScopeRef.current;
      const viewPoint = getCanvasViewPoint(event.clientX, event.clientY);
      if (!scope || !viewPoint) return;

      const beforeZoomPoint = scope.view.viewToProject(
        new scope.Point(viewPoint.x, viewPoint.y),
      );
      const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      const nextZoom = clamp(
        cameraRef.current.zoom * zoomFactor,
        getMinCameraZoom(),
        maxZoom,
      );

      cameraRef.current = {
        ...cameraRef.current,
        zoom: nextZoom,
      };
      applyCamera();

      const afterZoomPoint = scope.view.viewToProject(
        new scope.Point(viewPoint.x, viewPoint.y),
      );

      cameraRef.current = {
        ...cameraRef.current,
        center: {
          x: cameraRef.current.center.x + beforeZoomPoint.x - afterZoomPoint.x,
          y: cameraRef.current.center.y + beforeZoomPoint.y - afterZoomPoint.y,
        },
      };
      applyCamera();
    },
    [applyCamera, getCanvasViewPoint, getMinCameraZoom, maxZoom, paperScopeRef],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, handleWheel]);

  return {
    cameraRef,
    cameraState,
    viewportSize,
    applyCamera,
    resetCameraToFitHeight,
    getCanvasViewPoint,
    isInsideWorld,
    worldToScreen,
    getVisibleWorldRect,
    zoomIn,
    zoomOut,
  };
}
