import {test} from '@playwright/test';
import {shotBroPlaywright} from "shotbro-playwright";


test.describe(`screenshots`, () => {

    const locales = ['zh-cn', 'en-us', 'fr-fr'];
    const colorSchemes = ['light', 'dark'];
    const viewportSizes = [
        {width: 320, height: 320, name: 'mobile'},
        {width: 1024, height: 768, name: 'desktop'}
    ];

    for (let l = 0; l < locales.length; l++) {
        const locale = locales[l];
        for (let c = 0; c < colorSchemes.length; c++) {
            const colorScheme = colorSchemes[c];
            for (let v = 0; v < viewportSizes.length; v++) {
                const viewportSize = viewportSizes[v];

                test.describe(`Tests for locale ${locale} colorScheme ${colorScheme} viewportSize ${viewportSize.name}`, () => {
                    const input = {streamCode: `com.duckduckgo.${locale}.${colorScheme}.${viewportSize.name}`};
                    test.use({locale: locale});

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
            }
        }
    }
});
