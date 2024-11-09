import {chromium, Browser, Page, test} from '@playwright/test';
import * as path from "node:path";
import * as fs from "node:fs";
import {findPositions, generateMainScreenshot} from "./main-screenshotter";
import {COMPARE_DIR_NAME, expectImageToMatchBaseline, SNAPSHOTS_DIR_NAME} from "../test/test-utils";
import {PNG} from 'pngjs';


test.describe('Main screenshotter', () => {
    test.describe('Box', () => {

        let browser: Browser;
        let page: Page;

        test.beforeAll(async () => browser = await chromium.launch());
        test.afterAll(async () => await browser.close());
        test.beforeEach(async () => {
            page = await browser.newPage();
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.join(__dirname, '..', 'test', 'test-boxes.html')}`);
        });
        test.afterEach(async () => await page.close());

        test('when default used, box should match whole page html', async () => {
            const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.png');
            // const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.json');
            await generateMainScreenshot(page, pngPath);
            //const outJson = fs.readFileSync(jsonPath, 'utf-8');
            //expect(outJson).toContain('{\"positions\":[{\"tagName\":\"HTML\",\"x\":0,\"y\":0,\"w\":320,\"h\":630,\"id\":\"\",\"className\":\"\"},');
        })

        test('when default used, box should match whole page png', async () => {
            const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.png');
            //const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.json');
            await generateMainScreenshot(page, pngPath);
            await expectImageToMatchBaseline(pngPath);
        });

        test('draw a circle', async () => {
            //const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-default.json');
            const positions = await findPositions(page, {
                shotName: 'test-name',
                shapes: [{circle: {at: '#box1'}}],
                focus: {at: 'body'},
            });
            test.expect(positions.focusBoxPosition.w).toBe(320);
            test.expect(positions.shapePositions[0].x).toBe(10);
        });

    });

    test.describe('Box extra long', () => {
        let browser: Browser;
        let page: Page;
        test.beforeAll(async () => browser = await chromium.launch());
        test.afterAll(async () => await browser.close());
        test.beforeEach(async () => {
            page = await browser.newPage();
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.join(__dirname, '..', 'test', 'test-boxes-extra-long.html')}`);
        });
        test.afterEach(async () => await page.close());

        test('when page extra long capture should be limited', async () => {
            const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-limited.png');
            //const jsonPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'main-limited.json');
            await generateMainScreenshot(page, pngPath);

            test.expect(PNG.sync.read(fs.readFileSync(pngPath)).height).toBe(4000);
            await expectImageToMatchBaseline(pngPath);
        });


    });
});