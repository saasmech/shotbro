
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
 - sign up
 - create a project 
 - got to project settings and add an API key
 - add it to your local `.env` file

```bash
SHOTBRO_API_KEY=keyGoesHere
```

# How does it work

During your tests call `shotbroPlaywright`, it will save full page screenshot and HTML with positional info to disk.

When your tests complete successfully call `shotBroUpload` and generated shots and meta info will be uploaded  for 
processing.

Visit your project on https://shotbro.io and see your shots.

