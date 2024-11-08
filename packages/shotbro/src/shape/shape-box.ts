import type {BoxShape, ShotBroBox} from "./shape-types";
import {CssPropertiesHyphen, toStyleAttr} from "./css-util";

const defaultProps: BoxShape = {
  thickness: 4,
  //padding: 4,
  color: 'deeppink',
  translate: 0,
  translateX: 0,
  translateY: 0,
}

export async function renderBox(elPos: ShotBroBox, rawShape: BoxShape): Promise<string> {
  const shape: BoxShape = Object.assign({}, defaultProps, rawShape);
  const style = toStyleAttr(toCss(elPos, shape));
  return elPos ? `<div style="${style}"></div>` : '';
}

function toCss(elPos: ShotBroBox, shape: BoxShape): CssPropertiesHyphen {
  const thickness = shape.thickness || 0;
  const translateX = shape.translateX ?? shape.translate ?? 0
  const translateY = shape.translateY ?? shape.translate ?? 0
  return {
    position: 'fixed',
    top: `${elPos.y + translateY - (thickness / 2)}px`,
    left: `${elPos.x + translateX - (thickness / 2)}px`,
    width: `${(thickness * 2) + elPos.w}px`,
    height: `${(thickness * 2) + elPos.h}px`,

    'border-width': `${(shape.thickness || 0)}px`,
    'border-style': 'solid',
    'border-color': shape.color,
    'border-radius': `${thickness}px`,
    'box-shadow': `${thickness / 2}px ${thickness / 2}px 2px 0px rgba(0,0,0,0.13)`
  }
}