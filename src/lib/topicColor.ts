const PALETTE = [
  { hex: "#ef4444", bg: "rgba(239,68,68,0.16)" },
  { hex: "#3b82f6", bg: "rgba(59,130,246,0.16)" },
  { hex: "#f2c94c", bg: "rgba(242,201,76,0.18)" },
  { hex: "#14b8a6", bg: "rgba(20,184,166,0.16)" },
  { hex: "#22c55e", bg: "rgba(34,197,94,0.16)" },
];

export function topicColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
