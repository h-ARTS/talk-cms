import { expect, test } from "@playwright/test"

const campaignHero = {
  name: "CampaignHero",
  metadata: {
    label: "Campaign hero",
    description: "A campaign headline with an optional destination.",
    category: "Campaign",
  },
  fields: [
    {
      key: "headline",
      type: "text",
      label: "Headline",
      default: "",
    },
  ],
  allowedChildren: false,
}

test("keeps page and API routes separate and manages definitions", async ({
  page,
  request,
}) => {
  await request.delete("/api/block-definitions?name=CampaignHero")

  const createResponse = await request.post("/api/block-definitions", {
    data: campaignHero,
  })
  expect(createResponse.status()).toBe(201)

  const duplicateResponse = await request.post("/api/block-definitions", {
    data: { ...campaignHero, name: "campaignhero" },
  })
  expect(duplicateResponse.status()).toBe(409)

  await page.goto("/blocks")
  await expect(page.getByTestId("block-row-CampaignHero")).toBeVisible()

  await page.getByLabel("Edit Campaign hero").click()
  await page.getByLabel("Display name").fill("Campaign banner")
  await page.getByTestId("save-block-definition").click()
  await expect(page.getByText("Campaign banner saved.")).toBeVisible()
  await expect(page.getByTestId("block-row-CampaignHero")).toContainText(
    "Campaign banner"
  )

  page.on("dialog", (dialog) => dialog.accept())
  await page.getByTestId("block-delete-CampaignHero").click()
  await expect(page.getByTestId("block-row-CampaignHero")).toHaveCount(0)

  const listResponse = await request.get("/api/block-definitions")
  expect(listResponse.status()).toBe(200)
  await expect(listResponse.json()).resolves.toEqual([])
})
