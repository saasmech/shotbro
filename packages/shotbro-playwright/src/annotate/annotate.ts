import type {Page} from "@playwright/test";
import {ShotBroInput} from "./annotate-types";
import {generateHtmlForOverlayString} from "../overlay/overlay-html-generator";
import * as fs from "node:fs/promises";
import {InputPositions} from "../main-shot/main-screenshot";
import {CliLog} from "../util/log";
import {box2dp} from "../shape/shape-utils";

export async function shotBroPlaywrightAnnotate(
    log: CliLog,
    origPage: Page,
    mainPngPath: string,
    htmlPath: string,
    input: ShotBroInput,
    inputPositions: InputPositions,
    focusPngPath: string,
    bundledPath: string,
    debugPositions: boolean
) {
    let html = await generateHtmlForOverlayString(log, mainPngPath, input, inputPositions, debugPositions, bundledPath);
    await fs.writeFile(htmlPath, html);

    let browser = origPage.context().browser();
    let ctx = await browser!.newContext();
    let page = await ctx.newPage();
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1000);
    let focus = box2dp(inputPositions.focusBoxPosition!);
    let clip = undefined;
    if (focus) {
        clip = {x: focus.x, y: focus.y, width: focus.w, height: focus.h};
        log.debug(`clip ${clip}`);
    }
    await page.screenshot({
        path: focusPngPath,
        fullPage: true,
        type: 'png',
        scale: 'css',
        clip: clip
    });
    await page.close();
}