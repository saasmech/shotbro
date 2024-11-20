import {test} from '@playwright/test';
import {shotBroPlaywright} from "shotbro-playwright";


test.describe(`screenshots`, () => {

    const mobile = {width: 320, height: 320, name: 'mobile'};
    const desktop = {width: 1024, height: 768, name: 'desktop'};
    const all = [
        {colorScheme: 'light', viewportSize: mobile},
        {colorScheme: 'light', viewportSize: desktop},
        {colorScheme: 'dark', viewportSize: mobile},
        {colorScheme: 'dark', viewportSize: desktop},
    ];

    all.forEach(({colorScheme, viewportSize}) => {

        const input = {streamCode: `com.duckduckgo.${colorScheme}.${viewportSize.name}`};

        test.describe(`colorScheme ${colorScheme} viewportSize ${viewportSize.name}`, () => {

            test(`home`, async ({page}, testInfo) => {
                await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
                await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
                await page.goto(`https://duckduckgo.com/`);
                await shotBroPlaywright(page, testInfo, input, {shotName: `home`})
            });

            test(`settings`, async ({page}, testInfo) => {
                await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
                await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
                await page.goto(`https://duckduckgo.com/settings#general`);
                await shotBroPlaywright(page, testInfo, input, {shotName: `settings`})
            });

            test(`privacy`, async ({page}, testInfo) => {
                await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
                await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
                await page.goto(`https://duckduckgo.com/settings#privacy`);
                await shotBroPlaywright(page, testInfo, input, {shotName: `privacy`})
            });

            test(`appearance`, async ({page}, testInfo) => {
                await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
                await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
                await page.goto(`https://duckduckgo.com/settings#appearance`);
                await shotBroPlaywright(page, testInfo, input, {shotName: `appearance`})
            });

            test(`results`, async ({page}, testInfo) => {
                await page.setViewportSize({width: viewportSize.width, height: viewportSize.height});
                await page.emulateMedia({media: 'screen', colorScheme: colorScheme as 'light' | 'dark'});
                await page.goto(`https://duckduckgo.com/?q=hello`);
                await shotBroPlaywright(page, testInfo, input, {shotName: `results`})
            });

        });
    });
});
