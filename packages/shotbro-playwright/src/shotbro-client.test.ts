import {test} from '@playwright/test';
import * as path from "node:path";
import {playwrightPrepareSystemInfo, shotBroPlaywright} from "./index";
import {CliLog} from "./util/log";

test.describe('ShotBro Playwright Client', () => {

    const log = new CliLog('debug');

    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 320, height: 640});
        await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
    });

    test('system info looks pretty good', async ({page}) => {
        const systemInfo = await playwrightPrepareSystemInfo(page, log)
        console.log(systemInfo)
        test.expect(systemInfo.osPlatform?.length).toBeGreaterThan(3);
        test.expect(systemInfo.osVersion?.length).toBeGreaterThan(3);
        test.expect(systemInfo.browserType?.length).toBeGreaterThan(3);
        test.expect(systemInfo.browserType?.length).toBeLessThan(32);
        test.expect(systemInfo.browserVersion?.length).toBeGreaterThan(1);
        test.expect(systemInfo.browserVersion?.length).toBeLessThan(32);
        test.expect(systemInfo.browserUserAgent?.length).toBeGreaterThan(30);
        test.expect(systemInfo.browserUserAgent?.length).toBeLessThan(255);
        test.expect(systemInfo.browserLanguage).toBe('en-US');
        test.expect(systemInfo.browserViewportWidth).toBe(320);
        test.expect(systemInfo.browserViewportHeight).toBe(640);
        test.expect(systemInfo.browserPrefersColorScheme).toBe('light');
        test.expect(systemInfo.browserDevicePixelRatio).toBe(1);
        test.expect(systemInfo.inputUlid).toHaveLength(29);
    });

    test('box1 circle', async ({page}, testInfo) => {
        testInfo.annotations.push({ type: 'shotbro-working-dir', description: 'out'});
        testInfo.annotations.push({ type: 'shotbro-log-level', description: 'debug'});
        await shotBroPlaywright(page, testInfo, {
            streamCode: 'test'
        }, {
            shotName: 'test',
            focus: {at: 'body'},
            shapes: [{circle: {at: '#box1'}}]
        });
    });

});