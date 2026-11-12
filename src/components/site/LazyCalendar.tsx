import { lazy, Suspense, type ComponentProps } from "react";
import type { Calendar as CalendarType } from "@/components/ui/calendar";

/**
 * Date picker loaded on demand: the calendar library is only downloaded when
 * a date popover is first opened, not with the page.
 */
const CalendarImpl = lazy(() => import("@/components/ui/calendar").then((m) => ({ default: m.Calendar })));

export function Calendar(props: ComponentProps<typeof CalendarType>) {
  return (
    <Suspense fallback={<div className="h-[300px] w-[280px] p-3" aria-busy="true" />}>
      <CalendarImpl {...props} />
    </Suspense>
  );
}
