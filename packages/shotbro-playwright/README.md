# ShotBro!

Sick of out of date screenshots in support sites and websites.

Generate them using PlayWright, annotate using ShotBro, them embed them in your support docs.

## Getting Started

### Already use Playwright?

```bash
npm install shotbro-playwright
```

Add to your `.gitignore`:

```gitignore
shotbro-results/
```

- In your local playwright test folder
    - See [examples/playwright-v1/playwright.config.ts](https://github.com/saasmech/shotbro/blob/main/examples/playwright-v1/playwright.config.ts)
    for how to add the `shotbro-playwright` reporter to your playwright config
    - Add calls to `shotBroPlaywright` in your tests,
      see [examples/playwright-v1/tests/example.spec.ts](https://github.com/saasmech/shotbro/blob/main/examples/playwright-v1/tests/example.spec.ts).

# How does it work

During your tests call `shotBroPlaywright`, it will:

- Save a full page screenshot with element positions.
- An HTML page of shapes is generated with the full page screenshot as the background image.
- A screenshot of this is then taken.