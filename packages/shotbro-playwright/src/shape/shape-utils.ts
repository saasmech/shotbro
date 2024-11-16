import {ShapePosition} from "./shape-types";
import {CliLog} from "../util/log";
import {ShotBroBox} from "../annotate/annotate-types";

/**
 * Take position and convert into a locator string for playwright
 */
export const atToLocatorStr = (log: CliLog, pos?: ShapePosition) => {
    let locatorStr;
    if (pos?.atTestId) {
        locatorStr = `[data-testid="${pos.atTestId}"]`
    } else if (pos?.atText) {
        locatorStr = `text="${pos.atText}"`
    } else { // `at` must go last, higher specifity should win
        locatorStr = pos?.at ? pos.at : 'body';
    }
    log.debug(`locatorStr ${locatorStr}`)
    return locatorStr
}

export function box2dp(box: ShotBroBox): ShotBroBox {
    return {
        h: n2dp(box.h), w: n2dp(box.w), x: n2dp(box.x), y: n2dp(box.y),
    }
}

export function n2dp(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}