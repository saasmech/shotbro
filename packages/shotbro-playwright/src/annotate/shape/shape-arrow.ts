import type {ArrowShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";
import {ulid} from "../../util/ulid";

const defaultProps: ArrowShape = {
    thickness: 10,
    color: 'deeppink',
    translate: 0,
    translateX: 0,
    translateY: 0,
    alignTipTo: 'left',
    length: 100,
    rotate: 30,
}

export async function renderArrow(elPos: ShotBroBox, rawShape: ArrowShape): Promise<string> {
    const shape: ArrowShape = Object.assign({}, defaultProps, rawShape);
    const scope = 'arrow-' + ulid();
    const id = rawShape.id || scope;
    const translateX = shape.translateX ?? shape.translate ?? 0
    const translateY = shape.translateY ?? shape.translate ?? 0
    const thickness = shape.thickness || 0;
    const rotate = shape.rotate || 0;
    const length = shape.length || 0;
    return `
        <style>
        .arrow.${scope} {
            position: fixed;
            top: ${elPos.y + translateY - (thickness / 2)}px;
            left: ${elPos.x + translateX - (thickness / 2)}px;
            width: ${length}px;
            height: ${thickness*3}px;
            rotate: ${rotate}deg;
        }
        
        .arrow.${scope} .line {
            margin-top: ${thickness * 1.5}px;
            width: ${(length - thickness * 2)}px;
            background: ${shape.color};
            height: ${thickness}px;
            float: left;
        }
        
        .arrow.${scope} .point {
            width: 0;
            height: 0;
            border-top: ${thickness * 2}px solid transparent;
            border-bottom: ${thickness * 2}px solid transparent;
            border-left: ${(thickness * 2)}px solid ${shape.color};
            float: right;
        }
        </style>
        <div id="${id}" class="arrow ${scope}">
            <div class="line"></div>
            <div class="point"></div>
        </div>`;
}
