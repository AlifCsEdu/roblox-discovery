import { test, expect } from '@playwright/test';

test.describe('Game Detail Pages', () => {
  test('should load game detail page successfully', async ({ page }) => {
    // First, go to homepage and click on a game
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    // Wait for game detail page to load
    await expect(page).toHaveURL(/.*\/games\/\d+.*/);
    
    // Check for game title/name
    await expect(page.locator('h1, [data-testid="game-title"]')).toBeVisible({ timeout: 30000 });
  });

  test('should display game information', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    // Wait for game detail page
    await page.waitForURL(/.*\/games\/\d+.*/);
    
    // Should display game stats (players, rating, etc)
    await expect(page.locator('text=/players|rating|votes/i').first()).toBeVisible({ timeout: 30000 });
  });

  test('should have share button', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    await page.waitForURL(/.*\/games\/\d+.*/);
    
    // Look for share button
    const shareButton = page.locator('[data-testid="share-button"], button:has-text("Share")').first();
    await expect(shareButton).toBeVisible({ timeout: 30000 });
  });

  test('should navigate back to homepage from game detail', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    await page.waitForURL(/.*\/games\/\d+.*/);
    
    // Click back or navigate to home
    const homeLink = page.locator('nav a[href="/"]').first();
    await homeLink.click();
    
    await expect(page).toHaveURL('/');
  });

  test('should handle invalid game ID gracefully', async ({ page }) => {
    await page.goto('/games/999999999999');
    
    // Should show error or not found state - wait longer for query to fail
    await expect(page.locator('text=/not found|error|doesn\'t exist|failed/i').first()).toBeVisible({ timeout: 30000 });
  });
});
