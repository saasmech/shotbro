import type {BrowserContext, Page} from "@playwright/test";
import {ShotBroBox, ShotBroFocus, ShotBroInput} from "../annotate/annotate-types";
import {ShapePosition} from "../annotate/shape/shape-types";
import {atToLocatorStr} from "../annotate/shape/shape-locator";
import {stringifySbBb} from "../annotate/box-utils";
import {generateHtmlForOverlayString} from "../annotate/overlay/overlay-html-generator";

const MAIN_CAPTURE_HEIGHT_LIMIT = 4000;
const MAIN_CAPTURE_WIDTH_LIMIT = 4000;

export type InputPositions = {
    focusBoxPosition?: ShotBroBox,
    shapePositions: ShotBroBox[]
}

export async function generateMainScreenshot(page: Page, screenshotPath: string) {
    const rootEl = await page.locator('html');
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


export async function findPositions(page: Page, input: ShotBroInput): Promise<InputPositions> {
    //const inputPositionsOuter = await page.evaluate(async (inputInner) => {
    // otherwise we are very specifically not touching playwright's setup as the
    // test may have scrolled something (like a div within a larger div)

    // suggest: optionally ensure the page is scrolled to the top
    // window.scroll({top: 0, left: 0, behavior: 'auto'});

    //let page = null;
    async function calculateShapePosition(page: Page, shapePosition: ShapePosition) {
        return await calculateFocusBox(page, shapePosition);
    }

    /**
     * Calculate the position of the box the user selected.  With no padding or other modifiers.
     */
    async function calculateFocusBox(page: Page, focusBox: ShotBroFocus): Promise<ShotBroBox> {
        let atBox;
        if (focusBox?.atPos) {
            atBox = focusBox?.atPos;
        } else {
            let locatorStr = atToLocatorStr(focusBox);
            const atLocator = page.locator(locatorStr);
            let sbBb;
            if (atLocator) {
                sbBb = await atLocator.boundingBox();
                if (sbBb) {
                    atBox = {x: sbBb.x, y: sbBb.y, w: sbBb.width, h: sbBb.height};
                } else {
                    console.log(`Unable to find data-sb-bb attribute for ${locatorStr}`);
                }
            } else {
                console.log('Unable to find a locator node main screenshot')
            }
            if (!atBox) {
                console.log('unable to calculate focus box, using default')
                atBox = {w: 1024, h: 768, x: 0, y: 0};
            }
        }
        console.log(`calculated focusBox ${stringifySbBb(atBox)}`)
        return atBox;
    }

    let focusBoxPosition: ShotBroBox | undefined = undefined;
    let shapePositions: ShotBroBox[] = [];
    if (input.focus && input.focus.at) {
        focusBoxPosition = await calculateFocusBox(page, input.focus);
    }
    if (input.shapes) {
        for (let i = 0; i < input.shapes.length; i++) {
            let shape = input.shapes[i];
            let shapePos: ShotBroBox | null = null;
            if (shape.arrow) {
                shapePos = await calculateShapePosition(page, shape.arrow);
            }
            if (shape.box) {
                shapePos = await calculateShapePosition(page, shape.box);
            }
            if (shape.circle) {
                shapePos = await calculateShapePosition(page, shape.circle);
            }
            if (shape.text) {
                shapePos = await calculateShapePosition(page, shape.text);
            }
            if (shapePos != null) {
                shapePositions[i] = shapePos;
            }
        }
    }
    return {
        focusBoxPosition, shapePositions
    };
}

export async function shotBroPlaywrightAnnotate(context: BrowserContext, input: ShotBroInput, inputPositions: InputPositions, focusPngPath: string) {
    let html = await generateHtmlForOverlayString(input, inputPositions);
    let page = await context.newPage();
    await page.goto('data:text/html,' + html);
    await page.waitForTimeout(1000);
    await page.screenshot({path: focusPngPath});
    await page.close();
}
