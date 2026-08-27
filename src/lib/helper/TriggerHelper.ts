export function checkTriggerCrossing(
  triggerOffsets: number[],
  oldOffset: number,
  newOffset: number,
  pathLength: number,
) {
  const wrapped = newOffset < oldOffset;

  for (const triggerOffset of triggerOffsets) {
    if (!wrapped) {
      if (triggerOffset > oldOffset && triggerOffset <= newOffset) {
        return true;
      }
    } else {
      if (triggerOffset > oldOffset || triggerOffset <= newOffset) {
        return true;
      }
    }
  }
  return false;
}
