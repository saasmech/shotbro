import type {CircleShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";

const defaultProps: CircleShape = {
    thickness: 4,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
}

export async function renderCircle(scope: string, elPos: ShotBroBox, rawShape: CircleShape): Promise<string> {
    const shape: CircleShape = Object.assign({}, defaultProps, rawShape);
    const id = rawShape.id || scope;
    const thickness = shape.thickness || 0;
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    return `
        <style>
            .${scope}.circle {
                position: fixed;
                top: ${elPos.y + translateY - (thickness / 2)}px;
                left: ${elPos.x + translateX - (thickness / 2)}px;
                width: ${elPos.w}px;
                height: ${elPos.h}px;
                
                border-width: ${thickness}px;
                border-style: solid;
                border-color: ${shape.color};
                border-radius: ${elPos.w / 2}px / ${elPos.h / 2}px;
                box-shadow: ${thickness / 2}px ${thickness / 2}px 2px 0px rgba(0,0,0,0.13);
            }
        </style>
        <div id="${id}" class="${scope} circle"></div>`;
}
