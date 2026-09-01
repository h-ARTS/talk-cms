import {
  createPageSlug,
  parsePageSlug,
  slugifyPageName,
} from "@/pages/core/page-slug"

describe("slugifyPageName", () => {
  test("converts a page name into a URL-safe slug", () => {
    expect(slugifyPageName("Home Page V2")).toBe("home-page-v2")
  })

  test("collapses special characters and whitespace", () => {
    expect(slugifyPageName("  Über uns – Jetzt! ")).toBe("uber-uns-jetzt")
  })

  test("returns an empty string when nothing usable remains", () => {
    expect(slugifyPageName("---")).toBe("")
  })
})

describe("createPageSlug", () => {
  test("combines id and slugified name", () => {
    expect(
      createPageSlug({
        id: "5df82e90-1887-4c0b-8ea3-0b3f6145ca12",
        name: "Home Page V2",
      })
    ).toBe("5df82e90-1887-4c0b-8ea3-0b3f6145ca12-home-page-v2")
  })

  test("falls back to the bare id when the page has no name", () => {
    expect(
      createPageSlug({ id: "5df82e90-1887-4c0b-8ea3-0b3f6145ca12", name: null })
    ).toBe("5df82e90-1887-4c0b-8ea3-0b3f6145ca12")
  })
})

describe("parsePageSlug", () => {
  test("extracts the id from a combined slug", () => {
    expect(
      parsePageSlug("5df82e90-1887-4c0b-8ea3-0b3f6145ca12-home-page-v2")
    ).toBe("5df82e90-1887-4c0b-8ea3-0b3f6145ca12")
  })

  test("accepts a plain id", () => {
    expect(parsePageSlug("5df82e90-1887-4c0b-8ea3-0b3f6145ca12")).toBe(
      "5df82e90-1887-4c0b-8ea3-0b3f6145ca12"
    )
  })

  test("ignores a stale name segment after a rename", () => {
    expect(parsePageSlug("5df82e90-1887-4c0b-8ea3-0b3f6145ca12-old-name")).toBe(
      "5df82e90-1887-4c0b-8ea3-0b3f6145ca12"
    )
  })

  test("rejects values without a leading page id", () => {
    expect(parsePageSlug("home-page-v2")).toBeNull()
    expect(parsePageSlug("")).toBeNull()
    expect(parsePageSlug("5df82e90-not-a-uuid")).toBeNull()
  })
})
