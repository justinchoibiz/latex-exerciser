import { cn } from "@/shared/lib/utils";
import {
  calculateTimerPercent,
  formatRemainingTime,
  getTimerTone,
} from "@/features/quiz/lib/timer";

type QuestionTimerProps = {
  remainingSec: number;
  timeLimitSec: number;
};

const toneClasses = {
  normal: {
    text: "text-neutral-950",
    bar: "bg-neutral-950",
    badge: "border-neutral-200 bg-neutral-50 text-neutral-700",
  },
  attention: {
    text: "text-amber-700",
    bar: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  danger: {
    text: "text-red-700",
    bar: "bg-red-600",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  expired: {
    text: "text-red-700",
    bar: "bg-red-700",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
} as const;

export function QuestionTimer({
  remainingSec,
  timeLimitSec,
}: QuestionTimerProps) {
  const tone = getTimerTone(remainingSec, timeLimitSec);
  const percent = calculateTimerPercent(remainingSec, timeLimitSec);
  const classes = toneClasses[tone];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("mt-2 text-3xl font-semibold", classes.text)}>
            {formatRemainingTime(remainingSec)}
          </p>
        </div>

        <div
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            classes.badge,
          )}
        >
          {tone === "expired" ? "Expired" : `${timeLimitSec}s limit`}
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color]",
            classes.bar,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

    </div>
  );
}