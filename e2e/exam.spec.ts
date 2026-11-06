import { expect, test, type Page } from '@playwright/test';

const firstOption = (page: Page) => page.locator('.options input').first();

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test('full flow: start, answer, flag, navigate, reload, submit, review, retry', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /practice exam/i })).toBeVisible();
  await expect(page.getByText(/unofficial learning tool/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: /start timed exam/i }).click();
  await expect(page.getByRole('heading', { name: 'Question 1 of 60' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText(/(100:00|99:5\d)/);
  await expectNoHorizontalOverflow(page);

  // Answer and flag question 1.
  await firstOption(page).check();
  await page.getByRole('button', { name: /flag for review/i }).click();
  await expect(page.getByText('1 answered / 59 unanswered')).toBeVisible();

  // Next, answer question 2.
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('heading', { name: 'Question 2 of 60' })).toBeVisible();
  await firstOption(page).check();

  // Jump via navigator.
  await page.getByRole('button', { name: 'Question 5, unanswered' }).click();
  await expect(page.getByRole('heading', { name: 'Question 5 of 60' })).toBeVisible();

  // Reload: position, answers and flags persist.
  const promptBefore = await page.locator('.question-prompt').textContent();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Question 5 of 60' })).toBeVisible();
  await expect(page.locator('.question-prompt')).toHaveText(promptBefore!);
  await expect(page.getByRole('button', { name: 'Question 1, answered, flagged' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Question 2, answered' })).toBeVisible();

  // Going home offers to resume.
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: /unfinished attempt/i })).toBeVisible();
  await page.getByRole('link', { name: /resume attempt/i }).click();
  await expect(page.getByRole('heading', { name: 'Question 5 of 60' })).toBeVisible();

  // Submit with confirmation; cancel first.
  await page.getByRole('button', { name: /submit exam/i }).click();
  const dialog = page.getByRole('dialog', { name: /submit your exam/i });
  await expect(dialog).toContainText('58');
  await dialog.getByRole('button', { name: /return to exam/i }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: /submit exam/i }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^submit exam$/i }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Results' })).toBeVisible();
  await expect(page.getByText(/Practice benchmark: 80% \(48\/60\)/)).toBeVisible();
  await expect(page.getByText('Manually')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  // Review with filters.
  await page.getByRole('link', { name: /review answers/i }).click();
  await expect(page.getByRole('heading', { level: 1, name: /review answers/i })).toBeVisible();
  await page.getByRole('button', { name: /^flagged \(1\)$/i }).click();
  await expect(page.getByText('Showing 1 of 60 questions.')).toBeVisible();
  await page.getByRole('button', { name: /^unanswered \(58\)$/i }).click();
  await expect(page.getByText('Showing 58 of 60 questions.')).toBeVisible();
  await expect(page.getByRole('link', { name: /source documentation/i }).first()).toHaveAttribute('href', /^https:\/\//);

  // Fresh attempt keeps the old result.
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByLabel(/study mode/i).check();
  await page.getByRole('button', { name: /start study mode/i }).click();
  await expect(page.getByRole('heading', { name: 'Question 1 of 60' })).toBeVisible();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await firstOption(page).check();
  await page.getByRole('button', { name: /check answer/i }).click();
  await expect(page.getByText(/explanation:/i)).toBeVisible();

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('table')).toContainText('Timed');
});

test('a second tab is read-only while the first owns the attempt', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start timed exam/i }).click();
  await expect(page.getByRole('heading', { name: 'Question 1 of 60' })).toBeVisible();

  const second = await context.newPage();
  await second.goto('/#/exam');
  await expect(second.getByText(/read-only/i)).toBeVisible();
  await expect(second.getByRole('button', { name: /submit exam/i })).toBeDisabled();

  await second.getByRole('button', { name: /use this tab instead/i }).click();
  await expect(second.getByRole('button', { name: /submit exam/i })).toBeEnabled();
  await expect(page.getByText(/read-only/i)).toBeVisible();
});

test('sources page shows coverage and licensing', async ({ page }) => {
  await page.goto('/#/sources');
  await expect(page.getByRole('heading', { name: /domain coverage/i })).toBeVisible();
  await expect(page.getByText(/CC BY 4\.0/).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
