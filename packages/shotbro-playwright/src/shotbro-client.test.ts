import {chromium, Browser, Page, test} from '@playwright/test';
import * as path from "node:path";
import {playwrightPrepareSystemInfo} from "./index";
import {CliLog} from "./util/log";

test.describe('ShotBro Playwright Client', () => {

    let browser: Browser;
    let page: Page;

    test.beforeAll(async () => browser = await chromium.launch());
    test.afterAll(async () => await browser.close());
    test.beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewportSize({width: 320, height: 640});
        await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
    });
    test.afterEach(async () => await page.close());

    test('system info looks pretty good', async () => {
        const log = new CliLog('debug');
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

});