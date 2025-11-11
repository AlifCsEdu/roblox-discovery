import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/RobloxDiscover|Roblox Discovery/i);
  });

  test('should display navigation bar', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav').getByText('RobloxDiscover')).toBeVisible();
  });

  test('should have search bar in navbar', async ({ page }) => {
    // Search bar is visible on desktop (md breakpoint and above)
    // Look for it in the mobile section which is always in DOM
    const mobileSearch = page.locator('nav input[type="text"]').first();
    await expect(mobileSearch).toBeVisible();
  });

  test('should display trending games section', async ({ page }) => {
    // Look for game cards or grid
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
    await expect(gameCards.first()).toBeVisible();
  });

  test('should navigate to explore page', async ({ page }) => {
    const exploreLink = page.locator('nav a[href="/explore"]').first();
    await exploreLink.click();
    
    await expect(page).toHaveURL(/.*\/explore.*/);
  });

  test('should navigate to game detail when clicking game card', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    
    // Wait for the element and click
    await firstGame.waitFor({ state: 'visible' });
    await firstGame.click({ timeout: 10000 });
    
    // Should navigate to game detail page - give it time to navigate
    await page.waitForURL(/.*\/games\/\d+.*/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/games\/\d+.*/);
  });

  test('should have theme toggle', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first();
    await expect(themeToggle).toBeVisible();
  });
});
