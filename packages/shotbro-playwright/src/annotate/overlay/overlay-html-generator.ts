import {renderText} from "../shape/shape-text";
import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {ShotBroInput} from "../annotate-types";
import {toStyleAttr} from "../shape/css-util";
import {InputPositions} from "../../main-shot/main-screenshotter";

export async function generateHtmlForOverlayString(input: ShotBroInput, inputPositions: InputPositions) {
  console.log('generate html for overlay');
  const bodyStyle = {
    width: `${inputPositions.focusBoxPosition!.w}px`,
    height: `${inputPositions.focusBoxPosition!.h}px`,
    overflow: 'hidden'
  }

  const shapesHtml = [];
  if (input.shapes) {
    for (let i = 0; i < input.shapes.length; i++) {
      let shape = input.shapes[i];
      let shapePos = inputPositions.shapePositions[i];
      if (shape && shapePos) {
        let html: string = '';
        if (shape.box) html = await renderBox(shapePos, shape.box);
        if (shape.circle) html = await renderCircle(shapePos, shape.circle);
        if (shape.text) html = await renderText(shapePos, shape.text);
        shapesHtml.push(html);
      }
    }
  }
  /**
   * we need to ensure there are minimal cross OS differences or else matching basline images won't work
   * use a standard font
   */
  const template = `
      <html lang="en">
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


