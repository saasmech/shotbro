
# ShotBro!

Sick of out of date screenshots in support sites and websites.

Generate them using PlayWright, upload them to ShotBro, them embed them in your docs.

## Getting Started

### Already use Playwright?

```bash
npm install shotbro-playwright
```

Add to your gitignore:
```gitignore
.shotbro/
```

Visit https://shotbro.io 
 - Sign Up
 - Create a project 
 - Go to project settings
 - Add an API key
 - Add the key to:
   - the `SHOTBRO_APP_API_KEY` environment variable in your terminal
   - or use [dotenv](https://github.com/motdotla/dotenv) and add it to your local `.env` file as `SHOTBRO_APP_API_KEY`
 - See [examples/playwright-v1/playwright.config.ts](https://github.com/saasmech/shotbro/blob/main/examples/playwright-v1/playwright.config.ts) for how to add 
   the `shotbro-playwright` reporter to your playwright config 
 - Add calls to `shotBroPlaywright` in your tests, see [examples/playwright-v1/tests/example.spec.ts](https://github.com/saasmech/shotbro/blob/main/examples/playwright-v1/tests/example.spec.ts).


```bash
SHOTBRO_API_KEY=keyGoesHere
```

# How does it work

During your tests call `shotbroPlaywright`, it will save full page screenshot and HTML with positional info to disk.

When your tests complete successfully call `shotBroUpload` and generated shots and meta info will be uploaded  for 
processing.

Visit your project on https://shotbro.io and see your shots.

