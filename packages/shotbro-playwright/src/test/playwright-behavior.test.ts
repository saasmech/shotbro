import {Browser, chromium, Page, test} from '@playwright/test';
import * as path from "node:path";
import {expectImageToMatchBaseline, currentRunImgPath} from "./test-utils";

test.describe('Playwright Behavior', () => {

    let browser: Browser;
    let page: Page;
    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.afterAll(async () => {
        await browser.close();
    });
    test.beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewportSize({width: 320, height: 320});
    });
    test.afterEach(async () => {
        await page.close();
    });

    test.describe('Boxes', () => {

        test.beforeEach(async () => {
            await page.goto(`file:${path.join(__dirname, 'test-boxes.html')}`);
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
            test.expect(page.viewportSize()).toMatchObject({width: 320, height: 320});
            test.expect(box).toMatchObject({x: 0, y: 0, width: 320, height: 630});
        })

    });
});