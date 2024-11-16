import type {CircleShape, ShotBroShape} from "./shape-types";
import type {ShotBroBox} from "../annotate/annotate-types";

import {n2dp} from "./shape-utils";

const defaultProps: CircleShape = {
    thickness: 4,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
}

export async function renderCircle(scope: string, elPos: ShotBroBox, rawShape: ShotBroShape): Promise<string> {
    const shape: CircleShape = Object.assign({}, defaultProps, rawShape.circle);
    const id = shape.id || scope;
    const thickness = shape.thickness!;
    const translateX = shape.translateX ?? shape.translate ?? 0;
    const translateY = shape.translateY ?? shape.translate ?? 0;
    const top = elPos.y - (thickness/2);
    const left = elPos.x - (thickness/2);
    return `
        <style>
            .${scope}.circle {
                position: absolute;
                top: ${n2dp(top + translateY)}px;
                left: ${n2dp(left + translateX)}px;
                width: ${elPos.w + thickness}px;
                height: ${elPos.h + thickness}px;
                
                border-width: ${thickness}px;
                border-style: solid;
                border-color: ${shape.color};
                border-radius: ${n2dp(elPos.w / 2)}px / ${n2dp(elPos.h / 2)}px;
            }
        </style>
        <div id="${id}" class="${scope} circle"></div>`;
}
