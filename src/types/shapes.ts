import type { Sound } from "./sounds";
import type { BeatlineNotePlacement } from "../components/BeatlineWithNotes";

export type ShapeType = "polygon" | "circle" | "custom";

export type Point2D = [number, number];

export type LineSegment = {
  kind: "line";
  to: Point2D; // Zielpunkt der geraden Verbindung.
};

export type ArcSegment = {
  kind: "arc";
  to: Point2D; // Zielpunkt des Bogensegments.
  through: Point2D; // Hilfspunkt, durch den der Bogen laufen soll.
};

// Vier Werte fuer die vier Takte, in denen eine BeatShape aktiv sein kann.
export type ActiveBeats = [boolean, boolean, boolean, boolean];

export type ShapeSegment = LineSegment | ArcSegment;

export type CustomPathData = {
  start: Point2D; // Startpunkt der selbst gezeichneten Form.
  segments: ShapeSegment[]; // Einzelne Linien- und Bogensegmente des Pfads.
  baseRadius: number; // Ausgangsgroesse der Form, damit Custom-Shapes spaeter skaliert werden koennen.
};

export type BeatShapeBase = {
  id: string;
  type: ShapeType;
  x: number; // Position der BeatShape auf der Stage.
  y: number;
  fillColor: string;
  ballColor: string;
  startOffset: number; // Offset, an dem die Bewegung beim synchronisierten Start beginnt.
  offset: number; // Aktuelle Position des Markers auf dem Pfad als Distanz entlang des Pfads.
  lastOffset: number; // Vorherige Markerposition, um ueberschrittene Triggerpunkte zu erkennen.
  triggerOffsets?: number[]; // Positionen auf dem Pfad, an denen ein Sound ausgeloest wird.
  rotation: number; // Drehung der Form in Grad.
  sound: Sound;
  value: number[]; // Notenwerte, aus denen Rhythmus und Form abgeleitet werden.
  paused: boolean;
  visable: boolean;
  muted: boolean;
  activeBeats: ActiveBeats; // Legt fest, in welchen der vier Takte die BeatShape abgespielt wird.
  rotatedValues: number[]; // Notenwerte nach einer Rotation der BeatShape.
  notePlacements: BeatlineNotePlacement[] | undefined; // Positionen der Notensymbole in der Beatline-Anzeige.
  name?: string;
};

export type PolygonBS = BeatShapeBase & {
  type: "polygon";
  size: number; // Groesse des regelmaessigen Polygons.
  corners: number; // Anzahl der Ecken des regelmaessigen Polygons.
};

export type CircleBS = BeatShapeBase & {
  type: "circle";
  radius: number; // Radius des Kreises.
};

export type CustomBS = BeatShapeBase & {
  type: "custom";
  pathData: CustomPathData; // Pfaddaten, aus denen die selbst erstellte Form rekonstruiert wird.
};

export type BeatShape = PolygonBS | CircleBS | CustomBS;

// ShapeKey beschreibt eine Vorlage in der Shape-Auswahl, noch keine platzierte BeatShape.
export type ShapeKey =
  | {
      type: "circle";
      corners: number;
      value: number[]; // Notenwerte, aus denen die Formvorlage erzeugt wird.
      createdByUser: boolean; // Unterscheidet Standardformen von im Editor erstellten Formen.
    }
  | {
      type: "polygon";
      corners: number; // Anzahl der Ecken der Formvorlage.
      value: number[]; // Notenwerte, aus denen die Formvorlage erzeugt wird.
      createdByUser: boolean; // Unterscheidet Standardformen von im Editor erstellten Formen.
    }
  | {
      type: "custom";
      corners: number;
      value: number[]; // Notenwerte, aus denen die Formvorlage erzeugt wird.
      createdByUser: boolean; // Unterscheidet Standardformen von im Editor erstellten Formen.
      pathData: CustomPathData; // Pfaddaten, die fuer Custom-Shapes zusaetzlich benoetigt werden.
    };
