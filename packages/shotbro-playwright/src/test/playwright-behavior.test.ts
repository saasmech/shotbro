import {Browser, chromium, Page} from '@playwright/test';
import * as path from "path";
import {expectImageToMatchBaseline, currentRunImgPath} from "./test-utils";

describe('Playwright Behavior', () => {

  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    browser = await chromium.launch();
  });
  afterAll(async () => {
    await browser.close();
  });
  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewportSize({width: 320, height: 320});
  });
  afterEach(async () => {
    await page.close();
  });

  describe('Boxes', () => {

    beforeEach(async () => {
      await page.goto(`file:${path.join(__dirname, 'boxes.html')}`);
    });

    test('playwright scroll the viewport', async () => {
      const outPath = currentRunImgPath(__dirname, 'playwright-boxes-scroll.png')
      await page.screenshot({
        path: outPath,
        fullPage: true,
        animations: 'disabled'
      });
      await expectImageToMatchBaseline(outPath);
    })

    test('playwright bounding box for the body', async () => {
      const box = await page.locator('body').boundingBox();
      // height should be bigger than the viewport specified
      expect(page.viewportSize()).toMatchObject({width: 320, height: 320});
      expect(box).toMatchObject({x: 0, y: 0, width: 320, height: 630});
    })

  });
});