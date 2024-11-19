import type {Page} from "@playwright/test";
import {ShotBroBox, ShotBroFocus, ShotBroInput} from "../annotate/annotate-types";
import {ShapePosition} from "../shape/shape-types";
import {atToLocatorStr, box2dp} from "../shape/shape-utils";
import {CliLog} from "../util/log";

const MAIN_CAPTURE_HEIGHT_LIMIT = 4000;
const MAIN_CAPTURE_WIDTH_LIMIT = 4000;

export type InputPositions = {
    focusBoxPosition?: ShotBroBox,
    shapePositions: ShotBroBox[]
}

export async function generateMainScreenshot(page: Page, screenshotPath: string) {
    const rootEl = page.locator('html');
    const rootBb = await rootEl.boundingBox()
    if (!rootBb) throw new Error('Could not get size of HTML element');
    await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        animations: 'disabled',
        clip: {
            x: rootBb.x, y: rootBb.y,
            width: Math.min(rootBb.width, MAIN_CAPTURE_WIDTH_LIMIT),
            height: Math.min(rootBb.height, MAIN_CAPTURE_HEIGHT_LIMIT),
        },
        type: 'png',
        scale: 'device' // we want to get the best quality possible
    });
}


export async function findPositions(log: CliLog, page: Page, input: ShotBroInput): Promise<InputPositions> {
    //const inputPositionsOuter = await page.evaluate(async (inputInner) => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // suggest: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});

    //let page = null;
    async function calculateShapePosition(log: CliLog, page: Page, shapePosition: ShapePosition) {
        return await calculateFocusBox(log, page, shapePosition, undefined);
    }

    /**
     * Calculate the position of the box the user selected.  With no padding or other modifiers.
     */
    async function calculateFocusBox(log: CliLog, page: Page, focusBox?: ShotBroFocus, defaultBox?: ShotBroBox): Promise<ShotBroBox | undefined> {
        let atBox: ShotBroBox | undefined = defaultBox;
        if (focusBox?.atPos) {
            atBox = focusBox?.atPos;
        } else {
            let locatorStr = atToLocatorStr(log, focusBox);
            let atLocator = page.locator(locatorStr);
            let sbBb;
            if (atLocator) {
                try {
                    let count = await atLocator.count();
                    if (count > 1) {
                        atLocator = atLocator.nth(0);
                    }
                    sbBb = await atLocator.boundingBox({timeout: 250});
                } catch (e) {
                    log.warn('Exception when executing locator', e);
                }
                if (sbBb) {
                    atBox = {x: sbBb.x, y: sbBb.y, w: sbBb.width, h: sbBb.height};
                } else {
                    log.warn(`Unable to find boundingBox for ${locatorStr} on ${page.url()}`);
                }
            } else {
                log.warn('Unable to find a locator node main screenshot')
            }
        }
        if (atBox && focusBox?.scale) {
            atBox = {w: atBox.w * focusBox.scale, h: atBox.h * focusBox.scale, x: atBox.x, y: atBox.y};
        }
        if (atBox && focusBox?.scaleX) {
            atBox = {w: atBox.w * focusBox.scaleX, h: atBox.h, x: atBox.x, y: atBox.y};
        }
        if (atBox && focusBox?.scaleY) {
            atBox = {w: atBox.w, h: atBox.h * focusBox.scaleY, x: atBox.x, y: atBox.y};
        }
        if (atBox && focusBox?.translate) {
            atBox = {w: atBox.w, h: atBox.h, x: atBox.x + focusBox.translate, y: atBox.y + focusBox.translate};
        }
        if (atBox && focusBox?.translateX) {
            atBox = {w: atBox.w, h: atBox.h, x: atBox.x + focusBox.translateX, y: atBox.y};
        }
        if (atBox && focusBox?.translateY) {
            atBox = {w: atBox.w, h: atBox.h, x: atBox.x, y: atBox.y + focusBox.translateY};
        }
        if (atBox) {
            atBox = box2dp(atBox);
            log.debug(`calculated focusBox ${JSON.stringify(atBox)}`)
        }
        return atBox;
    }

    let focusBoxPosition = await calculateFocusBox(log, page, input.focus, {w: 1024, h: 768, x: 0, y: 0});
    let shapePositions: ShotBroBox[] = [];
    if (input.shapes) {
        for (let i = 0; i < input.shapes.length; i++) {
            let shape = input.shapes[i];
            let shapePos: ShotBroBox | undefined = await calculateShapePosition(log, page, shape);
            if (shapePos != null) {
                shapePositions[i] = shapePos;
            }
        }
    }
    return {
        focusBoxPosition, shapePositions
    };
}


