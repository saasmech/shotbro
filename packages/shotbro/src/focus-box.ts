import {atToLocatorStr} from "./shape/shape-locator";
import {JSDOM} from "jsdom";
import {parseSbBb, stringifySbBb} from "./box-utils";
import {ShotBroBox, ShotBroFocus, ShotBroInput} from "./shotbro-types";

/**
 * Calculate the position of the box the user selected.  With no padding or other modifiers.
 */
export async function calculateFocusBox(dom: JSDOM, shotBroInput: ShotBroInput): Promise<ShotBroBox> {
  let atBox;
  if (shotBroInput.focus?.atPos) {
    atBox = shotBroInput.focus?.atPos;
  } else {
    let locatorStr = atToLocatorStr(shotBroInput.focus);
    const atLocator = await dom.window.document.querySelector(locatorStr);
    let sbBb;
    if (atLocator) {
      sbBb = await atLocator.getAttribute('data-sb-bb');
      if (sbBb) {
        atBox = parseSbBb(sbBb)
      } else {
        console.log(`Unable to find data-sb-bb attribute for ${locatorStr}`);
      }
    } else  {
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

function specificityNumber(verySpecific?: number, somewhatSpecific?: number, notSpecific?: number): number | undefined {
  return verySpecific !== undefined ? verySpecific : somewhatSpecific !== undefined ? somewhatSpecific : notSpecific;
}

/**
 * Calculate box with padding or other modifiers.
 */
export async function applyFocusBoxAdjustments(atBox: ShotBroBox, focus?: ShotBroFocus): Promise<ShotBroBox> {
  const box = Object.assign({}, atBox);
  const defaultScale = 1;  // scale is hard because it will grow but not reposition, padding better
  const scaleX = specificityNumber(focus?.scaleX, focus?.scale, defaultScale);
  const scaleY = specificityNumber(focus?.scaleY, focus?.scale, defaultScale);
  const translateX = specificityNumber(focus?.translateX, focus?.translate, 0);
  const translateY = specificityNumber(focus?.translateY, focus?.translate, 0);
  if (scaleX) box.w = atBox.w * scaleX;
  if (scaleY) box.h = atBox.h * scaleY;
  if (translateX) box.x = atBox.x + translateX;
  if (translateY) box.y = atBox.y + translateY;
  console.log(`applyFocusBoxAdjustments end ${stringifySbBb(box)}`)
  return box
}

export async function locateFocusBox(mainHtml: string, shotBroProps: ShotBroInput): Promise<ShotBroBox> {
  const dom = new JSDOM(mainHtml);
  const atBox = await calculateFocusBox(dom, shotBroProps);
  return await applyFocusBoxAdjustments(atBox, shotBroProps.focus);
}

export async function getMainBodyBox(mainHtml: string): Promise<ShotBroBox> {
  const dom = new JSDOM(mainHtml);
  const sbBb = dom?.window?.document.body?.getAttribute('data-sb-bb');
  if (!sbBb) {
    console.log('Unable to find data-sb-bb attribute for body, defaulting to 1023x768');
  }
  let bodyBox: ShotBroBox | undefined = undefined;
  if (sbBb) bodyBox = parseSbBb(sbBb)
  if (!bodyBox) bodyBox = {w: 1024, h: 768, x: 0, y: 0}
  return bodyBox;
}
