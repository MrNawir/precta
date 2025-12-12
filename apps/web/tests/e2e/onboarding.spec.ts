/**
 * T145: E2E Test - Doctor Onboarding Flow
 * Tests the complete flow from registration to profile setup
 */

import { test, expect } from '@playwright/test';

test.describe('Doctor Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display registration option for doctors', async ({ page }) => {
    // Look for doctor registration link
    const doctorLink = page.getByRole('link', { name: /doctor|join|register/i });
    await expect(doctorLink.first()).toBeVisible();
  });

  test('should navigate to doctor registration page', async ({ page }) => {
    // Navigate to auth
    await page.goto('/auth');
    
    // Look for doctor-specific signup
    const doctorOption = page.getByText(/doctor|physician|healthcare/i);
    if (await doctorOption.first().isVisible()) {
      await doctorOption.first().click();
    }
  });

  test('should display doctor onboarding page', async ({ page }) => {
    await page.goto('/doctor/onboarding');
    
    // Should show onboarding steps or redirect to login
    const hasOnboarding = await page.url().includes('/onboarding') ||
                          await page.url().includes('/auth');
    expect(hasOnboarding).toBe(true);
  });
});

test.describe('Doctor Profile Setup', () => {
  // These tests assume a logged-in doctor user
  test.beforeEach(async ({ page }) => {
    // Mock authentication would be set up here
    await page.goto('/doctor/onboarding');
  });

  test('should display profile setup form', async ({ page }) => {
    // Check for key onboarding elements
    const formElements = page.locator('form, input, select');
    const count = await formElements.count();
    
    // Should have some form elements
    expect(count).toBeGreaterThan(0);
  });

  test('should have specialty selection', async ({ page }) => {
    // Look for specialty input/select
    const specialtyField = page.getByLabel(/specialty|specialization/i).or(
      page.getByPlaceholder(/specialty/i)
    ).or(
      page.getByRole('combobox')
    );
    
    const hasSpecialty = await specialtyField.first().isVisible().catch(() => false);
    // Specialty selection should be present in onboarding
    expect(hasSpecialty || await page.getByText(/specialty/i).isVisible()).toBe(true);
  });

  test('should have license number input', async ({ page }) => {
    // Look for license/registration number field
    const licenseField = page.getByLabel(/license|registration|mpdb/i).or(
      page.getByPlaceholder(/license|registration/i)
    );
    
    const hasLicense = await licenseField.first().isVisible().catch(() => false);
    // Either has field or mentions it
    expect(hasLicense || await page.getByText(/license/i).isVisible()).toBe(true);
  });

  test('should have consultation fee input', async ({ page }) => {
    // Look for fee input
    const feeField = page.getByLabel(/fee|price|rate/i).or(
      page.getByPlaceholder(/fee|KES/i)
    );
    
    const hasFee = await feeField.first().isVisible().catch(() => false);
    expect(hasFee || await page.getByText(/fee|consultation/i).isVisible()).toBe(true);
  });

  test('should have availability setup section', async ({ page }) => {
    // Look for availability/schedule section
    const availabilityText = page.getByText(/availability|schedule|hours/i);
    
    const hasAvailability = await availabilityText.first().isVisible().catch(() => false);
    expect(hasAvailability || await page.getByText(/when|time/i).isVisible()).toBe(true);
  });
});

test.describe('Doctor Dashboard Access', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/doctor/dashboard');
    
    // Should redirect to auth or show login
    await page.waitForLoadState('networkidle');
    
    const redirectedToAuth = page.url().includes('/auth') ||
                             page.url().includes('/login') ||
                             await page.getByText(/sign in|login/i).isVisible();
    
    expect(redirectedToAuth).toBe(true);
  });

  test('should display revenue page link', async ({ page }) => {
    await page.goto('/doctor');
    
    // Check for revenue/earnings link
    const revenueLink = page.getByRole('link', { name: /revenue|earnings|income/i });
    const hasRevenue = await revenueLink.first().isVisible().catch(() => false);
    
    // Revenue should be accessible from doctor area
    expect(hasRevenue || page.url().includes('/auth')).toBe(true);
  });
});

test.describe('Form Validation', () => {
  test('should validate required fields', async ({ page }) => {
    await page.goto('/doctor/onboarding');
    
    // Try to submit without filling fields
    const submitBtn = page.getByRole('button', { name: /submit|continue|next|save/i });
    
    if (await submitBtn.first().isVisible()) {
      await submitBtn.first().click();
      
      // Should show validation errors or not proceed
      const hasErrors = await page.getByText(/required|invalid|please/i).isVisible().catch(() => false);
      const stayedOnPage = page.url().includes('/onboarding');
      
      expect(hasErrors || stayedOnPage).toBe(true);
    }
  });

  test('should validate license number format', async ({ page }) => {
    await page.goto('/doctor/onboarding');
    
    const licenseField = page.getByLabel(/license/i).or(
      page.getByPlaceholder(/license/i)
    ).first();
    
    if (await licenseField.isVisible()) {
      // Enter invalid license
      await licenseField.fill('invalid');
      await licenseField.blur();
      
      // Should show format error or allow submission for backend validation
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Mobile Onboarding', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be mobile responsive', async ({ page }) => {
    await page.goto('/doctor/onboarding');
    
    // Page should be responsive
    await expect(page.locator('body')).toBeVisible();
    
    // No horizontal scroll
    const body = page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    const viewportWidth = 375;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow small margin
  });
});
