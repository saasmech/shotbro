import {test} from '@playwright/test';
import {shotBroPlaywright} from "shotbro-playwright";

const locales = ['zh-cn', 'en-us', 'fr-fr'];
const colorSchemes = ['light', 'dark'];
const viewportSizes = [{width: 320, height: 320}, {width: 1024, height: 768}];

for (let l = 0; l < locales.length; l++) {
  const locale = locales[l];
  for (let c = 0; c < colorSchemes.length; c++) {
    const colorScheme = colorSchemes[c];
    for (let v = 0; v < viewportSizes.length; v++) {
      const viewportSize = viewportSizes[v];

      test.describe(`screenshots for locale ${locale}`, () => {

        test.use({locale: locale});

        test(`home: colorScheme ${colorScheme} viewportSize ${viewportSize.width}x${viewportSize.height}`,
          async ({page}, testInfo) => {
            await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
            await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
            await page.goto(`https://duckduckgo.com/`);
            await shotBroPlaywright(page, testInfo, {streamCode: 'com.duckduckgo.home'})
          });
        test(`settings: colorScheme ${colorScheme} viewportSize ${viewportSize.width}x${viewportSize.height}`,
          async ({page}, testInfo) => {
            await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
            await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
            await page.goto(`https://duckduckgo.com/settings#general`);
            await shotBroPlaywright(page, testInfo, {streamCode: 'com.duckduckgo.settings.general'})
          });
        test(`privacy: colorScheme ${colorScheme} viewportSize ${viewportSize.width}x${viewportSize.height}`,
          async ({page}, testInfo) => {
            await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
            await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
            await page.goto(`https://duckduckgo.com/settings#privacy`);
            await shotBroPlaywright(page, testInfo, {streamCode: 'com.duckduckgo.settings.privacy'})
          });
        test(`appearance: colorScheme ${colorScheme} viewportSize ${viewportSize.width}x${viewportSize.height}`,
          async ({page}, testInfo) => {
            await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
            await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
            await page.goto(`https://duckduckgo.com/settings#appearance`);
            await shotBroPlaywright(page, testInfo, {streamCode: 'com.duckduckgo.settings.appearance'})
          });
        test(`results: colorScheme ${colorScheme} viewportSize ${viewportSize.width}x${viewportSize.height}`,
          async ({page}, testInfo) => {
            await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
            await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
            await page.goto(`https://duckduckgo.com/?q=hello`);
            await shotBroPlaywright(page, testInfo, {streamCode: 'com.duckduckgo.search.results'})
          });
      });
    }
  }
}
