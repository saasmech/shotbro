import {test} from '@playwright/test';
import * as dotenv from 'dotenv'
import {shotBroPlaywright} from "shotbro-playwright";

dotenv.config()

const locales = ['zh-cn', 'en-us', 'fr-fr'];

for (let i = 0; i < locales.length; i++) {
  const locale = locales[i];

  test.describe(`screenshots for ${locale}`, () => {

    test.use({locale: locale});

    test(`mobile duckduckgo ${locale}`, async ({page}, testInfo) => {
      await page.setViewportSize({width: 320, height: 320});
      await page.emulateMedia({media: 'screen', colorScheme: 'light'});
      await page.goto(`https://duckduckgo.com/`);
      await shotBroPlaywright(page, testInfo,{shotStreamCode: 'com.duckduckgo.home'})
    });

    test(`mobile dark ${locale}`, async ({page}, testInfo) => {
      await page.setViewportSize({width: 320, height: 320});
      await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
      await page.goto(`https://duckduckgo.com/`);
      await shotBroPlaywright(page, testInfo,{shotStreamCode: 'com.duckduckgo.home'});
    });

    test(`desktop light ${locale}`, async ({page}, testInfo) => {
      await page.setViewportSize({width: 1024, height: 320});
      await page.goto(`https://duckduckgo.com/`);
      await shotBroPlaywright(page, testInfo,{shotStreamCode: 'com.duckduckgo.home'});
    });

    test(`desktop dark ${locale}`, async ({page}, testInfo) => {
      await page.setViewportSize({width: 1024, height: 320});
      await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
      await page.goto(`https://duckduckgo.com/`);
      await shotBroPlaywright(page, testInfo, {shotStreamCode: 'com.duckduckgo.home'});
    });
  });


}
