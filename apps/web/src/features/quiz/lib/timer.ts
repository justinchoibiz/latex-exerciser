export type TimerTone = "normal" | "attention" | "danger" | "expired";

export function clampRemainingTime(value: number) {
  return Math.max(0, Math.ceil(value));
}

export function calculateRemainingTime(
  startedAtMs: number,
  timeLimitSec: number,
  nowMs: number,
) {
  const elapsedSec = (nowMs - startedAtMs) / 1000;
  return clampRemainingTime(timeLimitSec - elapsedSec);
}

export function calculateTimerPercent(
  remainingSec: number,
  timeLimitSec: number,
) {
  if (timeLimitSec <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (remainingSec / timeLimitSec) * 100));
}

export function getTimerTone(
  remainingSec: number,
  timeLimitSec: number,
): TimerTone {
  if (remainingSec <= 0) {
    return "expired";
  }

  if (remainingSec <= 10) {
    return "danger";
  }

  if (remainingSec <= timeLimitSec * 0.5) {
    return "attention";
  }

  return "normal";
}

export function formatRemainingTime(remainingSec: number) {
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}