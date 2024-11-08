import {ShapeCommon, ShapePosition, ShotBroBox} from "./shape-types";
import {ShotBroInput} from "../shotbro-types";
import {JSDOM} from "jsdom";
import {parseSbBb} from "../box-utils";

/**
 * Take position and convert into a location string for playwright
 * @param pos
 */
export const atToLocatorStr = (pos?: ShapePosition) => {
  let locatorStr;
  if (pos?.atShape) {
    locatorStr = `[data-shapeid="${pos.atShape}"]`
  } else if (pos?.atTestId) {
    locatorStr = `[data-testid="${pos.atTestId}"]`
  } else if (pos?.atText) {
    locatorStr = `text="${pos.atText}"`
  } else { // `at` must go last, higher specifity should win
    locatorStr = pos?.at ? pos.at : 'body';
  }
  console.log(`locatorStr ${locatorStr}`)
  return locatorStr
}

export async function getShapeBox(shape: ShapePosition, dom: JSDOM): Promise<ShotBroBox | undefined> {
  let box;
  if (shape) {
    let el;
    const locatorStr = atToLocatorStr(shape);
    if (locatorStr) {
      el = await dom.window.document.body.querySelector(locatorStr)
    }
    if (el) {
      const sbBb = await el.getAttribute('data-sb-bb');
      box = parseSbBb(sbBb) || {x: 0, y: 0, w: 0, h: 0}
    } else {
      console.log('no locator could be found for shape', JSON.stringify(shape))
    }
  }
  return box;
}

export interface ShapeBoxes {
  [key: string]: ShotBroBox;
}

export function ensureShapesHaveId(s: ShotBroInput) {
  let i = 0;
  s.shapes?.forEach((shape) => {
    const ensureShapeHasId = (shapeCommon?: ShapeCommon) => {
      if (shapeCommon) {
        if (!shapeCommon.id) shapeCommon.id = `_shape${i}`;
        i++;
      }
    }
    //ensureShapeHasId(shape.arrow);
    ensureShapeHasId(shape.box);
    ensureShapeHasId(shape.circle);
    ensureShapeHasId(shape.text);
  })
}

export async function locateShapes(mainHtml: string, s: ShotBroInput): Promise<ShapeBoxes> {
  const dom = new JSDOM(mainHtml)

  const shapeBoxes: ShapeBoxes = {};
  const recordShapeLocation = async (shape: ShapePosition & ShapeCommon) => {
    if (shape) {
      const box = await getShapeBox(shape, dom);
      if (box) shapeBoxes[shape.id || 'a'] = box;
    }
  }
  if (s.shapes) {
    for (let i = 0; i < s?.shapes.length + 1; i++) {
      const shapeParent = s?.shapes[i];
      //if (shapeParent?.arrow) await recordShapeLocation(shapeParent?.arrow);
      if (shapeParent?.box) await recordShapeLocation(shapeParent?.box);
      if (shapeParent?.circle) await recordShapeLocation(shapeParent?.circle);
      if (shapeParent?.text) await recordShapeLocation(shapeParent?.text);
    }
  }
  console.log('shapeBoxes', shapeBoxes)
  return shapeBoxes;
}
