import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
}

export function Marquee({ items, reverse = false, className }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-0",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="whitespace-nowrap px-6 text-sm font-bold uppercase tracking-widest">
              {item}
            </span>
            <span className="text-gray-300">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
