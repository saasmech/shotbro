import type {TextShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";
import {CssPropertiesHyphen, toStyleAttr} from "./css-util";

const defaultProps: TextShape = {
    fontSize: 32,
    color: 'deeppink',
    //padding: 4
    translate: 0,
    translateX: 0,
    translateY: 0,
}

export async function renderText(elPos: ShotBroBox, rawShape: TextShape): Promise<string> {
    const shape = Object.assign({}, defaultProps, rawShape);
    const style = toStyleAttr(toCss(elPos, shape));
    return elPos ? `<div style="${style}">${shape?.value || ''}</div>` : '';
}

function toCss(elPos: ShotBroBox, shape: TextShape): CssPropertiesHyphen {
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    const shadowOffset = (shape?.fontSize || 0) / 16;
    return {
        position: 'fixed',
        top: `${elPos.y + translateX}px`,
        left: `${elPos.x + translateY}px`,
        width: `${elPos.w}px`,
        height: `${elPos.h}px`,
        //padding: `${shape?.padding||0}px`,
        'font-size': `${shape?.fontSize || 0}px`,
        color: shape.color,
        'text-shadow': `${shadowOffset}px ${shadowOffset}px rgba(0,0,0,0.13)`
    };
}


