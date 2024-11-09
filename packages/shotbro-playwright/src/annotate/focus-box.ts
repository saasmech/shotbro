import {stringifySbBb} from "./box-utils";
import {ShotBroBox, ShotBroFocus} from "./annotate-types";


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

