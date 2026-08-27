import type { BeatShape } from "../../types/shapes";

export type BeatShapeProjectState = {
  version: 1;
  shapes: BeatShape[];
  bpm: number;
};

export type CreateBeatShapeProjectStateInput = {
  shapes: BeatShape[];
  bpm: number;
};

export function createBeatShapeProjectState({
  shapes,
  bpm,
}: CreateBeatShapeProjectStateInput): BeatShapeProjectState {
  return {
    version: 1,
    shapes,
    bpm,
  };
}

export class ImportExportHelper {
  static readonly queryParam = "beat";

  static encode(project: BeatShapeProjectState) {
    const json = JSON.stringify(project);
    return window.btoa(encodeURIComponent(json));
  }

  static decode(code: string): BeatShapeProjectState {
    const json = decodeURIComponent(window.atob(code.trim()));
    const parsed = JSON.parse(json) as Partial<BeatShapeProjectState>;

    if (parsed.version !== 1 || !Array.isArray(parsed.shapes)) {
      throw new Error("Ungültiger BeatShape-Code.");
    }

    return {
      version: 1,
      shapes: parsed.shapes as BeatShape[],
      bpm: typeof parsed.bpm === "number" ? parsed.bpm : 120,
    };
  }

  static createShareUrl(project: BeatShapeProjectState) {
    const url = new URL(window.location.href);
    url.searchParams.set(this.queryParam, this.encode(project));
    return url.toString();
  }

  static readFromCurrentUrl() {
    const code = new URLSearchParams(window.location.search).get(
      this.queryParam,
    );

    return code ? this.decode(code) : null;
  }
}
