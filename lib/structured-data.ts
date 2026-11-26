import type { SeoIdentity } from "@/lib/seo/types"

function entityId(origin: string) {
  return `${origin}#entity`
}

function websiteId(origin: string) {
  return `${origin}#website`
}

function originOf(identity: SeoIdentity) {
  return identity.site_url.replace(/\/$/, "")
}

/**
 * The site owner (Organization or Person) from the backend SEO settings.
 * Only fields an admin has filled in are emitted, so no placeholder data
 * can reach search engines.
 */
export function entitySchema(
  identity: SeoIdentity,
  description?: string | null,
): Record<string, unknown> {
  const origin = originOf(identity)
  const about = identity.tagline ?? description

  return {
    "@context": "https://schema.org",
    "@type": identity.entity_type,
    "@id": entityId(origin),
    name: identity.name,
    url: origin,
    ...(about ? { description: about } : {}),
    ...(identity.logo_url && identity.entity_type === "Organization" ? { logo: identity.logo_url } : {}),
    ...(identity.contact_email ? { email: identity.contact_email } : {}),
    ...(identity.same_as.length > 0 ? { sameAs: identity.same_as } : {}),
  }
}

export function websiteSchema(
  identity: SeoIdentity,
  description?: string | null,
): Record<string, unknown> {
  const origin = originOf(identity)

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: identity.name,
    ...(description ? { description } : {}),
    "@id": websiteId(origin),
    url: origin,
    inLanguage: identity.locale.replace("_", "-"),
    publisher: { "@id": entityId(origin) },
  }
}

/** BreadcrumbList for an inner page; the home page is always the first item. */
export function breadcrumbSchema(
  identity: SeoIdentity,
  items: readonly { name: string; path: string }[],
): Record<string, unknown> {
  const origin = originOf(identity)
  const trail = [{ name: "Home", path: "/" }, ...items]

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path === "/" ? "/" : item.path}`,
    })),
  }
}

export function siteStructuredData(
  identity: SeoIdentity,
  description?: string | null,
): Record<string, unknown>[] {
  return [entitySchema(identity, description), websiteSchema(identity, description)]
}
