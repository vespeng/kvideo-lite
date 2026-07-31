/**
 * Empty state for search history dropdown
 */

import { Icons } from '@/components/ui/Icon';

export function SearchHistoryEmptyState() {
    return (
        <div className="search-history-empty">
            <Icons.Clock size={32} className="text-[var(--text-color-secondary)] mx-auto mb-2 opacity-50" />
            <span className="text-sm text-[var(--text-color-secondary)]">暂无搜索历史</span>
        </div>
    );
}
