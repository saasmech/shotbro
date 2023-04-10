import {chromium, Browser, Page} from '@playwright/test';
import * as path from "path";
import * as fs from "fs";
import {generateMainScreenshot} from "./main-screenshotter";
import {COMPARE_DIR_NAME, expectImageToMatchBaseline, SNAPSHOTS_DIR_NAME} from "../test/test-utils";
import {PNG} from 'pngjs';

describe('Main screenshotter', () => {
  describe('Box', () => {

    let browser: Browser;
    let page: Page;

    beforeAll(async () => browser = await chromium.launch());
    afterAll(async () => await browser.close());
    beforeEach(async () => {
      page = await browser.newPage();
      await page.setViewportSize({width: 320, height: 320});
      await page.goto(`file:${path.join(__dirname, '..', 'test', 'boxes.html')}`);
    });
    afterEach(async () => await page.close());

    test('when default used, box should match whole page html', async () => {
      const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.png');
      const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.json');
      await generateMainScreenshot(page, jsonPath, pngPath);
      const outJson = fs.readFileSync(jsonPath, 'utf-8');
      expect(outJson).toContain('{\"positions\":[{\"tagName\":\"HTML\",\"x\":0,\"y\":0,\"w\":320,\"h\":630,\"id\":\"\",\"className\":\"\"},');
    })

    test('when default used, box should match whole page png', async () => {
      const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.png');
      const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.json');
      await generateMainScreenshot(page, jsonPath, pngPath);
      await expectImageToMatchBaseline(pngPath);
    })

  });

  describe('Box extra long', () => {

    let browser: Browser;
    let page: Page;

    beforeAll(async () => browser = await chromium.launch());
    afterAll(async () => await browser.close());
    beforeEach(async () => {
      page = await browser.newPage();
      await page.setViewportSize({width: 320, height: 320});
      await page.goto(`file:${path.join(__dirname, '..', 'test', 'boxes-extra-long.html')}`);
    });
    afterEach(async () => await page.close());

    test('when page extra long capture should be limited', async () => {
      const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-limited.png');
      const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-limited.json');
      await generateMainScreenshot(page, jsonPath, pngPath);

      expect(PNG.sync.read(fs.readFileSync(pngPath)).height).toBe(4000);
      await expectImageToMatchBaseline(pngPath);
    })


  });
});