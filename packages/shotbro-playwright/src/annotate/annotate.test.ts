import {Browser, chromium, Page, test} from '@playwright/test';
import * as path from "path";
import * as fs from "fs";
import {shotBroPlaywrightAnnotate} from "./annotate";
import {COMPARE_DIR_NAME, SNAPSHOTS_DIR_NAME} from "../test/test-utils";


test.describe('Annotate', () => {
    test.describe('Box', () => {

        let browser: Browser;
        let page: Page;

        test.beforeAll(async () => browser = await chromium.launch());
        test.afterAll(async () => await browser.close());
        test.beforeEach(async () => {
            page = await browser.newPage();
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.join(__dirname, '..', 'test', 'boxes.html')}`);
        });
        test.afterEach(async () => await page.close());



        test('render a circle', async () => {
            const bgFile = '../src/test/test-pattern-color.png';
            fs.mkdirSync(path.join(__dirname, '..', '..', 'out'), {recursive: true});
            const htmlPath = path.join(__dirname, '..', '..', 'out', 'main-screenshotter-test1.html');
            const pngPath = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'thumb-default.png');
            let ctx = await browser.newContext();
            await shotBroPlaywrightAnnotate(ctx, bgFile, htmlPath, {
                shotName: 'test-name',
                shapes: [{circle: {at: '#box1'}}],
                focus: {at: 'body'},
            }, {
                focusBoxPosition: {x: 10, y: 20, w: 400, h: 200},
                shapePositions: [{x: 20, y: 40, w: 200, h: 100}]
            }, pngPath);
        });

    });


});