export interface Segment {
    url: string;
    duration: number;
    lineIndex: number;
}

export interface Block {
    segments: Segment[];
    startLineIndex: number;
    endLineIndex: number;
    hasCueTag: boolean;
}

export interface MainPattern {
    filenameRegex: RegExp | null;
    avgDuration: number;
    commonPrefix: string;
    pathPrefix: string;
    origin: string;
    usesNtscLikeGrid: boolean;
    usesFilm24LikeGrid: boolean;
}

export interface SegmentLocation {
    origin: string;
    pathPrefix: string;
}
