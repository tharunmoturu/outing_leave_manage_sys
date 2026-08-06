import { useEffect, useRef } from 'react';

/**
 * A custom hook to automatically trigger a refresh function at a given interval.
 * It prevents overlapping calls if the refresh function takes longer than the interval.
 * 
 * @param refreshFn The function to call periodically. Should ideally be wrapped in useCallback.
 * @param intervalMs The interval in milliseconds (default 30000ms = 30s).
 */
export function useAutoRefresh(refreshFn: () => void | Promise<void>, intervalMs: number = 30000) {
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const tick = async () => {
      if (isFetchingRef.current) return;
      
      try {
        isFetchingRef.current = true;
        await refreshFn();
      } finally {
        isFetchingRef.current = false;
      }
    };

    const intervalId = setInterval(tick, intervalMs);
    
    return () => clearInterval(intervalId);
  }, [refreshFn, intervalMs]);
}
