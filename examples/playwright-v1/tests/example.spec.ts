import {test} from '@playwright/test';
import * as path from 'path';
import {ShotBroCaptureConfig, shotBroPlaywright} from "shotbro-playwright";

const captureConfig: ShotBroCaptureConfig = {
    streamCode: 'com.app.settings.my-form',
    //logLevel: 'debug',
    // bundledAssetsPath is not normally needed. only needed in this case as dependency is via a relative path
    bundledAssetsPath: path.join('node_modules', 'shotbro-playwright', 'dist', 'bundled'),
}

test.describe('Example', () => {

    test('mobile light', async ({page}, testInfo) => {
        await page.setViewportSize({width: 320, height: 320});
        await page.emulateMedia({media: 'screen', colorScheme: 'light'});
        await page.goto(`file:${path.join(__dirname, "example.html")}`);

        await shotBroPlaywright(page, testInfo, captureConfig, {
            shotName: 'mobile-light',
            shapes: [{at: '#name-field', icon: {name: 'arrow-left-circle-fill'}}],
        });
    });

    test('mobile dark', async ({page}, testInfo) => {
        await page.setViewportSize({width: 320, height: 320});
        await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
        await page.goto(`file:${path.join(__dirname, "example.html")}`);

        await shotBroPlaywright(page, testInfo, captureConfig, {
            shotName: 'mobile-dark',
            shapes: [{at: '#name-field', icon: {name: 'arrow-left-circle-fill'}}],
        });
    });

    test('desktop light', async ({page}, testInfo) => {
        await page.setViewportSize({width: 1024, height: 320});
        await page.goto(`file:${path.join(__dirname, "example.html")}`);
        console.log('desktop light start', testInfo.annotations.length);

        await shotBroPlaywright(page, testInfo, captureConfig, {
            shotName: 'desktop-light',
            shapes: [{at: '#name-field', circle: {}}],
        });
    });

    test('desktop dark', async ({page}, testInfo) => {
        await page.setViewportSize({width: 1024, height: 320});
        await page.emulateMedia({media: 'screen', colorScheme: 'dark'});
        await page.goto(`file:${path.join(__dirname, "example.html")}`);

        await shotBroPlaywright(page, testInfo, captureConfig, {
            shotName: 'desktop-dark',
            shapes: [{at: '#name-field', icon: {name: 'arrow-left-circle-fill'}}],
        });
    });

});
