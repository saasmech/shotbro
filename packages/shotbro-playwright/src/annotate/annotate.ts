import type {Page} from "@playwright/test";
import {ShotBroInput} from "./annotate-types";
import {generateHtmlForOverlayString} from "./overlay/overlay-html-generator";
import * as fs from "node:fs";
import {InputPositions} from "../main-shot/main-screenshotter";
import {CliLog} from "../util/log";

export async function shotBroPlaywrightAnnotate(
    log: CliLog,
    origPage: Page,
    mainPngPath: string,
    htmlPath: string,
    input: ShotBroInput,
    inputPositions: InputPositions,
    focusPngPath: string,
    bundledPath: string
) {
    let html = await generateHtmlForOverlayString(log, mainPngPath, input, inputPositions, false, bundledPath);
    fs.writeFileSync(htmlPath, html);

    let browser = origPage.context().browser();
    let ctx = await browser!.newContext();
    let page = await ctx.newPage();
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1000);
    let focus = inputPositions.focusBoxPosition;
    let clip = undefined;
    if (focus) {
        clip = {x: focus.x, y: focus.y, width: focus.w, height: focus.h};
    }
    await page.screenshot({
        path: focusPngPath,
        fullPage: true,
        type: 'png',
        scale: 'device',
        clip: clip
    });
    await page.close();
}