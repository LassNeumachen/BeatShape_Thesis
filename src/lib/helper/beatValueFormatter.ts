function almostEqual(a: number, b: number) {
  return Math.abs(a - b) < 1e-9;
}

export function formatBeatValue(value: number) {
  const values = [
    { number: 1, label: "1" },
    { number: 1 / 2, label: "1/2" },
    { number: 1 / 4, label: "1/4" },
    { number: 1 / 8, label: "1/8" },
    { number: 1 / 16, label: "1/16" },
    { number: 1 / 32, label: "1/32" },
    { number: 1 / 3, label: "1/3" },
    { number: 1 / 4 + 1 / 8, label: "1/4." },
    { number: 1 / 8 + 1 / 16, label: "1/8." },
    { number: 1 / 16 + 1 / 32, label: "1/16." },
    { number: 1 / 4 + 1 / 8 + 1 / 16, label: "1/4.." },
    { number: 1 / 8 + 1 / 16 + 1 / 32, label: "1/8.." },
  ];

  const match = values.find((item) => almostEqual(value, item.number));

  return match ? match.label : value.toFixed(3);
}
