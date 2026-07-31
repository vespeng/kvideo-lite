import React, { RefObject } from 'react';
import { Icons } from '@/components/ui/Icon';

interface DesktopVolumeControlProps {
    volumeBarRef: RefObject<HTMLDivElement | null>;

    volume: number;
    isMuted: boolean;
    showVolumeBar: boolean;
    onToggleMute: () => void;
    onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    onVolumeMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function DesktopVolumeControl({
    volumeBarRef,
    volume,
    isMuted,
    showVolumeBar,
    onToggleMute,
    onVolumeChange,
    onVolumeMouseDown
}: DesktopVolumeControlProps) {
    return (
        <div className="flex items-center gap-2 group/volume">
            <button
                onClick={onToggleMute}
                className="btn-icon"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted || volume === 0 ? (
                    <Icons.VolumeX size={20} />
                ) : volume < 0.5 ? (
                    <Icons.Volume1 size={20} />
                ) : (
                    <Icons.Volume2 size={20} />
                )}
            </button>

            {/* Volume Bar */}
            <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${showVolumeBar
                ? 'opacity-100 w-32'
                : 'opacity-0 w-0 group-hover/volume:opacity-100 group-hover/volume:w-32'
                }`}>
                <div
                    ref={volumeBarRef}
                    className="slider-track h-1 cursor-pointer flex-1"
                    onClick={onVolumeChange}
                    onMouseDown={onVolumeMouseDown}
                >
                    <div
                        className="slider-range h-full"
                        style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                    <div
                        className="slider-thumb"
                        style={{ left: `${isMuted ? 0 : volume * 100}%` }}
                    />
                </div>
                <span className="text-white text-xs font-medium tabular-nums min-w-[2rem]">
                    {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
            </div>
        </div>
    );
}
