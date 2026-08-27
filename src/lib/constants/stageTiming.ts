export const BEAT_INITIAL_TRIGGER_PROGRESS = 0.999; //Startet nicht bei 0, damit direkt die Startecke getriggert werden kann

export function getOffsetBeforeStart(startOffset: number, pathLength: number) {
  return (
    (startOffset + pathLength * BEAT_INITIAL_TRIGGER_PROGRESS) % pathLength
  );
}
