import {
    hasDominantFilm24LikeGrid,
    hasDominantNtscLikeGrid,
} from './m3u8-duration-grid';
import type { Block, MainPattern, SegmentLocation } from './m3u8-ad-types';

function unwrapProxyUrl(url: string): string {
    if (!url.includes('/api/proxy?url=')) return url;

    try {
        const match = url.match(/[?&]url=([^&]+)/);
        return match?.[1] ? decodeURIComponent(match[1]) : url;
    } catch {
        return url;
    }
}

export function extractFilename(url: string): string {
    try {
        const unwrappedUrl = unwrapProxyUrl(url);
        const path = unwrappedUrl.includes('://')
            ? new URL(unwrappedUrl).pathname
            : unwrappedUrl;
        return path.split('/').pop() || '';
    } catch {
        return url.split('/').pop() || '';
    }
}

function findCommonPrefix(strings: string[]): string {
    if (strings.length < 2) return '';

    let prefix = '';
    for (let index = 0; index < strings[0].length; index += 1) {
        const character = strings[0][index];
        if (!strings.every(value => value[index] === character)) break;
        prefix += character;
    }
    return prefix;
}

export function extractSegmentLocation(url: string): SegmentLocation {
    try {
        const unwrappedUrl = unwrapProxyUrl(url);
        const parsedUrl = unwrappedUrl.includes('://') ? new URL(unwrappedUrl) : null;
        const path = parsedUrl?.pathname || unwrappedUrl;
        const lastSlash = path.lastIndexOf('/');
        return {
            origin: parsedUrl?.origin || '',
            pathPrefix: lastSlash >= 0 ? path.substring(0, lastSlash + 1) : '',
        };
    } catch {
        const lastSlash = url.lastIndexOf('/');
        return {
            origin: '',
            pathPrefix: lastSlash >= 0 ? url.substring(0, lastSlash + 1) : '',
        };
    }
}

export function learnMainPattern(blocks: Block[]): MainPattern {
    const mainBlock = blocks.length > 0
        ? blocks.reduce((largest, block) => (
            block.segments.length > largest.segments.length ? block : largest
        ))
        : null;

    if (!mainBlock || mainBlock.segments.length === 0) {
        return {
            filenameRegex: null,
            avgDuration: 0,
            commonPrefix: '',
            pathPrefix: '',
            origin: '',
            usesNtscLikeGrid: false,
            usesFilm24LikeGrid: false,
        };
    }

    const filenames = mainBlock.segments.map(segment => extractFilename(segment.url));
    const commonPrefix = findCommonPrefix(filenames);
    const totalDuration = mainBlock.segments.reduce((sum, segment) => (
        sum + segment.duration
    ), 0);
    const avgDuration = totalDuration / mainBlock.segments.length;
    const escapedPrefix = commonPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filenameRegex = commonPrefix.length >= 2
        ? new RegExp(`^${escapedPrefix}`)
        : null;
    const location = extractSegmentLocation(mainBlock.segments[0].url);

    return {
        filenameRegex,
        avgDuration,
        commonPrefix,
        ...location,
        usesNtscLikeGrid: hasDominantNtscLikeGrid(mainBlock.segments),
        usesFilm24LikeGrid: hasDominantFilm24LikeGrid(mainBlock.segments),
    };
}
