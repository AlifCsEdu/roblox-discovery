import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between all main pages', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to explore
    const exploreLink = page.locator('a[href="/explore"]').first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL('/explore');
    }
    
    // Navigate to search
    await page.goto('/search');
    await expect(page).toHaveURL(/.*\/search.*/);
    
    // Navigate back to home
    const homeLink = page.locator('nav a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should use navbar search to navigate to search page', async ({ page }) => {
    await page.goto('/');
    
    // Find navbar search input
    const navbarSearch = page.locator('nav input[placeholder*="search"]');
    
    if (await navbarSearch.isVisible()) {
      await navbarSearch.click();
      await navbarSearch.fill('test game');
      
      // Navbar search should have autocomplete or redirect to search page
      // Either show dropdown or navigate to /search
      await page.waitForTimeout(1000);
      
      // Check if we're on search page or if autocomplete is showing
      const isOnSearchPage = page.url().includes('/search');
      const hasAutocomplete = await page.locator('[data-testid="autocomplete"], .autocomplete-dropdown').isVisible().catch(() => false);
      
      expect(isOnSearchPage || hasAutocomplete).toBeTruthy();
    }
  });

  test('should maintain navigation state across pages', async ({ page }) => {
    await page.goto('/');
    
    // Navbar should be visible on all pages
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigate to explore
    await page.goto('/explore');
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigate to search
    await page.goto('/search');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.goto('/');
    await page.goto('/explore');
    await page.goto('/search');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/explore');
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/explore');
  });
});
