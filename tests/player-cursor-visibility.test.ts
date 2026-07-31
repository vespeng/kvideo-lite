import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldHidePlayerCursor } from '@/lib/player/cursor-visibility';

test('shouldHidePlayerCursor hides the cursor during unobstructed fullscreen playback', () => {
  assert.equal(shouldHidePlayerCursor({
    isFullscreen: true,
    isPlaying: true,
    showControls: false,
  }), true);
});

test('shouldHidePlayerCursor keeps the cursor visible outside fullscreen', () => {
  assert.equal(shouldHidePlayerCursor({
    isFullscreen: false,
    isPlaying: true,
    showControls: false,
  }), false);
});

test('shouldHidePlayerCursor keeps the cursor visible while paused', () => {
  assert.equal(shouldHidePlayerCursor({
    isFullscreen: true,
    isPlaying: false,
    showControls: false,
  }), false);
});

test('shouldHidePlayerCursor keeps the cursor visible while controls are shown', () => {
  assert.equal(shouldHidePlayerCursor({
    isFullscreen: true,
    isPlaying: true,
    showControls: true,
  }), false);
});

test('shouldHidePlayerCursor keeps the cursor visible while an interactive overlay is open', () => {
  assert.equal(shouldHidePlayerCursor({
    isFullscreen: true,
    isPlaying: true,
    showControls: false,
    hasInteractiveOverlay: true,
  }), false);
});
