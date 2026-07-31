/**
 * Header for search history dropdown
 */

import { Icons } from '@/components/ui/Icon';

interface SearchHistoryHeaderProps {
    onClearAll: () => void;
}

export function SearchHistoryHeader({ onClearAll }: SearchHistoryHeaderProps) {
    return (
        <div className="search-history-header">
            <div className="flex items-center gap-2">
                <Icons.Clock size={16} className="text-[var(--text-color-secondary)]" />
                <span className="text-sm font-medium text-[var(--text-color-secondary)]">
                    搜索历史
                </span>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                }}
                className="text-xs text-[var(--accent-color)] hover:underline transition-all cursor-pointer"
                aria-label="清除所有历史"
            >
                清除全部
            </button>
        </div>
    );
}
