import {test} from '@playwright/test';
import * as path from "node:path";
import * as fs from "node:fs/promises";
import {shotBroPlaywrightAnnotate} from "./annotate";
import {CliLog} from "../util/log";
import {expectPngToMatchSnapshot} from "../test/test-utils";


test.describe('Annotate', () => {
    test.describe('Box', () => {

        const log = new CliLog("info");

        test.beforeEach(async ({page}) => {
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
        });

        test('render a circle', async ({page}) => {
            const bgFile = 'src/test/test-pattern-color.png';
            const outDir = path.join('test-results', 'annotate');
            await fs.mkdir(outDir, {recursive: true});
            const htmlPath = path.resolve(path.join(outDir, 'circle.html'));
            const pngPath = path.join(outDir, 'circle.png');
            await shotBroPlaywrightAnnotate(log, page, bgFile, htmlPath, {
                shotName: 'test-name',
                focus: {at: 'body'},
                shapes: [{at: '#box1', circle: {}}],
            }, {
                focusBoxPosition: {x: 10, y: 20, w: 400, h: 200},
                shapePositions: [{x: 20, y: 40, w: 200, h: 100}]
            }, pngPath, 'src/bundled', false);
            await expectPngToMatchSnapshot('info', pngPath, 'annotate', 'circle');
        });

    });


});