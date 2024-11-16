import {test} from '@playwright/test';
import * as path from "node:path";
import * as fs from "node:fs";
import {shotBroPlaywrightAnnotate} from "./annotate";
import {COMPARE_DIR_NAME, SNAPSHOTS_DIR_NAME} from "../test/test-utils";
import {CliLog} from "../util/log";


test.describe('Annotate', () => {
    test.describe('Box', () => {

        const log = new CliLog("debug");

        test.beforeEach(async ({page}) => {
            await page.setViewportSize({width: 320, height: 320});
            await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-boxes.html'))}`);
        });

        test('render a circle', async ({page}) => {
            const bgFile = 'src/test/test-pattern-color.png';
            fs.mkdirSync(path.join('out'), {recursive: true});
            const htmlPath = path.resolve(path.join('out', 'main-screenshotter-test1.html'));
            const pngPath = path.join('src', 'annotate', SNAPSHOTS_DIR_NAME, COMPARE_DIR_NAME, 'thumb-default.png');
            await shotBroPlaywrightAnnotate(log, page, bgFile, htmlPath, {
                shotName: 'test-name',
                shapes: [{circle: {at: '#box1'}}],
                focus: {at: 'body'},
            }, {
                focusBoxPosition: {x: 10, y: 20, w: 400, h: 200},
                shapePositions: [{x: 20, y: 40, w: 200, h: 100}]
            }, pngPath, '');
        });

    });


});