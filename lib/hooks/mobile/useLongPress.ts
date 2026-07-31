import { useRef, useCallback } from 'react';

interface LongPressHandler {
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

interface UseLongPressOptions {
  /** 长按触发延迟时间（毫秒），默认 300ms */
  delay?: number;
}

/**
 * Hook for handling long-press gesture on mobile devices
 * Used for 2x speed playback when long-pressing the video
 * 
 * Note: This hook should be used with a gesture coordinator to avoid conflicts with swipe gestures
 */
export function useLongPress(
  { onLongPressStart, onLongPressEnd }: LongPressHandler,
  options: UseLongPressOptions = {}
) {
  const { delay = 300 } = options;
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressingRef = useRef(false);

  const start = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      isLongPressingRef.current = true;
      onLongPressStart();
    }, delay);
  }, [delay, onLongPressStart]);

  const cancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const end = useCallback(() => {
    cancel();
    if (isLongPressingRef.current) {
      isLongPressingRef.current = false;
      onLongPressEnd();
    }
  }, [cancel, onLongPressEnd]);

  const isActive = useCallback(() => isLongPressingRef.current, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cancel();
    isLongPressingRef.current = false;
  }, [cancel]);

  return {
    start,
    cancel,
    end,
    isActive,
    cleanup,
  };
}
