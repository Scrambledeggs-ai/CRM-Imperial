import { topicColor } from "@/lib/topicColor";

export function TopicChip({ name }: { name: string }) {
  const color = topicColor(name);
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ backgroundColor: color.bg, color: color.hex }}
    >
      {name}
    </span>
  );
}
