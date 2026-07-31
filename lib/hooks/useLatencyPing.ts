/**
 * useLatencyPing - Hook for real-time latency measurement
 * Periodically pings video sources when enabled
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { probeLatencyTargets } from '@/lib/utils/latency';

interface LatencyState {
    [sourceId: string]: number;
}

interface UseLatencyPingOptions {
    sourceUrls: { id: string; baseUrl: string }[];
    enabled?: boolean;
    intervalMs?: number;
}

export function useLatencyPing({
    sourceUrls,
    enabled = true,
    intervalMs = 5000,
}: UseLatencyPingOptions) {
    const [latencies, setLatencies] = useState<LatencyState>({});
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const roundInFlightRef = useRef(false);
    const mountedRef = useRef(true);

    // Check if real-time latency is enabled in settings
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);

    // Stabilize sourceUrls to prevent unnecessary effect re-runs if parent passes new array
    const stableSourceUrls = useMemo(
        () => sourceUrls.map((source) => ({ ...source })),
        [sourceUrls],
    );

    useEffect(() => {
        const settings = settingsStore.getSettings();
        setRealtimeEnabled(settings.realtimeLatency);

        // Subscribe to settings changes
        const unsubscribe = settingsStore.subscribe(() => {
            const newSettings = settingsStore.getSettings();
            setRealtimeEnabled(newSettings.realtimeLatency);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const pingSource = useCallback(async (baseUrl: string): Promise<number | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: baseUrl }),
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json();
                return data.success && typeof data.latency === 'number'
                    ? data.latency
                    : null;
            }
            return null;
        } catch {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }, []);

    const pingAllSources = useCallback(async () => {
        if (
            !mountedRef.current ||
            stableSourceUrls.length === 0 ||
            roundInFlightRef.current
        ) return;

        roundInFlightRef.current = true;
        setIsLoading(true);

        try {
            const results = await probeLatencyTargets(
                stableSourceUrls,
                ({ baseUrl }) => pingSource(baseUrl),
            );

            if (mountedRef.current) {
                setLatencies(prev => {
                    const newState = { ...prev };
                    results.forEach(({ id, latency }) => {
                        if (latency !== null) {
                            newState[id] = latency;
                        }
                    });
                    return newState;
                });
            }
        } finally {
            roundInFlightRef.current = false;
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [stableSourceUrls, pingSource]);

    // Start/stop polling based on enabled state
    useEffect(() => {
        mountedRef.current = true;

        const shouldPoll = enabled && realtimeEnabled && stableSourceUrls.length > 0;

        if (shouldPoll) {
            let cancelled = false;
            const poll = async () => {
                await pingAllSources();
                if (!cancelled && mountedRef.current) {
                    intervalRef.current = setTimeout(poll, intervalMs);
                }
            };

            void poll();

            return () => {
                cancelled = true;
                mountedRef.current = false;
                if (intervalRef.current) {
                    clearTimeout(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, realtimeEnabled, stableSourceUrls, intervalMs, pingAllSources]);

    const refreshLatency = useCallback((sourceId: string) => {
        const source = stableSourceUrls.find(s => s.id === sourceId);
        if (source) {
            pingSource(source.baseUrl).then(latency => {
                if (latency !== null && mountedRef.current) {
                    setLatencies(prev => ({ ...prev, [sourceId]: latency }));
                }
            });
        }
    }, [stableSourceUrls, pingSource]);

    const refreshAll = useCallback(() => {
        pingAllSources();
    }, [pingAllSources]);

    return {
        latencies,
        isLoading,
        refreshLatency,
        refreshAll,
        isRealtimeEnabled: realtimeEnabled,
    };
}
