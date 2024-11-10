import type {ArrowShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";

const defaultProps: ArrowShape = {
    thickness: 10,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
    alignTipTo: 'right',
    length: 100,
    rotate: 15,
}

export async function renderArrow(scope: string, elPos: ShotBroBox, rawShape: ArrowShape): Promise<string> {
    const shape: ArrowShape = Object.assign({}, defaultProps, rawShape);
    const id = rawShape.id || scope;
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    const thickness = shape.thickness || 0;
    let rotate = shape.rotate || 0;
    const length = shape.length || 0;

    let top: number;
    let left: number;
    let transform = 'none';
    switch (shape.alignTipTo) {
        case 'top':
            top = elPos.y - (length/2);
            left = elPos.x + (elPos.w/3);
            rotate += 90;
            break;
        case 'bottom':
            rotate -= 90;
            top = elPos.y + elPos.h + (length/4);
            left = elPos.x - (elPos.w/4);
            break;
        case 'left':
            top = elPos.y - (elPos.h/4);
            left = elPos.x - length;
            break;
        default: // right
            top = elPos.y + (elPos.h/4);
            left = elPos.x + elPos.w;
            transform = 'scaleX(-1)';
    }

    return `
        <style>
        .${scope}.arrow {
            position: fixed;
            top: ${top + translateY}px;
            left: ${left + translateX}px;
            width: ${length}px;
            height: ${thickness * 3}px;
            rotate: ${rotate}deg;
            transform: ${transform};
        }
        
        .${scope}.arrow .line {
            margin-top: ${thickness * 1.5}px;
            width: ${(length - thickness * 2)}px;
            background: ${shape.color};
            height: ${thickness}px;
            float: left;
        }
        
        .${scope}.arrow .point {
            width: 0;
            height: 0;
            border-top: ${thickness * 2}px solid transparent;
            border-bottom: ${thickness * 2}px solid transparent;
            border-left: ${(thickness * 2)}px solid ${shape.color};
            float: right;
        }
        </style>
        <div id="${id}" class="${scope} arrow">
            <div class="line"></div>
            <div class="point"></div>
        </div>`;
}
