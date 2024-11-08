import {renderText} from "../shape/shape-text";
import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {ShapeBoxes} from "../shape/shape-locator";
import {ShotBroBox, ShotBroInput} from "../shotbro-types";
import {ShapeCommon} from "../shape/shape-types";
import {toStyleAttr} from "../shape/css-util";

export async function generateHtmlForOverlayString(shotBroProps: ShotBroInput, mainScreenShotBox: ShotBroBox,
                                                   foundElementBoxes: ShapeBoxes) {
  console.log('generate html for overlay');
  let getElPos = (shape: ShapeCommon) : ShotBroBox => {
    let foundBox = {w: 0, h: 0, x: 0, y: 0 }
    if (shape?.id) {
      foundBox = foundElementBoxes[shape.id]
    } else {
      console.log('missing elPos for shape', shape.id)
    }
    return foundBox;
  }

  const bodyStyle = {
    width: `${mainScreenShotBox.w}px`,
    height: `${mainScreenShotBox.h}px`,
    overflow: 'hidden'
  }

  const shapesHtml = [];
  if (shotBroProps.shapes) {
    for (let shape of shotBroProps.shapes) {
      let html: string = '';
      if (shape?.box) html = await renderBox(getElPos(shape?.box), shape?.box);
      if (shape?.circle) html = await renderCircle(getElPos(shape?.circle), shape?.circle);
      if (shape?.text) html = await renderText(getElPos(shape?.text), shape?.text);
      shapesHtml.push(html);
    }
  }
  /**
   * we need to ensure there are minimal cross OS differences or else matching basline images won't work
   * use a standard font
   */
  const template = `
      <html>
      <head>
        <title>Overlay</title>
        <link href="https://cdn.jsdelivr.net/npm/modern-normalize@1.1.0/modern-normalize.css" rel="stylesheet"/>
        <link href="https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.12/500.css" rel="stylesheet"/>
        <style>
          body, h1 {
            font-size: 80px;
            font-family: Inter, sans-serif;
            background-color: transparent;
          }
        </style>
      </head>
      <body style="${toStyleAttr(bodyStyle)}">
        ${shapesHtml.join('')}
      </body>
      </html>
    `
  return template;
}


