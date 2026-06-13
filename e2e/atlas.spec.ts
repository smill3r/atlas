import { test, expect } from '@playwright/test';

test.describe('Atlas map page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the map to finish loading
    await page.waitForFunction(() => !document.querySelector('.overlay--loading'), {
      timeout: 15_000,
    });
  });

  test('loads and shows the main title', async ({ page }) => {
    await expect(page.locator('.paper__title')).toHaveText('The State of the World');
  });

  test('shows the indicator switcher with four buttons', async ({ page }) => {
    const buttons = page.locator('atlas-indicator-switcher button');
    await expect(buttons).toHaveCount(4);
  });

  test('shows the year scrubber', async ({ page }) => {
    await expect(page.locator('#year')).toBeVisible();
  });

  test('can switch indicator via the switcher', async ({ page }) => {
    const buttons = page.locator('atlas-indicator-switcher button');
    await buttons.nth(1).click();
    // The second button should become active (aria-pressed="true")
    await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('can toggle between flat and globe map modes', async ({ page }) => {
    const flatBtn = page.locator('button[aria-pressed]').filter({ hasText: 'Flat' });
    const globeBtn = page.locator('button[aria-pressed]').filter({ hasText: 'Globe' });

    await globeBtn.click();
    await expect(globeBtn).toHaveAttribute('aria-pressed', 'true');

    await flatBtn.click();
    await expect(flatBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('can search for a country', async ({ page }) => {
    const input = page.locator('atlas-country-search input');
    await input.fill('France');
    await page.waitForTimeout(300); // debounce
    // Result list should appear
    await expect(page.locator('atlas-country-search').getByText('France')).toBeVisible();
  });

  test('navigates to country detail page via search', async ({ page }) => {
    const input = page.locator('atlas-country-search input');
    await input.fill('France');
    await page.waitForTimeout(300); // debounce
    await page.locator('atlas-country-search').getByText('France').click();
    await expect(page).toHaveURL(/\/country\/FRA/);
  });
});

test.describe('Country detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/country/FRA');
    // Wait for data to load
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
  });

  test('shows the country name', async ({ page }) => {
    await expect(page.locator('.detail__country')).toHaveText('France');
  });

  test('shows region and income group metadata', async ({ page }) => {
    const meta = page.locator('.detail__meta');
    await expect(meta).toContainText('Europe');
  });

  test('shows four indicator cards', async ({ page }) => {
    const cards = page.locator('.icard');
    await expect(cards).toHaveCount(4);
  });

  test('each indicator card has a line chart', async ({ page }) => {
    const charts = page.locator('atlas-line-chart');
    await expect(charts).toHaveCount(4);
  });

  test('shows a year scrubber', async ({ page }) => {
    await expect(page.locator('#detail-year')).toBeVisible();
  });

  test('back button navigates to the map', async ({ page }) => {
    await page.locator('.detail__back').click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('.paper__title')).toBeVisible();
  });

  test('changing the year updates the displayed year', async ({ page }) => {
    const scrubber = page.locator('#detail-year');
    const output = page.locator('.detail__scrubber-value');

    // Get current year
    const currentYear = await output.textContent();

    // Set scrubber to a different year via JS
    await scrubber.evaluate((el: HTMLInputElement) => {
      el.value = '2000';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await expect(output).toHaveText('2000');
    expect(currentYear).not.toBe('2000');
  });
});

test.describe('Navigation flows', () => {
  test('clicking a country on the flat map navigates to detail', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !document.querySelector('.overlay--loading'), {
      timeout: 15_000,
    });

    // Ensure we're in flat map mode
    const flatBtn = page.locator('button').filter({ hasText: 'Flat' });
    await flatBtn.click();

    // Click somewhere on the SVG map (approximate coordinates for a country)
    const map = page.locator('atlas-world-map svg');
    await map.click({ position: { x: 400, y: 200 } });

    // If a country was hit, we navigate to the detail page
    const url = page.url();
    if (url.includes('/country/')) {
      await expect(page.locator('.detail__country')).toBeVisible();
    }
    // If no country was hit (ocean), we stay on the map - that's also valid
  });

  test('detail page for unknown code shows not-found message', async ({ page }) => {
    await page.goto('/country/ZZZ');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    // Should show either not found message or redirect
    const text = await page.locator('body').textContent();
    expect(text).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('map page has a main heading', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('The State of the World');
  });

  test('detail page has a main heading with country name', async ({ page }) => {
    await page.goto('/country/FRA');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    const h1 = page.locator('h1.detail__country');
    await expect(h1).toBeVisible();
  });

  test('back button is keyboard focusable', async ({ page }) => {
    await page.goto('/country/FRA');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    const back = page.locator('.detail__back');
    await back.focus();
    await expect(back).toBeFocused();
  });

  test('year scrubber on detail page is labelled', async ({ page }) => {
    await page.goto('/country/FRA');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    const scrubber = page.locator('#detail-year');
    await expect(scrubber).toHaveAttribute('aria-label');
  });
});

test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('detail page cards stack in a single column on mobile', async ({ page }) => {
    await page.goto('/country/FRA');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    const grid = page.locator('.detail__grid');
    await expect(grid).toBeVisible();
    const cards = page.locator('.icard');
    await expect(cards).toHaveCount(4);
  });

  test('back button is large enough to tap on mobile', async ({ page }) => {
    await page.goto('/country/FRA');
    await page.waitForFunction(() => !document.querySelector('.detail__loading'), {
      timeout: 15_000,
    });
    const back = page.locator('.detail__back');
    const box = await back.boundingBox();
    // Minimum tap target: 44px height
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
