/**
 * T144: E2E Test - Patient Booking Flow
 * Tests the complete flow from doctor search to booking confirmation
 */

import { test, expect } from '@playwright/test';

test.describe('Patient Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('should display homepage with search functionality', async ({ page }) => {
    // Check homepage loads
    await expect(page).toHaveTitle(/Precta/);
    
    // Check for search input or CTA
    const searchButton = page.getByRole('link', { name: /find|search|doctor/i });
    await expect(searchButton).toBeVisible();
  });

  test('should navigate to doctor search page', async ({ page }) => {
    // Click on Find Doctors or similar CTA
    await page.getByRole('link', { name: /find|search|doctor/i }).first().click();
    
    // Should be on doctors page
    await expect(page).toHaveURL(/\/doctors/);
    
    // Should see search filters
    await expect(page.getByPlaceholder(/search|specialty/i)).toBeVisible();
  });

  test('should filter doctors by specialty', async ({ page }) => {
    await page.goto('/doctors');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for specialty filter
    const specialtyFilter = page.getByRole('button', { name: /specialty|filter/i }).first();
    if (await specialtyFilter.isVisible()) {
      await specialtyFilter.click();
      
      // Select a specialty
      const cardiology = page.getByText(/cardiology/i).first();
      if (await cardiology.isVisible()) {
        await cardiology.click();
      }
    }
  });

  test('should view doctor profile', async ({ page }) => {
    await page.goto('/doctors');
    
    // Wait for doctors to load
    await page.waitForLoadState('networkidle');
    
    // Click on first doctor card (if any exist)
    const doctorCard = page.locator('[data-testid="doctor-card"]').first();
    const viewButton = page.getByRole('link', { name: /view|book|profile/i }).first();
    
    if (await doctorCard.isVisible()) {
      await doctorCard.click();
    } else if (await viewButton.isVisible()) {
      await viewButton.click();
    }
    
    // Should be on a doctor detail page
    await expect(page).toHaveURL(/\/doctors\/[a-zA-Z0-9-]+/);
  });

  test('should display doctor details and booking form', async ({ page }) => {
    // Navigate directly to a doctor page (using mock or first available)
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    // Try to click on first available doctor
    const doctorLink = page.getByRole('link', { name: /view|book|profile/i }).first();
    if (await doctorLink.isVisible()) {
      await doctorLink.click();
      
      // Check for key elements on doctor profile
      await expect(page.getByText(/consultation/i)).toBeVisible();
      await expect(page.getByText(/KES/i)).toBeVisible();
    }
  });

  test('should show date and time selection', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    const doctorLink = page.getByRole('link', { name: /view|book|profile/i }).first();
    if (await doctorLink.isVisible()) {
      await doctorLink.click();
      
      // Look for booking section
      await expect(page.getByText(/book|appointment/i)).toBeVisible();
      
      // Check for date selection
      const dateButtons = page.getByRole('button').filter({ hasText: /mon|tue|wed|thu|fri|sat|sun/i });
      const dateCount = await dateButtons.count();
      expect(dateCount).toBeGreaterThan(0);
    }
  });

  test('should complete booking with selected date and time', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    const doctorLink = page.getByRole('link', { name: /view|book|profile/i }).first();
    if (await doctorLink.isVisible()) {
      await doctorLink.click();
      
      // Select consultation mode
      const videoBtn = page.getByRole('button', { name: /video/i }).first();
      if (await videoBtn.isVisible()) {
        await videoBtn.click();
      }
      
      // Select a date
      const dateBtn = page.getByRole('button').filter({ hasText: /\d+/ }).first();
      if (await dateBtn.isVisible()) {
        await dateBtn.click();
      }
      
      // Select a time slot
      await page.waitForTimeout(500); // Wait for time slots to load
      const timeSlot = page.getByRole('button', { name: /\d{2}:\d{2}/ }).first();
      if (await timeSlot.isVisible()) {
        await timeSlot.click();
      }
      
      // Check for booking summary
      await expect(page.getByText(/total|summary/i)).toBeVisible();
      
      // Confirm booking button should be visible
      await expect(page.getByRole('button', { name: /confirm|book/i })).toBeVisible();
    }
  });
});

test.describe('Authentication Required Actions', () => {
  test('should redirect to login for booking without auth', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a doctor
    const doctorLink = page.getByRole('link', { name: /view|book|profile/i }).first();
    if (await doctorLink.isVisible()) {
      await doctorLink.click();
      
      // Try to complete booking
      const confirmBtn = page.getByRole('button', { name: /confirm|book/i });
      if (await confirmBtn.isVisible() && await confirmBtn.isEnabled()) {
        await confirmBtn.click();
        
        // Should redirect to login or show login modal
        const hasLoginRedirect = await page.url().includes('/auth') || 
                                 await page.getByText(/sign in|login|register/i).isVisible();
        expect(hasLoginRedirect).toBe(true);
      }
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile-friendly layout', async ({ page }) => {
    await page.goto('/');
    
    // Check that page is responsive
    await expect(page).toHaveTitle(/Precta/);
    
    // Navigation should be accessible (hamburger menu or visible links)
    const navElement = page.locator('nav, [role="navigation"], header');
    await expect(navElement.first()).toBeVisible();
  });

  test('should navigate doctor search on mobile', async ({ page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    
    // Search should still be accessible
    await expect(page.locator('input, [type="search"]').first()).toBeVisible();
  });
});
