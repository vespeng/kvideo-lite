export interface PlayerCursorVisibilityState {
  isFullscreen: boolean;
  isPlaying: boolean;
  showControls: boolean;
  hasInteractiveOverlay?: boolean;
}

export function shouldHidePlayerCursor({
  isFullscreen,
  isPlaying,
  showControls,
  hasInteractiveOverlay = false,
}: PlayerCursorVisibilityState): boolean {
  return isFullscreen && isPlaying && !showControls && !hasInteractiveOverlay;
}
