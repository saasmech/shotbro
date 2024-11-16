import {test} from '@playwright/test';
import * as path from "node:path";
import {expectPngToMatchSnapshot} from "./test-utils";

test.describe('Playwright Behavior', () => {

    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 320, height: 320});
    });

    test.describe('Boxes', () => {

        test.beforeEach(async ({page}) => {
            await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
        });

        test('playwright scroll the viewport', async ({page}) => {
            const outPath = 'test-results/playwright-behavior/scroll.png';
            await page.screenshot({
                path: outPath,
                fullPage: true,
                animations: 'disabled'
            });
            await expectPngToMatchSnapshot('info', outPath, 'playwright-behavior', 'scroll');
        })

        test('playwright bounding box for the body', async ({page}) => {
            const box = await page.locator('body').boundingBox();
            // height should be bigger than the viewport specified
            test.expect(page.viewportSize()).toMatchObject({width: 320, height: 320});
            test.expect(box).toMatchObject({x: 0, y: 0, width: 320, height: 630});
        })

    });
});