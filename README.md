# Saucedemo Playwright Framework

End-to-end UI test framework for [Sauce Demo](https://www.saucedemo.com/), built with
[Playwright Test](https://playwright.dev/) and TypeScript using the Page Object Model.

Sauce Demo is a public practice e-commerce site, which makes it a good target for building
and demonstrating a maintainable test automation framework.

This project was originally completed between February 2025 and March 2025 in association
with the University of San Francisco (USFCA). It was reworked and published to GitHub in
September 2026.

## Tech stack

- [Playwright Test](https://playwright.dev/docs/intro) — test runner, browsers, assertions, reporting
- TypeScript
- Page Object Model + custom Playwright fixtures

## Project structure

```
.
├── .github/workflows/
│   └── playwright.yml             # GitHub Actions pipeline (see Continuous Integration)
├── tests/                         # Test specs
│   ├── login.spec.ts              #   login success, locked-out user, invalid credentials
│   ├── catalog-cart.spec.ts       #   sorting, cart badge, product detail, cart page
│   └── checkout.spec.ts           #   checkout happy path, validation, cancelling, edge cases
├── pages/                         # Page Object Model classes
│   ├── BasePage.ts                #   shared base: page ref, goto(), cart link + badge locators
│   ├── LoginPage.ts               #   /
│   ├── InventoryPage.ts           #   /inventory.html — sorting, add/remove, open product/cart
│   ├── ProductDetailPage.ts       #   /inventory-item.html?id=<id>
│   ├── CartPage.ts                #   /cart.html
│   ├── CheckoutStepOnePage.ts     #   /checkout-step-one.html — customer info form
│   ├── CheckoutStepTwoPage.ts     #   /checkout-step-two.html — order overview and totals
│   └── CheckoutCompletePage.ts    #   /checkout-complete.html — order confirmation
├── fixtures/
│   └── fixtures.ts                # Custom fixtures that inject page objects into tests
├── test-data/
│   ├── users.ts                   # Demo accounts, invalid logins, login error messages
│   ├── products.ts                # Product catalog (id, name, price) + formatPrice()
│   └── checkout.ts                # Customer info, validation errors, tax rate, confirmation text
├── playwright.config.ts           # Playwright configuration (baseURL, browsers, reporters)
└── tsconfig.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

## Running tests

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm test`              | Run all tests headless on all browsers         |
| `npm run test:headless` | Same as `npm test` (headless is the default)   |
| `npm run test:headed`   | Run with visible browser windows               |
| `npm run test:chromium` | Run on Chromium only (also `:firefox`, `:webkit`) |
| `npm run test:ui`       | Open Playwright's interactive UI mode          |
| `npm run test:debug`    | Run with the Playwright Inspector for step-through debugging |
| `npm run report`        | Open the last HTML report in your browser      |
| `npm run typecheck`     | Type-check the project with `tsc`              |

Extra Playwright CLI arguments can be passed after `--`, for example:

```bash
npm test -- tests/checkout.spec.ts       # a single file
npm test -- -g "locked out"              # tests whose title matches
npm run test:headed -- --project=chromium
```

## Reports

Every run writes an HTML report to `playwright-report/`, along with console output.
Open it with:

```bash
npm run report
```

Screenshots are captured on failure, and traces are recorded when a test is retried (on CI).
Artifacts go to `test-results/`.

## Continuous Integration

A GitHub Actions workflow,
[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml), runs the full suite
on every push and pull request.

| Setting | Value |
| --- | --- |
| Triggers | Every push and pull request |
| Runner | `ubuntu-latest`, Node.js 24 |
| Steps | `npm ci` → `npx playwright install --with-deps` → `npx playwright test` |
| Browsers | Chromium, Firefox, WebKit |
| HTML report | Build artifact `playwright-report`, kept 30 days |

How the workflow behaves:

- **Any failing test fails the build.** `npx playwright test` exits with a non-zero code,
  which fails the job.
- **The report is published even when tests fail**, so a red build always comes with a
  report to download. It is skipped only if the run is cancelled.
- **CI settings from `playwright.config.ts` apply:** GitHub Actions sets the `CI`
  environment variable automatically, which turns on up to 2 retries, 1 worker, and makes
  `test.only` fail the build.
- **Flaky tests don't fail the build.** A test that fails and then passes on retry is
  reported as "flaky" in the report, and the build still passes. Its trace, recorded on the
  first retry, is included in the report.

## Test data

All test data lives in `test-data/`, so specs never hard-code names, prices or messages.

**[`users.ts`](test-data/users.ts)** — Sauce Demo publishes its test accounts on its login
page; all of them use the password `secret_sauce`:

| Account                   | Behaviour                                  |
| ------------------------- | ------------------------------------------ |
| `standard_user`           | Normal, working user                       |
| `locked_out_user`         | Login is rejected with a "locked out" error |
| `problem_user`            | Broken images and buggy UI behaviour       |
| `performance_glitch_user` | Slow responses                             |
| `error_user`              | Errors on certain actions                  |
| `visual_user`             | Visual differences (for visual testing)    |

The same file also holds invalid credential combinations and the expected login error
messages.

**[`products.ts`](test-data/products.ts)** — the six catalog products with their item id
(as used in `/inventory-item.html?id=<id>`), name and price, plus `formatPrice()` to render
a price the way the site displays it. Sorting and cart tests derive their expected values
from this list.

**[`checkout.ts`](test-data/checkout.ts)** — customer details for the information form, the
three "field is required" error messages, the 8% tax rate, and the expected overview and
confirmation text. The checkout tests compute expected subtotal, tax and total from product
prices and the tax rate rather than copying numbers off the screen.

## Writing tests

Import `test` and `expect` from the custom fixtures rather than directly from
`@playwright/test`, so page objects are injected automatically:

```ts
import { test, expect } from '../fixtures/fixtures';
import { products } from '../test-data/products';

test('adds an item to the cart', async ({ loggedInPage }) => {
  await loggedInPage.addToCart(products.backpack.name);
  await expect(loggedInPage.shoppingCartBadge).toHaveText('1');
});
```

Available fixtures:

| Fixture                | Provides                                                  |
| ---------------------- | --------------------------------------------------------- |
| `loginPage`            | `LoginPage`                                               |
| `inventoryPage`        | `InventoryPage`                                           |
| `productDetailPage`    | `ProductDetailPage`                                       |
| `cartPage`             | `CartPage`                                                |
| `checkoutStepOnePage`  | `CheckoutStepOnePage`                                     |
| `checkoutStepTwoPage`  | `CheckoutStepTwoPage`                                     |
| `checkoutCompletePage` | `CheckoutCompletePage`                                    |
| `loggedInPage`         | `InventoryPage`, already logged in as `standard_user`     |

Use `loggedInPage` whenever login itself isn't what's being tested.

Conventions:

- Locators use `page.getByTestId(...)`, which is configured to read Sauce Demo's
  `data-test` attributes (`testIdAttribute` in `playwright.config.ts`).
- Action methods return `void`, or return the next page object when the action navigates
  (e.g. `CheckoutStepOnePage.continue()` returns a `CheckoutStepTwoPage`).
- Locators for the cart link and badge live on `BasePage`, so every page object has them.
- To add a new page: create a class in `pages/` that extends `BasePage`, then register it
  as a fixture in `fixtures/fixtures.ts`.

## Testing Strategy & Decisions

### Empty-cart checkout is tested as passing behaviour, not `test.fail()`

Sauce Demo lets a user check out with an empty cart. They can fill in the information
form and reach an overview showing `Total: $0.00`. The test in `checkout.spec.ts` records
that as the expected behaviour rather than marking it with `test.fail()`.

`test.fail()` would mean "this is a known bug, and the correct behaviour is X". But Sauce
Demo has no requirements document saying an empty-cart checkout must be blocked, so the
suite has no basis for calling it a bug. Testing what the app actually does keeps the suite
honest: it passes on current behaviour, and it fails, flagging the change for review, if
the app ever starts blocking empty checkouts.

> Note: this may be a product decision worth revisiting, not a confirmed bug.

### Chromium race condition in `InventoryPage.openProduct()`

**Symptom.** The product detail test failed on Chromium but passed on Firefox and WebKit.
The failure was a strict-mode violation on its first assertion: `getByTestId('inventory-item-name')`
matched 6 elements instead of 1.

**Diagnosis.** Re-running that test 10 times on Chromium failed 10 out of 10 times, so this was
a consistent timing issue, not a random flake. Two things combine to cause it:

- Sauce Demo is a single-page app. After clicking a product link, the URL changes
  *before* React replaces the inventory list with the detail view.
- The detail page reuses the inventory card's test ids (`inventory-item-name`,
  `inventory-item-price`, …). So for a moment, `ProductDetailPage.itemName` matches all six
  inventory cards that are still on screen.

Playwright retries an assertion whose text doesn't match yet, but it does **not** retry a
strict-mode violation. The page snapshot showed the detail page rendered correctly just
after the failure, but by then the test had already failed. Chromium hit this gap every
time while Firefox and WebKit didn't. The exact reason for that browser difference wasn't
investigated; the fix below removes the dependency on timing either way.

**Fix.** `openProduct()` now waits for the detail page's "Back to products" button, which
only exists on that page, before returning the `ProductDetailPage`. Waiting for the URL
would not help, because the URL is exactly what changes too early. Afterwards the same test
passed 10 out of 10 times on Chromium, and the full suite passed on all three browsers.

The same pattern applies to any navigation method that returns a page object whose locators
share test ids with the page being left: wait for an element unique to the destination page.

### Coverage summary

**Tested** — 25 tests, each run on Chromium, Firefox and WebKit (75 runs):

- **Login** (`login.spec.ts`, 7): successful login, locked-out user, wrong password,
  unknown user, empty username, empty password, product list shown after login.
- **Catalog and cart** (`catalog-cart.spec.ts`, 9): all four sort options, each checked
  against the expected order; the cart badge count after every add and remove; adding and
  removing from the product detail page; cart page names, prices and quantities; removing
  from the cart; "continue shopping".
- **Checkout** (`checkout.spec.ts`, 9): the full happy path with calculated totals and the
  confirmation page; the required-field error for each of first name, last name and postal
  code; cancelling at step one and step two with the cart kept; empty-cart checkout; the
  same item added from both the inventory and detail pages not being duplicated.

**Out of scope, and why:**

- **Visual regression.** Screenshot comparisons depend on OS, fonts and browser version,
  and need a controlled environment such as a pinned Docker image to be stable. This
  project checks functional behaviour; `visual_user` is left for a dedicated visual suite.
- **Performance testing.** Timing UI tests against a third-party site over the public
  internet produces noisy numbers that can't support real conclusions. Load and
  performance work belongs in dedicated tools (e.g. Lighthouse or k6) run against a
  controlled environment. `performance_glitch_user` is not asserted on for the same reason.
- **Cross-user / multi-session scenarios.** Sauce Demo is a front-end demo with no real
  backend, so cart and session state are held in each browser. Two sessions can't share
  or conflict over data, so there is no meaningful concurrency behaviour to test.

**Not yet covered (possible future work):** the behaviour of `problem_user` and
`error_user`, the sidebar menu (logout, reset app state), and product image checks.
