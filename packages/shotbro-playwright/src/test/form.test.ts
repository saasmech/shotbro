import {test} from '@playwright/test';
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {CliLog} from "../util/log";
import {expectHtmlToMatchSnapshot, expectPngToMatchSnapshot} from "./test-utils";
import {findPositions, generateMainScreenshot} from "../main-shot/main-screenshot";
import {shotBroPlaywrightAnnotate} from "../annotate/annotate";
import {ShotBroInput} from "../annotate/annotate-types";

test.describe('Form test', () => {

    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1024, height: 2000});
        await page.goto(`file:${path.resolve(path.join('src', 'test', 'form-test.html'))}`);
    });

    test('form with some shapes', async ({page}) => {
        const log = new CliLog('info');
        const outDir = path.join('test-results', 'compare', 'form-test');
        let htmlPath = path.resolve(path.join(outDir, `some-shapes-with-shapes.html`));
        let focusPngPath = path.join(outDir, `some-shapes-with-shapes.png`);
        let mainPngName = `some-shapes-main.png`;
        let mainPngPath = path.join(outDir, mainPngName);
        let input: ShotBroInput = {
            shotName: "Test",
            focus: {at: "form.needs-validation", scale: 1.1, translateX: -25, translateY: -50},
            shapes: [{at: '#firstName', icon: {}}]
        };
        log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
        await generateMainScreenshot(page, mainPngPath);
        let inputPositions = await findPositions(log, page, input);
        test.expect(inputPositions.focusBoxPosition).toStrictEqual({
            h: 1184.87, w: 668.80, x: 19, y: 234.66
        });
        test.expect(inputPositions.shapePositions[0]).toStrictEqual({
            h: 38, w: 296, x: 44, y: 332.66,
        });
        await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, '../../../src/bundled', true);
        let html = await fs.readFile(htmlPath, {encoding: 'utf-8'});
        await expectHtmlToMatchSnapshot('info', html, 'form-test', 'some-shapes');
        await expectPngToMatchSnapshot('info', mainPngPath, 'form-test', 'some-shapes-main');
        await expectPngToMatchSnapshot('info', focusPngPath, 'form-test', 'some-shapes');
    });

});