import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder, initialValue = '' }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t('home.searchPlaceholder')}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-12 pr-4 py-3 text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4"
        >
          {t('home.search')}
        </button>
      </div>
    </form>
  );
}
