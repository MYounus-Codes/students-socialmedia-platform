export interface SearchResult {
  id: string;
  title: string;
  type: "user" | "post" | "project" | "problem" | "topic" | "hashtag";
  summary: string;
}

export function searchIndex(query: string, items: SearchResult[]): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
