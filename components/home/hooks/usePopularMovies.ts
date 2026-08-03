import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

interface DoubanMovie {
    id: string;
    title: string;
    cover: string;
    rate: string;
    url: string;
}

const PAGE_LIMIT = 20;
const POPULAR_CACHE_KEY = 'kvideo_popular_cache';

// Daily reset: cache entries are validated against today's date string
const getTodayKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

interface PopularCacheEntry {
    movies: DoubanMovie[];
    hasMore: boolean;
    page: number;
    dateKey: string;
}

interface PopularCache {
    [key: string]: PopularCacheEntry;
}

const loadPopularCache = (): PopularCache => {
    try {
        const cached = localStorage.getItem(POPULAR_CACHE_KEY);
        if (!cached) return {};
        const data = JSON.parse(cached) as PopularCache;
        const todayKey = getTodayKey();
        const validCache: PopularCache = {};
        for (const [key, entry] of Object.entries(data)) {
            // Drop entries from previous days (daily reset)
            if (entry && entry.dateKey === todayKey) {
                validCache[key] = entry;
            }
        }
        return validCache;
    } catch {
        return {};
    }
};

const savePopularCache = (cache: PopularCache): void => {
    try {
        localStorage.setItem(POPULAR_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('[PopularCache] Failed to save:', error);
    }
};

export function usePopularMovies(selectedTag: string, tags: any[], contentType: 'movie' | 'tv' = 'movie') {
    const [movies, setMovies] = useState<DoubanMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    // Guard to prevent the cache-save effect from writing during a cache restore
    const isRestoringRef = useRef(false);

    const loadMovies = useCallback(async (tag: string, pageStart: number, append = false) => {
        if (loading) return;

        setLoading(true);
        try {
            const tagValue = tags.find(t => t.id === tag)?.value || '热门';
            const response = await fetch(
                `/api/douban/recommend?type=${contentType}&tag=${encodeURIComponent(tagValue)}&page_limit=${PAGE_LIMIT}&page_start=${pageStart}`
            );

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const newMovies = data.subjects || [];

            setMovies(prev => append ? [...prev, ...newMovies] : newMovies);
            setHasMore(newMovies.length === PAGE_LIMIT);
        } catch (error) {
            console.error('Failed to load movies:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loading, tags, contentType]);

    useEffect(() => {
        // Try cache first to avoid redundant fetches when switching back to a visited tag
        if (selectedTag) {
            const cache = loadPopularCache();
            const cacheKey = `${contentType}:${selectedTag}`;
            const cachedEntry = cache[cacheKey];
            if (cachedEntry && cachedEntry.movies.length > 0) {
                isRestoringRef.current = true;
                setMovies(cachedEntry.movies);
                setHasMore(cachedEntry.hasMore);
                setPage(cachedEntry.page);
                return;
            }
        }

        // Cache miss — fetch fresh
        setPage(0);
        setMovies([]);
        setHasMore(true);
        loadMovies(selectedTag, 0, false);
    }, [selectedTag, contentType]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist to cache whenever results change (covers initial fetch + infinite scroll appends)
    useEffect(() => {
        if (!selectedTag || movies.length === 0) return;
        // Skip the write right after a cache restore (data is identical)
        if (isRestoringRef.current) {
            isRestoringRef.current = false;
            return;
        }
        const cache = loadPopularCache();
        const cacheKey = `${contentType}:${selectedTag}`;
        cache[cacheKey] = {
            movies,
            hasMore,
            page,
            dateKey: getTodayKey(),
        };
        savePopularCache(cache);
    }, [movies, hasMore, page, selectedTag, contentType]);

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            setPage(nextPage);
            loadMovies(selectedTag, nextPage * PAGE_LIMIT, true);
        },
    });

    return {
        movies,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    };
}
