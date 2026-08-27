export function getPitchSection(y: number, pitchSections: number[]): number {
  if (pitchSections.length === 0) {
    return 5;
  }

  for (let i = 0; i < pitchSections.length; i++) {
    if (i === pitchSections.length - 1) {
      return i;
    }
    if (pitchSections[i]! > y && pitchSections[i + 1]! < y) {
      return i;
    }
  }
  return 5;
}

export function getPitchAdjustedFillColor(
  baseColor: string,
  pitchSection: number,
) {
  const hex = baseColor.replace("#", "").slice(0, 6);
  const normalizedPitch = (pitchSection - 5) / 5; // 5 ist die neutrlale Pitchsection
  const amount = Math.abs(normalizedPitch) * 0.5;
  const target = normalizedPitch >= 0 ? 255 : 0;

  const mix = (colorChannel: number) =>
    Math.round(colorChannel + (target - colorChannel) * amount);

  const r = mix(Number.parseInt(hex.slice(0, 2), 16));
  const g = mix(Number.parseInt(hex.slice(2, 4), 16));
  const b = mix(Number.parseInt(hex.slice(4, 6), 16));

  return `rgb(${r}, ${g}, ${b})`;
}
