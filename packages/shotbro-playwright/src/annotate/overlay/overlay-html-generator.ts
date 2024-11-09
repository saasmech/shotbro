import {renderText} from "../shape/shape-text";
import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {ShotBroInput} from "../annotate-types";
import {InputPositions} from "../../main-shot/main-screenshotter";
import {renderArrow} from "../shape/shape-arrow";

export async function generateHtmlForOverlayString(mainPng: string|null, input: ShotBroInput, inputPositions: InputPositions) {
  console.log('generate html for overlay');
  const shapesHtml = [];
  if (input.shapes) {
    for (let i = 0; i < input.shapes.length; i++) {
      let shape = input.shapes[i];
      let shapePos = inputPositions.shapePositions[i];
      if (shape && shapePos) {
        let html: string = '';
        if (shape.arrow) html = await renderArrow(shapePos, shape.arrow);
        if (shape.box) html = await renderBox(shapePos, shape.box);
        if (shape.circle) html = await renderCircle(shapePos, shape.circle);
        if (shape.text) html = await renderText(shapePos, shape.text);
        shapesHtml.push(html);
      }
    }
  }
  /**
   * Note use of normalize and open sans font is to ensure there are minimal cross OS differences.
   */
  const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Overlay</title>
        <link href="https://cdn.jsdelivr.net/npm/modern-normalize@3.0.1/modern-normalize.css" rel="stylesheet"/>
        <link href="https://cdn.jsdelivr.net/npm/@fontsource/open-sans@5.1.0/500.css" rel="stylesheet"/>
        <style>
          body {
            font-family: "Open Sans", sans-serif;
            width: ${inputPositions.focusBoxPosition!.w}px;
            height: ${inputPositions.focusBoxPosition!.h}px;
            overflow: hidden;
            background-image: ${mainPng ? "url('${mainPng}')" : 'none'};
            background-repeat: no-repeat;
          }
        </style>
      </head>
      <body>
      ${shapesHtml.join('\n\n')}
      </body>
      </html>
    `
  return template;
}


