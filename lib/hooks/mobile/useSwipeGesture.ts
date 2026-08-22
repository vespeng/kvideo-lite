import { useRef, useCallback, useState } from 'react';

interface SwipeGestureHandler {
  onVolumeChange: (volume: number) => void;
  onBrightnessChange: (brightness: number) => void;
  getCurrentVolume: () => number;
  getCurrentBrightness: () => number;
}

export interface SwipeGestureState {
  isSwiping: boolean;
  swipeSide: 'left' | 'right' | null;
  currentValue: number;
}

interface UseSwipeGestureOptions {
  /** Minimum vertical displacement (px) to trigger a swipe, default 30 */
  threshold?: number;
  /** Swipe sensitivity (ratio of pixels to value), default 0.005 */
  sensitivity?: number;
}

/**
 * Hook for handling vertical swipe gestures on mobile devices
 * - Left side vertical swipe: Adjust brightness
 * - Right side vertical swipe: Adjust volume
 * 
 * Features:
 * - Requires minimum vertical movement to trigger (prevents accidental activation)
 * - Only activates when explicitly started by coordinator
 */
export function useSwipeGesture(
  {
    onVolumeChange,
    onBrightnessChange,
    getCurrentVolume,
    getCurrentBrightness,
  }: SwipeGestureHandler,
  options: UseSwipeGestureOptions = {}
) {
  const { threshold = 30, sensitivity = 0.005 } = options;

  const [state, setState] = useState<SwipeGestureState>({
    isSwiping: false,
    swipeSide: null,
    currentValue: 0,
  });

  const startYRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const isActiveRef = useRef(false);
  const isTriggeredRef = useRef(false); // Whether threshold has been passed
  const sideRef = useRef<'left' | 'right' | null>(null);

  const init = useCallback((clientX: number, clientY: number, videoWidth: number) => {
    const x = clientX;
    const side = x < videoWidth / 2 ? 'left' : 'right';
    
    startYRef.current = clientY;
    sideRef.current = side;
    isTriggeredRef.current = false;
    isActiveRef.current = true;
    
    // Store initial value but don't show UI yet
    if (side === 'right') {
      startValueRef.current = getCurrentVolume();
    } else {
      startValueRef.current = getCurrentBrightness();
    }
  }, [getCurrentVolume, getCurrentBrightness]);

  const move = useCallback((clientY: number) => {
    if (!isActiveRef.current || !sideRef.current) return false;

    const deltaY = startYRef.current - clientY; // Up = increase, Down = decrease
    
    // Check if threshold is passed
    if (!isTriggeredRef.current && Math.abs(deltaY) < threshold) {
      return false; // Not yet triggered
    }

    // Mark as triggered and start showing UI
    if (!isTriggeredRef.current) {
      isTriggeredRef.current = true;
    }

    // Calculate new value
    let newValue = startValueRef.current + deltaY * sensitivity;
    newValue = Math.max(0, Math.min(1, newValue)); // Clamp between 0 and 1

    // Update state for UI indicator
    setState({
      isSwiping: true,
      swipeSide: sideRef.current,
      currentValue: newValue,
    });

    // Call the appropriate handler
    if (sideRef.current === 'right') {
      onVolumeChange(newValue);
    } else {
      onBrightnessChange(newValue);
    }

    return true;
  }, [threshold, sensitivity, onVolumeChange, onBrightnessChange]);

  const end = useCallback(() => {
    const wasActive = isActiveRef.current;
    isActiveRef.current = false;
    isTriggeredRef.current = false;
    sideRef.current = null;
    
    setState({
      isSwiping: false,
      swipeSide: null,
      currentValue: 0,
    });

    return wasActive && isTriggeredRef.current;
  }, []);

  const cancel = useCallback(() => {
    isActiveRef.current = false;
    isTriggeredRef.current = false;
    sideRef.current = null;
    setState({
      isSwiping: false,
      swipeSide: null,
      currentValue: 0,
    });
  }, []);

  const isTriggered = useCallback(() => isTriggeredRef.current, []);

  return {
    state,
    init,
    move,
    end,
    cancel,
    isTriggered,
  };
}
