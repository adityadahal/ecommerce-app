"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { TextInput, Transition } from "@mantine/core";
import { formatPrice } from "@/lib/utils";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  unit: string;
  category: { name: string };
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results on debounced query change
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
          setLoading(false);
          setHighlightedIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIndex].slug);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          leftSection={<Search size={16} className="text-stone-400" />}
          rightSection={loading ? <Loader2 className="animate-spin text-stone-400" size={16} /> : undefined}
        />
      </form>

      <Transition mounted={isOpen && results.length > 0} transition="fade" duration={150}>
        {(styles) => (
          <div style={styles} className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-96 overflow-auto rounded-xl border border-stone-200 bg-white shadow-xl">
            {results.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.slug)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index === highlightedIndex ? "bg-stone-50" : "hover:bg-stone-50"
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  <Image
                    src={product.images[0] || "/placeholder-product.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{product.name}</p>
                  <p className="text-xs text-stone-400">{product.category.name}</p>
                </div>
                <div className="text-sm font-bold text-emerald-600 shrink-0">
                  {formatPrice(product.price)}
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="w-full border-t border-stone-100 px-4 py-2.5 text-center text-sm font-medium text-emerald-600 hover:bg-stone-50 transition-colors"
            >
              View all results
            </button>
          </div>
        )}
      </Transition>

      <Transition mounted={isOpen && debouncedQuery.length >= 2 && results.length === 0 && !loading} transition="fade" duration={150}>
        {(styles) => (
          <div style={styles} className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
            <p className="text-sm text-stone-500 text-center">No products found</p>
          </div>
        )}
      </Transition>
    </div>
  );
}
