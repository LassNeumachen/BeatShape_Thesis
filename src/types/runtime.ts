import type paper from "paper";
import type { ActiveBeats } from "./shapes";
import type { Sound } from "./sounds";

export type RuntimeShape = {
  id: string;
  path: paper.Path;
  label: paper.PointText | null;
  glowMarker: paper.Path.Circle; // Zweiter Marker fuer den kurzen visuellen Glow beim Ausloesen eines Sounds.
  marker: paper.Path.Circle; // Sichtbarer Marker, der die aktuelle Position auf dem Pfad zeigt.
  startOffset: number; // Offset, von dem aus eine synchronisierte Bewegung berechnet wird.
  offset: number; // Aktuelle Position des Markers als Distanz entlang des Pfads.
  loopDuration: number; // Dauer eines vollstaendigen Umlaufs in Sekunden.
  triggerOffsets: number[]; // Positionen auf dem Pfad, an denen ein Sound ausgeloest wird.
  sound: Sound;
  glow: number; // Stärke des aktuellen Glow-Effekts.
  paused: boolean;
  visible: boolean;
  muted: boolean;
  activeBeats: ActiveBeats; // Gibt an, in welchen der vier Takte diese RuntimeShape aktiv ist.
  pitchSection: number; // Tonhöhenbereich der Form, abgeleitet aus ihrer y-Position.
  fillColor: string;
};

export type MetronomeRuntime = {
  path: paper.Path; // Paper.js-Pfad des Metronoms.
  offset: number;
  triggerOffsets: number[];
};
