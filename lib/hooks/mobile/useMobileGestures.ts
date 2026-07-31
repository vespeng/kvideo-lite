import { useCallback, useRef } from 'react';
import { useLongPress } from './useLongPress';
import { useSwipeGesture, type SwipeGestureState } from './useSwipeGesture';

interface MobileGesturesHandler {
  onVolumeChange: (volume: number) => void;
  onBrightnessChange: (brightness: number) => void;
  getCurrentVolume: () => number;
  getCurrentBrightness: () => number;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

interface MobileGesturesOptions {
  disabled?: boolean;
}

interface MobileGesturesResult {
  swipeState: SwipeGestureState;
  isLongPressSpeed: boolean;
  handleTouchStart: (e: React.TouchEvent<HTMLVideoElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLVideoElement>) => void;
  handleTouchEnd: () => void;
}

/**
 * Unified gesture coordinator for mobile video player
 * 
 * Gesture priority and conflict resolution:
 * 1. Touch start → Init both long-press timer and swipe detection
 * 2. If vertical movement exceeds threshold before long-press triggers → Activate swipe mode
 * 3. If long-press triggers before significant movement → Lock to long-press mode, ignore swipe
 * 4. Long-press active → Swipe is completely disabled until touch ends
 * 
 * This ensures:
 * - Long press shows ONLY 2x speed indicator (no volume/brightness UI)
 * - Swipe shows ONLY volume/brightness indicator (no 2x speed UI)
 * - No overlapping or conflicting gestures
 */
export function useMobileGestures(
  handlers: MobileGesturesHandler,
  options: MobileGesturesOptions = {}
): MobileGesturesResult {
  const { disabled = false } = options;

  // Gesture mode tracking
  const modeRef = useRef<'idle' | 'longPress' | 'swipe'>('idle');
  const isLongPressSpeedRef = useRef(false);

  // Long press gesture
  const longPress = useLongPress(
    {
      onLongPressStart: () => {
        // Only activate if not already in swipe mode
        if (modeRef.current === 'idle') {
          modeRef.current = 'longPress';
          isLongPressSpeedRef.current = true;
          handlers.onLongPressStart();
          // Cancel swipe if it was initialized but not triggered
          swipe.cancel();
        }
      },
      onLongPressEnd: () => {
        isLongPressSpeedRef.current = false;
        handlers.onLongPressEnd();
      },
    },
    { delay: 300 }
  );

  // Swipe gesture
  const swipe = useSwipeGesture(
    {
      onVolumeChange: handlers.onVolumeChange,
      onBrightnessChange: handlers.onBrightnessChange,
      getCurrentVolume: handlers.getCurrentVolume,
      getCurrentBrightness: handlers.getCurrentBrightness,
    },
    { threshold: 30, sensitivity: 0.005 }
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
    if (disabled || !e.touches[0]) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();

    // Reset mode
    modeRef.current = 'idle';

    // Initialize both gestures
    longPress.start();
    swipe.init(touch.clientX, touch.clientY, rect.width);
  }, [disabled, longPress, swipe]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
    if (disabled || !e.touches[0]) return;

    const touch = e.touches[0];

    // If already in long-press mode, ignore movement (don't cancel)
    if (modeRef.current === 'longPress') {
      return;
    }

    // Try to process swipe movement
    const swipeActivated = swipe.move(touch.clientY);

    // If swipe is activated, cancel long-press and switch to swipe mode
    if (swipeActivated && modeRef.current === 'idle') {
      modeRef.current = 'swipe';
      longPress.cancel();
    }
  }, [disabled, longPress, swipe]);

  const handleTouchEnd = useCallback(() => {
    // End both gestures
    longPress.end();
    swipe.end();

    // Reset mode after a short delay to allow state updates
    setTimeout(() => {
      modeRef.current = 'idle';
    }, 50);
  }, [longPress, swipe]);

  return {
    swipeState: swipe.state,
    isLongPressSpeed: isLongPressSpeedRef.current,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
