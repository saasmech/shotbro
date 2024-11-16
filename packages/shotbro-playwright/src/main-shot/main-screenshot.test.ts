import {test} from '@playwright/test';
import * as path from "node:path";
import * as fs from "node:fs/promises";
import {findPositions, generateMainScreenshot} from "./main-screenshot";
import {expectPngToMatchSnapshot} from "../test/test-utils";
import {PNG} from 'pngjs';
import {CliLog} from "../util/log";


test.describe('Main screenshot', () => {
    test.describe('Box', () => {

        const log = new CliLog('info');

        test.beforeEach(async ({page}) => {
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
        });

        test('when default used, box should match whole page html', async ({page}) => {
            const pngPath = path.join('test-results', 'main-screenshot', 'main-default.png');
            await generateMainScreenshot(page, pngPath);
            //const outJson = fs.readFileSync(jsonPath, 'utf-8');
            //expect(outJson).toContain('{\"positions\":[{\"tagName\":\"HTML\",\"x\":0,\"y\":0,\"w\":320,\"h\":630,\"id\":\"\",\"className\":\"\"},');
        })

        test('when default used, box should match whole page png', async ({page}) => {
            const pngPath = path.join('test-results', 'main-screenshot', 'box-whole.png');
            await generateMainScreenshot(page, pngPath);
            await expectPngToMatchSnapshot('info', pngPath, 'main-screenshot', 'box-whole');
        });

        test('draw a circle', async ({page}) => {
            const positions = await findPositions(log, page, {
                shotName: 'test-name',
                shapes: [
                    {at: '#box1', circle: {}}
                ],
                focus: {at: 'body'},
            });
            test.expect(positions.focusBoxPosition.w).toBe(320);
            test.expect(positions.shapePositions[0].x).toBe(10);
        });

        test('scale up', async ({page}) => {
            const positions = await findPositions(log, page, {
                shotName: 'test-name',
                focus: {at: '#box3', scale: 2},
            });
            test.expect(positions.focusBoxPosition.w).toBe(100);
            test.expect(positions.focusBoxPosition.x).toBe(150);
        });

    });

    test.describe('Box extra long', () => {

        test.beforeEach(async ({page}) => {
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes-extra-long.html'))}`);
        });

        test('when page extra long capture should be limited', async ({page}) => {
            const pngPath = path.join('test-results', 'main-screenshot', 'limited.png');
            await generateMainScreenshot(page, pngPath);

            test.expect(PNG.sync.read(await fs.readFile(pngPath)).height).toBe(4000);
            await expectPngToMatchSnapshot('info', pngPath, 'main-screenshot', 'limited');
        });
    });
});