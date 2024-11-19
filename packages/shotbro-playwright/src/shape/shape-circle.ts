import type {CircleShape, ShotBroShape} from "./shape-types";
import type {ShotBroBox} from "../annotate/annotate-types";

import {n2dp} from "./shape-utils";
import {BLEED} from "../overlay/overlay-html-generator";

const defaultProps: CircleShape = {
    thickness: 4,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
    rotate: 0
}

export async function renderCircle(scope: string, elPos: ShotBroBox, rawShape: ShotBroShape): Promise<string> {
    const shape: CircleShape = Object.assign({}, defaultProps, rawShape.circle);
    const id = shape.id || scope;
    const thickness = shape.thickness!;
    const translateX = shape.translateX ?? shape.translate ?? 0;
    const translateY = shape.translateY ?? shape.translate ?? 0;
    const top = elPos.y - (thickness);
    const left = elPos.x - (thickness);
    return `
        <style>
            .${scope}.circle {
                position: absolute;
                
                top: ${n2dp(top + translateY + BLEED)}px;
                left: ${n2dp(left + translateX + BLEED)}px;
                width: ${n2dp(elPos.w + (thickness*2))}px;
                height: ${n2dp(elPos.h + (thickness*2))}px;
                transform: rotate(${shape.rotate}deg);
                
                border-width: ${thickness}px;
                border-style: solid;
                border-color: ${shape.color};
                border-radius: ${n2dp((elPos.w / 2) + thickness)}px / ${n2dp((elPos.h / 2) + thickness)}px;
            }
        </style>
        <div id="${id}" class="${scope} circle"></div>`;
}
