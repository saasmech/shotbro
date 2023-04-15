import {test as playwrightTest} from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv'
import {shotBroPlaywright, shotBroUpload} from "shotbro";

dotenv.config()

playwrightTest.afterAll(async ({}, testInfo) => {
  if (testInfo.status === 'passed') {
    // SHOTBRO_APP_API_KEY;
    await shotBroUpload({});
  }
});

playwrightTest('mobile light', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'light'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    metadata: {shotVersionTags: ['mobile', 'light']},
  })
});

playwrightTest('mobile dark', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    metadata: {shotVersionTags: ['mobile', 'dark']}
  });
});

playwrightTest('desktop light', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    metadata: {shotVersionTags: ['desktop', 'light']},
  });
});

playwrightTest('desktop dark', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'my-form',
    metadata: {shotVersionTags: ['desktop', 'dark']},
  });
});
