import {stringifySbBb} from "./box-utils";
import {ShotBroBox, ShotBroFocus} from "./annotate-types";
import {CliLog} from "../util/log";

function specificityNumber(verySpecific?: number, somewhatSpecific?: number, notSpecific?: number): number | undefined {
    return verySpecific !== undefined ? verySpecific : somewhatSpecific !== undefined ? somewhatSpecific : notSpecific;
}

/**
 * Calculate box with adjustments.
 */
export async function applyFocusBoxAdjustments(log: CliLog, atBox: ShotBroBox, focus?: ShotBroFocus): Promise<ShotBroBox> {
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
    log.debug(`applyFocusBoxAdjustments end ${stringifySbBb(box)}`)
    return box
}

