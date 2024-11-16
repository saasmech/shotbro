import type {CircleShape, ShotBroShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";

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
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    return `
        <style>
            .${scope}.circle {
                position: fixed;
                top: ${elPos.y - (thickness/2) + translateY}px;
                left: ${elPos.x - (thickness/2) + translateX}px;
                width: ${elPos.w + thickness}px;
                height: ${elPos.h + thickness}px;
                
                border-width: ${thickness}px;
                border-style: solid;
                border-color: ${shape.color};
                border-radius: ${elPos.w / 2}px / ${elPos.h / 2}px;
            }
        </style>
        <div id="${id}" class="${scope} circle"></div>`;
}
