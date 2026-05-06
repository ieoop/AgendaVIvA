import { expect, test } from "@playwright/test";

test("public demo booking path is usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Convertí mensajes en citas pagadas automáticamente")).toBeVisible();
  await page.getByRole("link", { name: /Ver demo interactiva/i }).click();
  await expect(page.getByText("Probá cómo Alma convierte")).toBeVisible();
  await page.goto("/b/estetica-palermo/book");
  await expect(page.getByText("Elegí servicio y horario")).toBeVisible();
});
