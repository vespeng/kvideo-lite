/**
 * Search box event handlers hook
 */

import { FormEvent, RefObject } from 'react';

interface UseSearchBoxHandlersProps {
    query: string;
    setQuery: (query: string) => void;
    onSearch: (query: string) => void;
    onClear?: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
    isDropdownOpen: boolean;
    highlightedIndex: number;
    searchHistory: Array<{ query: string }>;
    addSearch: (query: string) => void;
    hideDropdown: () => void;
    showDropdown: () => void;
    resetHighlight: () => void;
    selectHistoryItem: (query: string) => void;
    navigateDropdown: (direction: 'up' | 'down') => void;
}

export function useSearchBoxHandlers({
    query,
    setQuery,
    onSearch,
    onClear,
    inputRef,
    isDropdownOpen,
    highlightedIndex,
    searchHistory,
    addSearch,
    hideDropdown,
    showDropdown,
    resetHighlight,
    selectHistoryItem,
    navigateDropdown,
}: UseSearchBoxHandlersProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            addSearch(query.trim());
            onSearch(query);
            hideDropdown();
            inputRef.current?.blur();
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onClear) {
            onClear();
        }
        resetHighlight();
    };

    const handleInputFocus = () => {
        showDropdown();
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (relatedTarget && relatedTarget.closest('.search-history-dropdown')) {
            return;
        }
        hideDropdown();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateDropdown('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateDropdown('up');
                break;
            case 'Enter':
                if (highlightedIndex >= 0 && searchHistory[highlightedIndex]) {
                    e.preventDefault();
                    selectHistoryItem(searchHistory[highlightedIndex].query);
                }
                break;
            case 'Escape':
                hideDropdown();
                inputRef.current?.blur();
                break;
        }
    };

    return {
        handleSubmit,
        handleClear,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    };
}
