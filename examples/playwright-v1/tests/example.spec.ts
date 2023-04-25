import {test as playwrightTest} from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv'
import {shotBroPlaywright} from "shotbro";

dotenv.config()

playwrightTest('mobile light', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'light'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'com.app.settings.my-form',
    //metadata: {shotVersionTags: ['platform:mobile', 'theme:light']},
  })
});

playwrightTest('mobile dark', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'com.app.settings.my-form',
    //metadata: {shotVersionTags: ['platform:mobile', 'theme:dark']}
  });
});

playwrightTest('desktop light', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'com.app.settings.my-form',
    //metadata: {shotVersionTags: ['platform:desktop', 'theme:light']},
  });
});

playwrightTest('desktop dark', async ({page}) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, {
    shotStreamCode: 'com.app.settings.my-form',
    //metadata: {shotVersionTags: ['platform:desktop', 'theme:dark']},
  });
});
