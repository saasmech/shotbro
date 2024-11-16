import type {BoxShape, ShotBroShape} from "./shape-types";
import type {ShotBroBox} from "../annotate/annotate-types";

const defaultProps: BoxShape = {
    thickness: 4,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
}

export async function renderBox(scope: string, elPos: ShotBroBox, rawShape: ShotBroShape): Promise<string> {
    const shape: BoxShape = Object.assign({}, defaultProps, rawShape.box);
    const id = shape.id || scope;
    const thickness = shape.thickness || 0;
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    return `
        <style>
            .${scope}.box {
                position: absolute;
                top: ${elPos.y - (thickness / 2) + translateY}px;
                left: ${elPos.x - (thickness / 2) + translateX}px;
                width: ${elPos.w + thickness}px;
                height: ${elPos.h + thickness}px;
                
                border-width: ${(shape.thickness || 0)}px;
                border-style: solid;
                border-color: ${shape.color};
                border-radius: ${thickness}px;
            }
        </style>
        <div id="${id}" class="${scope} box"></div>`;
}
