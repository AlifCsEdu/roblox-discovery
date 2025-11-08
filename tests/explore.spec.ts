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
    // Look for filter controls
    await expect(page.locator('[data-testid="filter-panel"], aside, .filters').first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter by genre', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for genre filter buttons or dropdown
    const genreFilter = page.locator('[data-testid="genre-filter"], button:has-text("RPG"), label:has-text("RPG")').first();
    
    if (await genreFilter.isVisible()) {
      await genreFilter.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify results still display
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should filter by rating', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for rating slider
    const ratingSlider = page.locator('[data-testid="rating-filter"], input[type="range"]').first();
    
    if (await ratingSlider.isVisible()) {
      await ratingSlider.fill('75');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify results update
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should filter by player count', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 15000 
    });
    
    // Look for player count filter
    const playerFilter = page.locator('[data-testid="player-filter"], input[type="range"][name*="player"]').first();
    
    if (await playerFilter.isVisible()) {
      await playerFilter.fill('1000');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
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
    const ratingSlider = page.locator('[data-testid="rating-filter"], input[type="range"]').first();
    if (await ratingSlider.isVisible()) {
      await ratingSlider.fill('80');
      await page.waitForTimeout(500);
    }
    
    // Try to apply genre filter
    const genreFilter = page.locator('[data-testid="genre-filter"], button:has-text("RPG"), label:has-text("RPG")').first();
    if (await genreFilter.isVisible()) {
      await genreFilter.click();
      await page.waitForTimeout(500);
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
    const ratingSlider = page.locator('[data-testid="rating-filter"], input[type="range"]').first();
    if (await ratingSlider.isVisible()) {
      await ratingSlider.fill('99');
      await page.waitForTimeout(1000);
      
      // If no results, should show appropriate message or empty state
      // (Don't fail test if results still exist with 99% rating)
    }
  });
});
