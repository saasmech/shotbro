# ShotBro!

Sick of out of date screenshots in support sites and websites.

Generate them using PlayWright, annotate using ShotBro, them embed them in your support docs.

## Getting Started

```bash
npm install shotbro-playwright
```

- Add to your `.gitignore`: `shotbro-results/`
- Add calls to `shotBroPlaywright` in your tests.
  - See [examples/playwright-v1/tests/example.spec.ts](https://github.com/saasmech/shotbro/blob/main/examples/playwright-v1/tests/example.spec.ts).

# How does it work?

When `shotBroPlaywright` is called, it will:

- Save a full page screenshot with element positions.
- Generate a temporary HTML page of shapes with the full page screenshot as the background image.
- Take a screenshot of the temporary page.
