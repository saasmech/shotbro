import {chromium, Browser, Page} from '@playwright/test';
import * as path from "path";
import {playwrightPrepareSystemInfo} from "./index";
import {CliLog} from "./util/log";

describe('ShotBro Client', () => {

    let browser: Browser;
    let page: Page;

    beforeAll(async () => browser = await chromium.launch());
    afterAll(async () => await browser.close());
    beforeEach(async () => {
      page = await browser.newPage();
      await page.setViewportSize({width: 320, height: 640});
      await page.goto(`file:${path.join(__dirname, 'test', 'boxes.html')}`);
    });
    afterEach(async () => await page.close());

    test('system info looks pretty good', async () => {
      const log = new CliLog('debug');
      const systemInfo = await playwrightPrepareSystemInfo(page, log)
      console.log(systemInfo)
      expect(systemInfo.appVersion?.length).toBeGreaterThan(10);
      expect(systemInfo.osPlatform?.length).toBeGreaterThan(3);
      expect(systemInfo.osVersion?.length).toBeGreaterThan(3);
      expect(systemInfo.browserType?.length).toBeGreaterThan(3);
      expect(systemInfo.browserType?.length).toBeLessThan(32);
      expect(systemInfo.browserVersion?.length).toBeGreaterThan(3);
      expect(systemInfo.browserVersion?.length).toBeLessThan(32);
      expect(systemInfo.browserUserAgent?.length).toBeGreaterThan(30);
      expect(systemInfo.browserUserAgent?.length).toBeLessThan(255);
      expect(systemInfo.browserLanguage).toBe('en-US');
      expect(systemInfo.browserViewportWidth).toBe(320);
      expect(systemInfo.browserViewportHeight).toBe(640);
      expect(systemInfo.browserPrefersColorScheme).toBe('light');
      expect(systemInfo.browserDevicePixelRatio).toBe(1);
      expect(systemInfo.inputUlid).toHaveLength(29);
    })

});