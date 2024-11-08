import type {ArrowShape, ShotBroBox} from "./shape-types";
import {CssPropertiesHyphen, toStyleAttr} from "./css-util";

const defaultProps: ArrowShape = {
  thickness: 4,
  color: 'deeppink',
  translate: 0,
  translateX: 0,
  translateY: 0,
  alignTipTo: "left"
}

export async function renderArrow(elPos: ShotBroBox, rawShape: ArrowShape): Promise<String> {
  const shape: ArrowShape = Object.assign({}, defaultProps, rawShape);
  const style = toStyleAttr(toCss(elPos, shape));
  return elPos ? `<div style="${style}"></div>` : '';
}

function toCss(elPos: ShotBroBox, shape: ArrowShape): CssPropertiesHyphen {
  const thickness = shape.thickness || 0;
  const translateX = shape.translateX ?? shape.translate ?? 0
  const translateY = shape.translateY ?? shape.translate ?? 0
  return {
    position: 'fixed',
    top: `${elPos.y + translateY - (thickness / 2)}px`,
    left: `${elPos.x + translateX - (thickness / 2)}px`,
    width: `${elPos.w}px`,
    height: `${elPos.h}px`,

    'border-width': `${thickness}px`,
    'border-style': 'solid',
    'border-color': shape.color,
    'border-radius': `${elPos.w / 2}px / ${elPos.h / 2}px`,
    'box-shadow': `${thickness / 2}px ${thickness / 2}px 2px 0px rgba(0,0,0,0.13)`
  };
}
