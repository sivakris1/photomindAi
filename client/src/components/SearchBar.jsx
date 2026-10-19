import React, { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBar({ onSearch, onClear, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }

    const handleClear = () => {
      setQuery("");
      onClear();
    };
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by meaning: 'certificate', 'sunset at beach', 'dog playing'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        {query && (
          <button type="button" className="btn-icon" onClick={handleClear}>
            <X size={18} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="btn-search"
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="spinner" />
            <span>AI Thinking...</span>
          </>
        ) : (
          <span>Search</span>
        )}
      </button>
    </form>
  );
}
