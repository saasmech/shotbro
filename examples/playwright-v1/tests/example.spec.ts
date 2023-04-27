import {test} from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv'
import {shotBroPlaywright} from "shotbro-playwright";

dotenv.config();

test('mobile light', async ({page}, testInfo) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'light'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, testInfo, {
    shotStreamCode: 'com.app.settings.my-form',
  })
});

test('mobile dark', async ({page}, testInfo) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 320, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, testInfo, {
    shotStreamCode: 'com.app.settings.my-form',
  });
});

test('desktop light', async ({page}, testInfo) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, testInfo, {
    shotStreamCode: 'com.app.settings.my-form',
  });
});

test('desktop dark', async ({page}, testInfo) => {
  const examplePath = path.join(__dirname, "example.html");
  await page.setViewportSize({width: 1024, height: 320});
  await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
  await page.goto(`file:${examplePath}`);

  await shotBroPlaywright(page, testInfo, {
    shotStreamCode: 'com.app.settings.my-form',
  });
});
