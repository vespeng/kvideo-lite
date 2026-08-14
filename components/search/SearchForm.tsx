'use client';

import { SearchBox } from './SearchBox';

interface SearchFormProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  onCancelSearch?: () => void;
  isLoading: boolean;
  initialQuery?: string;
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
  placeholder?: string;
  isPremium?: boolean;
}

export function SearchForm({
  onSearch,
  onClear,
  onCancelSearch,
  isLoading,
  initialQuery = '',
  currentSource = '',
  checkedSources = 0,
  totalSources = 16,
  placeholder,
  isPremium = false,
}: SearchFormProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <SearchBox
        onSearch={onSearch}
        onClear={onClear}
        initialQuery={initialQuery}
        placeholder={placeholder}
        isPremium={isPremium}
      />
    </div>
  );
}
