import { useEffect, useRef, useState } from 'react';

/**
 * A custom hook to automatically trigger a refresh function at a given interval.
 * It prevents overlapping calls if the refresh function takes longer than the interval.
 * Uses a ref for the callback so the interval is STABLE and does not reset on every render.
 *
 * @param refreshFn The function to call periodically.
 * @param intervalMs The interval in milliseconds (default 30000ms = 30s).
 * @returns { countdown } - seconds remaining until the next auto-refresh fires
 */
export function useAutoRefresh(refreshFn: () => void | Promise<void>, intervalMs: number = 30000) {
  const isFetchingRef = useRef(false);
  // Always hold the latest version of refreshFn without it being a dep of the interval effect
  const refreshFnRef = useRef(refreshFn);
  const totalSeconds = Math.round(intervalMs / 1000);
  const [countdown, setCountdown] = useState(totalSeconds);

  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    setCountdown(totalSeconds);

    // Main refresh interval
    const tick = async () => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        await refreshFnRef.current();
      } finally {
        isFetchingRef.current = false;
        setCountdown(totalSeconds); // reset countdown after each refresh
      }
    };
    const intervalId = setInterval(tick, intervalMs);

    // Countdown ticker (every second)
    const countdownId = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? totalSeconds : prev - 1));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
    // intervalMs is intentionally the only dep — changing interval resets the timer
  }, [intervalMs, totalSeconds]);

  return { countdown };
}
