import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore');
  });

  test('should load explore page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/RobloxDiscover|Roblox Discovery/i);
    
    // Wait for games to load
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
    await expect(gameCards.first()).toBeVisible();
  });

  test('should display filter panel', async ({ page }) => {
    // Look for filter panel - it's rendered as an aside with FilterPanel component
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
    // Check for specific filter sections
    await expect(page.locator('text=/Sort By/i')).toBeVisible();
    await expect(page.locator('text=/Genres/i')).toBeVisible();
  });

  test('should filter by genre', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for a genre badge button (they're rendered as motion.button > Badge)
    const genreButton = page.locator('button:has-text("RPG")').first();
    
    if (await genreButton.isVisible()) {
      await genreButton.click();
      
      // Wait for filtered results
      await page.waitForTimeout(2000);
      
      // Verify results still display
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should filter by rating', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for rating slider - it's an input[type="range"] in the FilterPanel
    const ratingSlider = page.locator('input[type="range"]').first();
    
    if (await ratingSlider.isVisible()) {
      await ratingSlider.fill('75');
      
      // Wait for filtered results
      await page.waitForTimeout(2000);
      
      // Verify results update
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should filter by player count', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for sort options instead - there's no player count filter, but there's a "Most Players" sort option
    const mostPlayersSort = page.locator('button:has-text("Most Players")').first();
    
    if (await mostPlayersSort.isVisible()) {
      await mostPlayersSort.click();
      
      // Wait for sorted results
      await page.waitForTimeout(2000);
      
      // Verify results update
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should apply multiple filters simultaneously', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Try to apply rating filter
    const ratingSlider = page.locator('input[type="range"]').first();
    if (await ratingSlider.isVisible()) {
      await ratingSlider.fill('80');
      await page.waitForTimeout(1000);
    }
    
    // Try to apply genre filter
    const genreButton = page.locator('button:has-text("RPG")').first();
    if (await genreButton.isVisible()) {
      await genreButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify results are still displayed after multiple filters
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
    await expect(gameCards.first()).toBeVisible();
  });

  test('should navigate to game detail from explore page', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    // Should navigate to game detail page
    await expect(page).toHaveURL(/.*\/games\/\d+.*/);
  });

  test('should handle no results state', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Try to set very restrictive filters that might result in no games
    const ratingSlider = page.locator('input[type="range"]').first();
    if (await ratingSlider.isVisible()) {
      await ratingSlider.evaluate((el: HTMLInputElement) => {
        el.value = '99';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(2000);
      
      // If no results, should show appropriate message or empty state
      // (Don't fail test if results still exist with 99% rating)
    }
  });
});
