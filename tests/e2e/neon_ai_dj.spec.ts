import { test, expect } from '@playwright/test';

test.describe('Authentication Security, Route Protection & Redesigned AI DJ Studio', () => {
  test('verifies unauthenticated dashboard redirect, login security, and AI DJ studio workflow', async ({ page }) => {
    // 1. Verify Route Protection: Direct navigation to dashboard without session redirects to /login
    await page.goto('http://localhost:3000/');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.getByText('Welcome to Pulse')).toBeVisible();

    // 2. Assert reviewer bypass and insecure API key / Neon configuration drawer are completely removed from auth
    await expect(page.getByText('1-Click Reviewer Demo Sign In')).toHaveCount(0);
    await expect(page.getByText('Neon DB & Keys')).toHaveCount(0);
    await expect(page.getByText('Neon PostgreSQL & OAuth Config')).toHaveCount(0);

    // 3. Assert Continue with Google button is present
    await expect(page.getByText('Continue with Google')).toBeVisible();

    // 4. Sign in with email and password
    await page.getByLabel('Email Address').fill('dev@pulse.app');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // 5. Wait for navigation to dashboard
    await page.waitForURL('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // 6. Locate and click AI Mood DJ button
    const djButton = page.getByRole('button', { name: /AI Mood DJ/i });
    await expect(djButton).toBeVisible();
    await djButton.click();

    // 7. Verify Redesigned Studio AI DJ Console Modal is open
    await expect(page.getByText('AI DJ Studio Console')).toBeVisible();
    await expect(page.getByText('Acoustic Profiles')).toBeVisible();

    // 8. Click 'Midnight Terminal' preset
    await page.getByText('Midnight Terminal').click();

    // 9. Wait for generated playlist
    const playButton = page.getByRole('button', { name: 'Play Entire Set' });
    await expect(playButton).toBeVisible({ timeout: 15000 });

    // 10. Assert acoustic radar metrics
    await expect(page.getByText('Dynamic Energy')).toBeVisible();
    await expect(page.getByText('Cadence / Tempo')).toBeVisible();

    // 11. Click 'Play Entire Set'
    await page.getByRole('button', { name: 'Play Entire Set' }).click();

    // 12. Save playlist in modal
    await page.getByRole('button', { name: 'Save to Crates' }).click();
    await expect(page.getByText('Saved!')).toBeVisible();

    // 13. View saved playlists tab
    await page.getByRole('button', { name: 'My Sets' }).click();
    await expect(page.getByText('Mastered AI Crates')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play Set' })).toBeVisible();

    // 14. Close modal to return to dashboard
    await page.getByLabel('Close AI DJ Studio').click();
    await expect(page.getByText('AI DJ Studio Console')).toHaveCount(0);

    // 15. Verify In-App Audio Player is active and allows playing next song
    const player = page.locator('aside[aria-label="In-App Audio Player"]');
    await expect(player).toBeVisible();
    await expect(player.getByLabel('Pause')).toBeVisible();
    await expect(player.getByLabel('Next track')).toBeVisible();
    await expect(player.getByLabel('Previous track')).toBeVisible();

    // Verify first song title
    const firstTrackTitle = await player.locator('h4').innerText();
    expect(firstTrackTitle.length).toBeGreaterThan(0);

    // Click 'Next track' to skip current song
    await player.getByLabel('Next track').click();
    await expect(player.locator('h4')).not.toHaveText(firstTrackTitle);
    const secondTrackTitle = await player.locator('h4').innerText();
    expect(secondTrackTitle.length).toBeGreaterThan(0);

    // Click 'Previous track' to return to previous song
    await player.getByLabel('Previous track').click();
    await expect(player.locator('h4')).toHaveText(firstTrackTitle);
  });
});
