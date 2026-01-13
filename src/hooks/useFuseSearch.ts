/**
 * Custom hook for fuzzy search using Fuse.js
 * Provides configurable fuzzy search with highlighting support
 */
import { useMemo } from 'react';
import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';

export interface UseFuseSearchOptions<T> extends IFuseOptions<T> {
  /** Minimum number of characters before search is triggered */
  minChars?: number;
  /** Maximum number of results to return */
  limit?: number;
}

export interface FuseSearchResult<T> {
  item: T;
  score: number;
  matches?: {
    key: string;
    value: string;
    indices: [number, number][];
  }[];
}

const DEFAULT_OPTIONS: IFuseOptions<unknown> = {
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  useExtendedSearch: false,
  findAllMatches: true,
};

/**
 * Hook for fuzzy searching through a list of items
 * @param items - Array of items to search through
 * @param keys - Keys to search on (e.g., ['name', 'description'])
 * @param query - Search query string
 * @param options - Additional Fuse.js options
 * @returns Filtered and sorted results with match information
 */
export function useFuseSearch<T>(
  items: T[] | undefined | null,
  keys: string[],
  query: string,
  options?: UseFuseSearchOptions<T>
): FuseSearchResult<T>[] {
  const { minChars = 1, limit = 50, ...fuseOptions } = options || {};

  // Create Fuse instance with memoization
  const fuse = useMemo(() => {
    if (!items || items.length === 0) return null;
    
    return new Fuse(items, {
      ...DEFAULT_OPTIONS,
      ...fuseOptions,
      keys,
    });
  }, [items, keys, fuseOptions]);

  // Perform search with memoization
  const results = useMemo(() => {
    if (!fuse || !query || query.length < minChars) {
      // Return all items when no search query
      if (!query || query.length < minChars) {
        return (items || []).slice(0, limit).map(item => ({
          item,
          score: 0,
          matches: undefined,
        }));
      }
      return [];
    }

    const searchResults = fuse.search(query, { limit });
    
    return searchResults.map((result: FuseResult<T>) => ({
      item: result.item,
      score: result.score ?? 0,
      matches: result.matches?.map(match => ({
        key: match.key || '',
        value: match.value || '',
        indices: match.indices as [number, number][],
      })),
    }));
  }, [fuse, query, minChars, limit, items]);

  return results;
}

/**
 * Utility function to highlight matched text segments
 * @param text - Original text
 * @param indices - Array of [start, end] tuples for matched segments
 * @returns Array of { text, isMatch } segments
 */
export function getHighlightSegments(
  text: string,
  indices: [number, number][] | undefined
): { text: string; isMatch: boolean }[] {
  if (!indices || indices.length === 0) {
    return [{ text, isMatch: false }];
  }

  const segments: { text: string; isMatch: boolean }[] = [];
  let lastIndex = 0;

  // Sort indices by start position
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sortedIndices) {
    // Add non-matching text before this match
    if (start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, start),
        isMatch: false,
      });
    }

    // Add matching text
    segments.push({
      text: text.slice(start, end + 1),
      isMatch: true,
    });

    lastIndex = end + 1;
  }

  // Add remaining non-matching text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments;
}

/**
 * Pre-configured search options for common use cases
 */
export const SEARCH_PRESETS = {
  /** Strict matching - lower threshold, exact position matters */
  strict: {
    threshold: 0.2,
    distance: 50,
    ignoreLocation: false,
  },
  /** Loose matching - higher threshold, position doesn't matter */
  loose: {
    threshold: 0.6,
    distance: 200,
    ignoreLocation: true,
  },
  /** Command palette style - optimized for short commands */
  commands: {
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    ignoreLocation: true,
  },
  /** Content search - for longer text content */
  content: {
    threshold: 0.5,
    distance: 500,
    minMatchCharLength: 3,
    ignoreLocation: true,
    findAllMatches: true,
  },
} as const;
