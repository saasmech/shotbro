import {chromium, Browser, Page, test} from '@playwright/test';
import * as path from "node:path";
import {CliLog} from "../util/log";
import {COMPARE_DIR_NAME, SNAPSHOTS_DIR_NAME} from "./test-utils";
import {findPositions, generateMainScreenshot} from "../main-shot/main-screenshotter";
import {shotBroPlaywrightAnnotate} from "../annotate/annotate";
import {ShotBroInput} from "../annotate/annotate-types";

test.describe('Form test', () => {

    let browser: Browser;
    let page: Page;

    test.beforeAll(async () => browser = await chromium.launch());
    test.afterAll(async () => await browser.close());
    test.beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewportSize({width: 320, height: 640});
        await page.goto(`file:${path.join(__dirname, 'test-form.html')}`);
    });
    test.afterEach(async () => await page.close());

    test('form with some shapes', async () => {
        const log = new CliLog('debug');
        //const outDir = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'thumb-default.png');
        const outDir = path.join(__dirname, SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME);
        let input: ShotBroInput = {
            shotName: "Test",
            focus: {at: "#myform"},
            shapes: [{circle: {at: '#name-field'}}]
        };
        let mainPngPath = path.join(outDir, `form.png`);
        log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
        await generateMainScreenshot(page, mainPngPath);
        let inputPositions = await findPositions(page, input);
        let htmlPath = path.join(outDir, `focus.html`);
        let focusPngPath = path.join(outDir, `focus.png`);
        let mainPngName = path.basename(mainPngPath);
        await shotBroPlaywrightAnnotate(page, mainPngName, htmlPath, input, inputPositions, focusPngPath);
    });

});