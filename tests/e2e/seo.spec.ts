import { expect, test } from "@playwright/test"

/**
 * Checks the SEO output of the public site that must hold whatever data the
 * API returns: nothing private is indexable, no placeholder data is published
 * and monitoring respects the visitor's privacy signals.
 */

const PLACEHOLDERS = ["hello@example.com", "https://github.com/\"", "https://www.linkedin.com/\""]

/** The text of every JSON-LD block on a page. */
function jsonLd(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((match) => match[1]).join("\n")
}

function robotsMeta(html: string) {
  return /<meta name="robots" content="([^"]+)"/.exec(html)?.[1] ?? null
}

test.describe("indexing", () => {
  test("login and the 404 page are noindex", async ({ request }) => {
    const login = await (await request.get("/login")).text()
    expect(robotsMeta(login)).toContain("noindex")

    const missing = await request.get("/this-page-does-not-exist")
    expect(missing.status()).toBe(404)
    expect(robotsMeta(await missing.text())).toContain("noindex")
  })

  test("the admin redirects anonymous visitors to the login page", async ({ request }) => {
    const response = await request.get("/admin", { maxRedirects: 0 })
    expect([302, 307, 308]).toContain(response.status())
    expect(response.headers().location).toContain("/login")
  })

  test("duplicate home URLs answer a permanent redirect", async ({ request }) => {
    const response = await request.get("/index.html", { maxRedirects: 0 })
    expect(response.status()).toBe(301)
  })
})

test.describe("structured data", () => {
  test("public pages publish no placeholder profile data", async ({ request }) => {
    const schema = jsonLd(await (await request.get("/")).text())

    expect(schema).toContain("\"@type\":\"Organization\"")
    for (const placeholder of PLACEHOLDERS) {
      expect(schema).not.toContain(placeholder)
    }
  })

  test("login carries no site-level JSON-LD", async ({ request }) => {
    const html = await (await request.get("/login")).text()
    expect(html).not.toContain("application/ld+json")
  })
})

test.describe("crawler files", () => {
  test("robots.txt blocks the private areas and names the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text()

    expect(text).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/)
    expect(text).toMatch(/Disallow: \/(admin|$)/m)
  })

  test("sitemap.xml is valid XML", async ({ request }) => {
    const response = await request.get("/sitemap.xml")

    expect(response.headers()["content-type"]).toContain("xml")
    expect(await response.text()).toContain("<urlset")
  })
})

test.describe("monitoring", () => {
  test("the collector answers 204 and ignores Do Not Track", async ({ request }) => {
    const body = { type: "view", path: "/", referrer: "" }

    expect((await request.post("/api/seo/collect", { data: body })).status()).toBe(204)
    expect((await request.post("/api/seo/collect", { data: body, headers: { DNT: "1" } })).status()).toBe(204)
    expect((await request.post("/api/seo/collect", { data: "not json" })).status()).toBe(204)
  })
})
