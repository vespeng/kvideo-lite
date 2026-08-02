
import { ResultsHeader } from '@/components/search/ResultsHeader';
import { VideoGrid } from '@/components/search/VideoGrid';
import { Video, SourceBadge } from '@/lib/types';

interface SearchResultsProps {
    results: Video[];
    availableSources: SourceBadge[];
    loading: boolean;
    isPremium?: boolean;
    latencies?: Record<string, number>;
}

export function SearchResults({
    results,
    availableSources,
    loading,
    isPremium = false,
    latencies = {},
}: SearchResultsProps) {
    if (results.length === 0 && !loading) return null;

    return (
        <div className="animate-fade-in">
            <ResultsHeader
                loading={loading}
                resultsCount={results.length}
                availableSources={availableSources}
            />

            {/* Display videos */}
            <VideoGrid
                videos={results}
                isPremium={isPremium}
                latencies={latencies}
            />
        </div>
    );
}
