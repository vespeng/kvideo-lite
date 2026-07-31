'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { profiledKey } from '@/lib/utils/profile-storage';
import {
  clampFloatingButtonPosition,
  getDefaultFloatingButtonPosition,
  getFloatingButtonRatios,
  getPositionFromFloatingButtonRatios,
  type FloatingAnchor,
  type FloatingButtonPosition,
  type FloatingButtonRatios,
  type FloatingButtonViewport,
} from '@/lib/utils/floating-button-position';

interface StoredFloatingPosition extends FloatingButtonRatios {
  /** Version 2 ratios are measured within the draggable area, not the viewport. */
  version?: 2;
}

const CURRENT_STORAGE_VERSION = 2;

interface UseFloatingButtonPositionOptions {
  storageKey: string;
  defaultAnchor: FloatingAnchor;
  defaultYRatio?: number;
  buttonSize?: number;
  margin?: number;
}

interface DragState {
  active: boolean;
  dragging: boolean;
  pointerId: number | null;
  startClientX: number;
  startClientY: number;
  offsetX: number;
  offsetY: number;
}

const DRAG_THRESHOLD = 8;

const INITIAL_DRAG_STATE: DragState = {
  active: false,
  dragging: false,
  pointerId: null,
  startClientX: 0,
  startClientY: 0,
  offsetX: 0,
  offsetY: 0,
};

export function useFloatingButtonPosition({
  storageKey,
  defaultAnchor,
  defaultYRatio = 0.5,
  buttonSize = 56,
  margin = 16,
}: UseFloatingButtonPositionOptions) {
  const [position, setPosition] = useState<FloatingButtonPosition | null>(null);
  const dragStateRef = useRef<DragState>(INITIAL_DRAG_STATE);
  const positionRef = useRef<FloatingButtonPosition | null>(null);
  const customRatiosRef = useRef<FloatingButtonRatios | null>(null);
  const pointerUpHandlerRef = useRef<(event: PointerEvent) => void>(() => undefined);
  const suppressClickRef = useRef(false);

  const clampPosition = useCallback((x: number, y: number, width: number, height: number) => ({
    ...clampFloatingButtonPosition(
      { x, y },
      { width, height },
      buttonSize,
      margin,
    ),
  }), [buttonSize, margin]);

  const getDefaultPosition = useCallback((width: number, height: number) => {
    return getDefaultFloatingButtonPosition(
      { width, height },
      defaultAnchor,
      defaultYRatio,
      buttonSize,
      margin,
    );
  }, [buttonSize, defaultAnchor, defaultYRatio, margin]);

  const persistPosition = useCallback((nextPosition: FloatingButtonPosition) => {
    if (typeof window === 'undefined') return;

    const viewport: FloatingButtonViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const ratios = getFloatingButtonRatios(nextPosition, viewport, buttonSize, margin);
    const payload: StoredFloatingPosition = {
      version: CURRENT_STORAGE_VERSION,
      ...ratios,
    };

    localStorage.setItem(profiledKey(storageKey), JSON.stringify(payload));
  }, [buttonSize, margin, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadPosition = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const fallbackPosition = getDefaultPosition(width, height);
      customRatiosRef.current = null;

      try {
        const raw = localStorage.getItem(profiledKey(storageKey));
        if (!raw) {
          positionRef.current = fallbackPosition;
          setPosition(fallbackPosition);
          return;
        }

        const parsed = JSON.parse(raw) as Partial<StoredFloatingPosition> & { version?: number };
        if (
          typeof parsed.xRatio !== 'number' ||
          !Number.isFinite(parsed.xRatio) ||
          typeof parsed.yRatio !== 'number' ||
          !Number.isFinite(parsed.yRatio) ||
          (parsed.version !== undefined && parsed.version !== CURRENT_STORAGE_VERSION)
        ) {
          positionRef.current = fallbackPosition;
          setPosition(fallbackPosition);
          return;
        }

        const viewport = { width, height };
        const nextPosition = parsed.version === CURRENT_STORAGE_VERSION
          ? getPositionFromFloatingButtonRatios(
            { xRatio: parsed.xRatio, yRatio: parsed.yRatio },
            viewport,
            buttonSize,
            margin,
          )
          : clampPosition(parsed.xRatio * width, parsed.yRatio * height, width, height);

        customRatiosRef.current = getFloatingButtonRatios(nextPosition, viewport, buttonSize, margin);
        positionRef.current = nextPosition;
        setPosition(nextPosition);
      } catch {
        positionRef.current = fallbackPosition;
        setPosition(fallbackPosition);
      }
    };

    loadPosition();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nextPosition = customRatiosRef.current
        ? getPositionFromFloatingButtonRatios(
          customRatiosRef.current,
          { width, height },
          buttonSize,
          margin,
        )
        : getDefaultPosition(width, height);

      positionRef.current = nextPosition;
      setPosition(nextPosition);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buttonSize, clampPosition, getDefaultPosition, margin, storageKey]);

  const finishDrag = useCallback(() => {
    const dragState = dragStateRef.current;
    const didDrag = dragState.dragging;

    if (didDrag && positionRef.current) {
      persistPosition(positionRef.current);
    }

    suppressClickRef.current = didDrag;
    dragStateRef.current = INITIAL_DRAG_STATE;
  }, [persistPosition]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    const movedX = Math.abs(event.clientX - dragState.startClientX);
    const movedY = Math.abs(event.clientY - dragState.startClientY);

    if (!dragState.dragging && (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD)) {
      dragState.dragging = true;
    }

    if (!dragState.dragging) {
      return;
    }

    event.preventDefault();

    const nextPosition = clampPosition(
      event.clientX - dragState.offsetX,
      event.clientY - dragState.offsetY,
      window.innerWidth,
      window.innerHeight
    );

    customRatiosRef.current = getFloatingButtonRatios(
      nextPosition,
      { width: window.innerWidth, height: window.innerHeight },
      buttonSize,
      margin,
    );
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }, [buttonSize, clampPosition, margin]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    finishDrag();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', pointerUpHandlerRef.current);
    window.removeEventListener('pointercancel', pointerUpHandlerRef.current);
  }, [finishDrag, handlePointerMove]);

  useEffect(() => {
    pointerUpHandlerRef.current = handlePointerUp;
  }, [handlePointerUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    dragStateRef.current = {
      active: true,
      dragging: false,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  const consumeSyntheticClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return false;

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  }, []);

  const floatingStyle = position
    ? {
      left: `${position.x}px`,
      top: `${position.y}px`,
      right: 'auto',
      bottom: 'auto',
      transform: 'none',
    }
    : defaultAnchor === 'left'
      ? {
        left: `${margin}px`,
        top: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
      }
      : {
        right: `${margin}px`,
        top: '50%',
        left: 'auto',
        bottom: 'auto',
        transform: 'translateY(-50%)',
      };

  return {
    floatingStyle,
    onPointerDown,
    consumeSyntheticClick,
  };
}
