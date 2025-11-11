import { test, expect } from '@playwright/test';

test.describe('Genre Pages', () => {
  const genres = ['rpg', 'shooter', 'simulator'];

  for (const genre of genres) {
    test(`should load ${genre} genre page successfully`, async ({ page }) => {
      await page.goto(`/genres/${genre}`);
      
      await expect(page).toHaveTitle(new RegExp(genre, 'i'));
      
      // Wait for games to load
      await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
        timeout: 30000 
      });
      
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    });
  }

  test('should filter games by rating on genre page', async ({ page }) => {
    await page.goto('/genres/rpg');
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    // Look for rating filter slider or input
    const ratingFilter = page.locator('[data-testid="rating-filter"], input[type="range"]').first();
    
    if (await ratingFilter.isVisible()) {
      // Adjust rating filter
      await ratingFilter.fill('80');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify results still display
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should navigate to game detail from genre page', async ({ page }) => {
    await page.goto('/genres/rpg');
    
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const firstGame = page.locator('[data-testid="game-card"], .game-card, article').first();
    await firstGame.click();
    
    // Should navigate to game detail page
    await expect(page).toHaveURL(/.*\/games\/\d+.*/);
  });
});
