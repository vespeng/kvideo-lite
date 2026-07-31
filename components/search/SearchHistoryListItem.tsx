/**
 * Individual search history list item
 */

import { Icons } from '@/components/ui/Icon';
import type { SearchHistoryItem } from '@/lib/store/search-history-store';

interface SearchHistoryListItemProps {
    item: SearchHistoryItem;
    index: number;
    isHighlighted: boolean;
    onSelectItem: (query: string) => void;
    onRemoveItem: (query: string) => void;
}

export function SearchHistoryListItem({
    item,
    index,
    isHighlighted,
    onSelectItem,
    onRemoveItem,
}: SearchHistoryListItemProps) {
    return (
        <div
            data-index={index}
            role="option"
            aria-selected={isHighlighted}
            className={`search-history-item ${isHighlighted ? 'highlighted' : ''}`}
            onClick={(e) => {
                e.preventDefault();
                onSelectItem(item.query);
            }}
            tabIndex={0}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icons.Search
                    size={16}
                    className="flex-shrink-0 text-[var(--text-color-secondary)]"
                />
                <span className="text-[var(--text-color)] truncate flex-1">
                    {item.query}
                </span>
                {item.resultCount !== undefined && (
                    <span className="text-xs text-[var(--text-color-secondary)] flex-shrink-0">
                        {item.resultCount} 个结果
                    </span>
                )}
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveItem(item.query);
                }}
                className="search-history-remove"
                aria-label={`删除 "${item.query}"`}
                tabIndex={0}
            >
                <Icons.X size={14} />
            </button>
        </div>
    );
}
