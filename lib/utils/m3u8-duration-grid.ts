interface DurationSample {
    duration: number;
}

const NTSC_LIKE_MILLISECOND_FRACTIONS = new Set([
    33, 67, 133, 167, 233, 267, 333, 367, 433, 467,
    533, 567, 633, 667, 733, 767, 833, 867, 933, 967,
]);

const FILM_24_LIKE_MILLISECOND_FRACTIONS = new Set([
    2, 4, 6, 8, 12, 16, 20, 24,
]);

function millisecondFraction(duration: number): number {
    const fractionalSeconds = Math.abs(duration - Math.trunc(duration));
    return Math.round(fractionalSeconds * 1000) % 1000;
}

function matchingRatio(samples: DurationSample[], fractions: Set<number>): number {
    if (samples.length === 0) return 0;

    const matches = samples.reduce((count, sample) => (
        fractions.has(millisecondFraction(sample.duration)) ? count + 1 : count
    ), 0);

    return matches / samples.length;
}

export function hasDominantNtscLikeGrid(samples: DurationSample[]): boolean {
    return samples.length >= 4 &&
        matchingRatio(samples, NTSC_LIKE_MILLISECOND_FRACTIONS) > 0.3;
}

export function hasDominantFilm24LikeGrid(samples: DurationSample[]): boolean {
    return samples.length >= 4 &&
        matchingRatio(samples, FILM_24_LIKE_MILLISECOND_FRACTIONS) > 0.35;
}

export function isSmallNtscLikeBlock(samples: DurationSample[]): boolean {
    return samples.length >= 2 &&
        samples.length <= 10 &&
        matchingRatio(samples, NTSC_LIKE_MILLISECOND_FRACTIONS) >= 0.8;
}

export function isSmallIntegerDurationBlock(samples: DurationSample[]): boolean {
    if (samples.length < 2 || samples.length > 10) return false;

    const integerDurations = samples.reduce((count, sample) => (
        millisecondFraction(sample.duration) === 0 ? count + 1 : count
    ), 0);

    return integerDurations >= 2 && integerDurations / samples.length >= 0.75;
}
