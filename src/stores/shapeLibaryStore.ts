import { create } from "zustand";
import type { ShapeKey } from "../types/shapes";
import { calculateShapePoints } from "../lib/helper/shapeCalculator";

type ShapeLibraryStore = {
  shapeOptions: ShapeKey[];
  addShapeOption: (shape: ShapeKey) => void;
  setShapeOptions: (shapes: ShapeKey[]) => void;
  resetShapeOptions: () => void;
};

const initialTwoPointPathData = calculateShapePoints([0.5, 0.5]);
const initialTwoPointShape: ShapeKey[] = initialTwoPointPathData
  ? [
      {
        type: "custom",
        corners: 2,
        value: [0.5, 0.5],
        createdByUser: false,
        pathData: initialTwoPointPathData,
      },
    ]
  : [];

const initialShapeOptions: ShapeKey[] = [
  { type: "circle", corners: 4, value: [1], createdByUser: false },
  ...initialTwoPointShape,
  {
    type: "polygon",
    corners: 4,
    value: [1 / 4, 1 / 4, 1 / 4, 1 / 4],
    createdByUser: false,
  },
  {
    type: "polygon",
    corners: 8,
    value: Array(8).fill(1 / 8),
    createdByUser: false,
  },
  {
    type: "polygon",
    corners: 16,
    value: Array(16).fill(1 / 16),
    createdByUser: false,
  },
];

export const useShapeLibraryStore = create<ShapeLibraryStore>((set, get) => ({
  shapeOptions: initialShapeOptions,

  addShapeOption: (shape) => {
    const alreadyExists = get().shapeOptions.some(
      (shapeKey) =>
        JSON.stringify(shapeKey.value) === JSON.stringify(shape.value),
    );

    if (alreadyExists) return;

    set((state) => ({
      shapeOptions: [...state.shapeOptions, shape],
    }));
  },

  setShapeOptions: (shapes) => {
    set({ shapeOptions: shapes });
  },

  resetShapeOptions: () => {
    set({ shapeOptions: initialShapeOptions });
  },
}));
