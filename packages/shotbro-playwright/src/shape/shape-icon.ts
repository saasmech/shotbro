import type {IconShape, RelativePosition, ShotBroShape} from "./shape-types";
import type {ShotBroBox} from "../annotate/annotate-types";

import {n2dp} from "./shape-utils";
import {BLEED} from "../overlay/overlay-html-generator";

const defaultProps: IconShape = {
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
    name: 'arrow-left-circle-fill',
    position: 'right',
    size: 50,
    class: '',
    rotate: 0
}

export async function renderIcon(scope: string, elPos: ShotBroBox, rawShape: ShotBroShape): Promise<string> {
    const shape: IconShape = Object.assign({}, defaultProps, rawShape.icon);

    const id = shape.id || scope;
    const translateX = shape.translateX ?? shape.translate ?? 0;
    const translateY = shape.translateY ?? shape.translate ?? 0;
    const top = calculateTop(shape.position!, elPos, shape.size!);
    const left = calculateLeft(shape.position!, elPos, shape.size!);
    return `
        <!-- ${id}
            rawShape: ${JSON.stringify(rawShape)} 
            elPos: ${JSON.stringify(elPos)}    
        -->
        <style>
            .${scope}.icon {
                position: absolute;
                top: ${n2dp(top + translateY + BLEED)}px;
                left: ${n2dp(left + translateX + BLEED)}px;
                width: ${shape.size}px;
                height: ${shape.size}px;
                transform: rotate(${shape.rotate}deg);
            }
            .${scope}.icon i.bi {
                font-size: ${shape.size}px;
                line-height: ${shape.size}px;
                color: ${shape.color};                 
            }
        </style>
        <div id="${id}" class="${scope} icon">
            <i class="bi bi-${shape.name}"></i>
        </div>`;
}

function calculateTop(position : RelativePosition, elPos: ShotBroBox, size: number): number {
    switch(position) {
        case 'top-left':
            return elPos.y - (size/2);
        case 'top':
            return elPos.y - (size/2);
        case 'top-right':
            return elPos.y - (size/2);
        case 'right':
            return elPos.y + (elPos.h/2) - (size/2);
        case 'bottom-right':
            return elPos.y + elPos.h - (size/2);
        case 'bottom':
            return elPos.y + elPos.h - (size/2);
        case 'bottom-left':
            return elPos.y + elPos.h - (size/2);
        case 'left':
            return elPos.y + (elPos.h/2) - (size/2);
        case 'center':
            return elPos.y + (elPos.h/2) - (size/2);
    }
}

function calculateLeft(position : RelativePosition, elPos: ShotBroBox, size: number): number {
    switch(position) {
        case 'top-left':
            return elPos.x - (size/2);
        case 'top':
            return elPos.x + (elPos.w/2) - (size/2);
        case 'top-right':
            return elPos.x + elPos.w - (size/2);
        case 'right':
            return elPos.x + elPos.w - (size/2);
        case 'bottom-right':
            return elPos.x + elPos.w - (size/2);
        case 'bottom':
            return elPos.x + (elPos.w/2) - (size/2);
        case 'bottom-left':
            return elPos.x - (size/2);
        case 'left':
            return elPos.x - (size/2);
        case 'center':
            return elPos.x + (elPos.w/2) - (size/2);
    }
}
