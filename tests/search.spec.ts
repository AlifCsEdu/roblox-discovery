import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should load search page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/RobloxDiscover|Roblox Discovery/i);
    await expect(page.locator('input[placeholder*="search"]')).toBeVisible();
  });

  test('should perform first search successfully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]');
    
    // Type search query
    await searchInput.fill('bloxburg');
    
    // Press Enter to trigger search
    await searchInput.press('Enter');
    
    // Wait for results to load (should see game cards)
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    // Verify results are displayed
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
    await expect(gameCards.first()).toBeVisible();
    
    // Verify no error state
    await expect(page.locator('text=/no results/i')).not.toBeVisible();
  });

  test('should perform second search successfully (fixing duplicate API calls bug)', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]');
    
    // First search
    await searchInput.fill('bloxburg');
    await searchInput.press('Enter');
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    // Clear and perform second search
    await searchInput.clear();
    await searchInput.fill('jailbreak');
    await searchInput.press('Enter');
    
    // Wait for new results
    await page.waitForTimeout(1000); // Brief wait for API call
    
    // Verify second search results load (this was failing before the fix)
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
    
    const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
    await expect(gameCards.first()).toBeVisible();
    
    // Verify no loading spinner stuck state
    await expect(page.locator('[data-testid="loading"], .spinner')).not.toBeVisible({ timeout: 5000 });
    
    // Verify no "no results" error
    await expect(page.locator('text=/no results/i')).not.toBeVisible();
  });

  test('should perform multiple consecutive searches', async ({ page }) => {
    test.setTimeout(90000); // Increase timeout for 3 searches (3 × 30s)
    const searchInput = page.locator('input[placeholder*="search"]');
    const queries = ['adopt me', 'tower defense', 'simulator'];
    
    for (const query of queries) {
      await searchInput.clear();
      await searchInput.fill(query);
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
        timeout: 30000 
      });
      
      // Verify results are visible
      const gameCards = page.locator('[data-testid="game-card"], .game-card, article');
      await expect(gameCards.first()).toBeVisible();
    }
  });

  test('should handle empty search query gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]');
    
    // Try to search with empty query
    await searchInput.press('Enter');
    
    // Should not crash or show errors
    await expect(page.locator('text=/error/i')).not.toBeVisible();
  });

  test('should update URL with search query', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]');
    
    await searchInput.fill('simulator');
    await searchInput.press('Enter');
    
    // Wait for URL to update (note: URL parameter is 'q' not 'query')
    await page.waitForURL(/.*q=simulator.*/);
    
    // Verify URL contains the query
    expect(page.url()).toContain('q=simulator');
  });

  test('should preserve search query from URL on page load', async ({ page }) => {
    // Navigate directly with query parameter (note: URL parameter is 'q' not 'query')
    await page.goto('/search?q=bloxburg');
    
    // Verify input is populated
    const searchInput = page.locator('input[placeholder*="search"]');
    await expect(searchInput).toHaveValue('bloxburg');
    
    // Verify results are loaded
    await page.waitForSelector('[data-testid="game-card"], .game-card, article', { 
      timeout: 30000 
    });
  });
});
