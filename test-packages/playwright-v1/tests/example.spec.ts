import {test as playwrightTest} from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv'
import {shotBroPlaywright, shotBroUpload} from "shotbro";

dotenv.config()

playwrightTest.afterAll(async ({}, testInfo) => {
  if (testInfo.status === 'passed') {
    // SHOTBRO_APP_API_KEY;
    // SHOTBRO_BASE_URL;
    await shotBroUpload({});
  }
});

playwrightTest('mobile test', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 640});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    out: {
      logLevel: 'debug',
    }
  })
});

playwrightTest('desktop test', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 768});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    out: {
      logLevel: 'debug',
    }
  })
});
