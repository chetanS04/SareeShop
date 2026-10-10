/** Strip HTML/entities and drop known bad catalog copy (e.g. pasted polo listings). */
export function sanitizeCategoryDescription(raw?: string | null, maxLen = 160): string {
  const text = String(raw || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/<[^>]*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (/polo|t-?shirt|ausk|rib knit|full sleeve|men'?s cotton/i.test(text)) return "";

  const sample = text.slice(0, 28);
  if (sample.length >= 12 && text.split(sample).length >= 4) return "";

  if (maxLen > 0 && text.length > maxLen) {
    return `${text.slice(0, maxLen).trim()}…`;
  }
  return text;
}

export function categoryDescriptionOrFallback(
  raw?: string | null,
  fallback = "Browse sarees from this category — handloom weaves and styles that match you."
): string {
  const clean = sanitizeCategoryDescription(raw, 0);
  return clean || fallback;
}
