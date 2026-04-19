import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a wide table so it scrolls horizontally on small screens.
 * Shows a subtle gradient hint on the right edge while more content
 * is available, and on the left edge once the user has scrolled.
 */
export function ScrollableTable({
  children,
  className,
  minWidth = 640,
}: {
  children: ReactNode;
  className?: string;
  /** Minimum content width in px before horizontal scrolling kicks in. */
  minWidth?: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeft(scrollLeft > 4);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative rounded-xl border border-border bg-card", className)}>
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-xl [scrollbar-width:thin]"
      >
        <div style={{ minWidth }}>{children}</div>
      </div>
      {/* Left fade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-0 w-8 rounded-l-xl bg-gradient-to-r from-card to-transparent transition-opacity duration-200",
          showLeft ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Right fade */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-0 top-0 bottom-0 w-8 rounded-r-xl bg-gradient-to-l from-card to-transparent transition-opacity duration-200",
          showRight ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
