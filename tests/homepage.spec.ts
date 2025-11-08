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
    await expect(page.locator('text=/Roblox Discovery/i')).toBeVisible();
  });

  test('should have search bar in navbar', async ({ page }) => {
    const navbarSearch = page.locator('nav input[placeholder*="search"]');
    await expect(navbarSearch).toBeVisible();
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
    const exploreLink = page.locator('a[href="/explore"], text=/explore/i').first();
    await exploreLink.click();
    
    await expect(page).toHaveURL(/.*\/explore.*/);
  });

  test('should navigate to game detail when clicking game card', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    // Should navigate to game detail page
    await expect(page).toHaveURL(/.*\/games\/\d+.*/);
  });

  test('should have theme toggle', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first();
    await expect(themeToggle).toBeVisible();
  });
});
