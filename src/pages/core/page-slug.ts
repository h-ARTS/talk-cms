const PAGE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/**
 * Converts a page name into a URL-safe slug segment, e.g. "Home Page V2" → "home-page-v2"
 */
export function slugifyPageName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Builds the public slug for a page: `$(uuid)-$(page-name)`,
 * e.g. "5df82e90-1887-4c0b-8ea3-0b3f6145ca12-home-page-v2".
 * Falls back to the bare id when the page has no name.
 */
export function createPageSlug(page: {
  id: string
  name: string | null
}): string {
  const nameSlug = page.name ? slugifyPageName(page.name) : ""
  return nameSlug ? `${page.id}-${nameSlug}` : page.id
}

/**
 * Extracts the page id from a slug or plain id. The name segment is
 * cosmetic — the id is authoritative, so renamed pages keep working.
 * Returns null when the value does not start with a page id.
 */
export function parsePageSlug(slug: string): string | null {
  const match = PAGE_ID_PATTERN.exec(slug.trim())
  if (!match) return null
  return match[0].toLowerCase()
}
