import type {TextShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";

const defaultProps: TextShape = {
    fontSize: 32,
    color: 'deeppink',
    //padding: 4
    translate: 0,
    translateX: 0,
    translateY: 0,
}

export async function renderText(scope: string, elPos: ShotBroBox, rawShape: TextShape): Promise<string> {
    const shape = Object.assign({}, defaultProps, rawShape);
    const id = rawShape.id || scope;
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    const shadowOffset = (shape?.fontSize || 0) / 16;
    return `
        <style>
            .${scope}.text {
                position: fixed;
                top: ${elPos.y + translateX}px;
                left: ${elPos.x + translateY}px;
                width: ${elPos.w}px;
                height: ${elPos.h}px;
                ZZpadding: '\$\{shape?.padding || 0}px';
                font-size: ${shape?.fontSize || 0}px;
                color: ${shape.color};
                text-shadow: ${shadowOffset}px ${shadowOffset}px rgba(0,0,0,0.13);
            }
        </style>
        <div id="${id}" class="${scope} text">${shape?.value || ''}</div>`;
}
