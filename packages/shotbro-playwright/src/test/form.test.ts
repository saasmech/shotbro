import {test} from '@playwright/test';
import * as path from "node:path";
import {CliLog} from "../util/log";
import {expectPngToMatchSnapshot} from "./test-utils";
import {findPositions, generateMainScreenshot} from "../main-shot/main-screenshot";
import {shotBroPlaywrightAnnotate} from "../annotate/annotate";
import {ShotBroInput} from "../annotate/annotate-types";

test.describe('Form test', () => {

    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1024, height: 768});
        await page.goto(`file:${path.resolve(path.join('src', 'test', 'form-test.html'))}`);
    });

    test('form with some shapes', async ({page}) => {
        const log = new CliLog('info');
        const outDir = path.join('test-results', 'form-test');
        let input: ShotBroInput = {
            shotName: "Test",
            focus: {at: "form.needs-validation", scale: 1.1},
            shapes: [{at: '#firstName', icon: {}}]
        };
        let mainPngPath = path.join(outDir, `some-shapes-main.png`);
        log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
        await generateMainScreenshot(page, mainPngPath);
        let inputPositions = await findPositions(log, page, input);
        let htmlPath = path.resolve(path.join(outDir, `some-shapes-with-shapes.html`));
        let focusPngPath = path.join(outDir, `some-shapes-with-shapes.png`);
        let mainPngName = path.basename(mainPngPath);
        await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, '../../src/bundled');
        await expectPngToMatchSnapshot('info', focusPngPath, 'form-test', 'some-shapes');
    });

});