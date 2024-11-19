import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {type ShotBroBox, ShotBroInput} from "../annotate/annotate-types";
import {InputPositions} from "../main-shot/main-screenshot";
import {CliLog} from "../util/log";
import {renderIcon} from "../shape/shape-icon";

import {n2dp} from "../shape/shape-utils";

/**
 * Amount of spare space to the left and top of the main screenshot.  Only apply at the very last second when making CSS.
 */
export const BLEED = 100;

export async function generateHtmlForOverlayString(
    log: CliLog,
    mainPng: string,
    input: ShotBroInput,
    inputPositions: InputPositions,
    debug: boolean | undefined,
    bundledAssetsUrl: string | undefined
) {
    const shapesHtml = [];
    log.debug("generateHtmlForOverlayString", mainPng, debug, bundledAssetsUrl);
    if (input.shapes) {
        for (let i = 0; i < input.shapes.length; i++) {
            let shape = input.shapes[i];
            let shapeUniqId = 'shape' + i;
            let shapePos = inputPositions.shapePositions[i];
            if (shape && shapePos) {
                let html: string = '';
                if (shape.box) html = await renderBox(shapeUniqId, shapePos, shape);
                if (shape.circle) html = await renderCircle(shapeUniqId, shapePos, shape);
                if (shape.icon) html = await renderIcon(shapeUniqId, shapePos, shape);
                shapesHtml.push(html);
                if (debug) {
                    let posHelper = debug ? renderHelperBox(shapeUniqId, shapePos) : '';
                    shapesHtml.push(posHelper);
                }
            }
        }
    }
    if (inputPositions.focusBoxPosition && debug) {
        let posHelper = debug ? renderHelperBox('focus', inputPositions.focusBoxPosition) : '';
        shapesHtml.push(posHelper);
    }

    /**
     * Note use of normalize and open sans font is to ensure there are minimal cross OS differences.
     */
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Overlay</title>
        <link href="${bundledAssetsUrl}/@fontsource/open-sans/500.css" rel="stylesheet"/>
        <link href="${bundledAssetsUrl}/bootstrap/dist/css/bootstrap.css" rel="stylesheet"/>
        <link href="${bundledAssetsUrl}/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet"/>
        <style>
          body {
            font-family: "Open Sans", sans-serif;
            background-color: transparent;
            background-image: url('${mainPng}');
            background-position: ${BLEED}px ${BLEED}px;
            background-repeat: no-repeat;
          }
        </style>
      </head>
      <body>
      ${shapesHtml.join('\n\n')}
      </body>
      </html>`
    return template;
}

function renderHelperBox(scope: string, elPos: ShotBroBox): string {
    return `
        <style>
        .${scope}.helper {
            position: absolute;
            top: ${n2dp(elPos.y + BLEED)}px;
            left: ${n2dp(elPos.x + BLEED)}px;
            width: ${n2dp(elPos.w)}px;
            height: ${n2dp(elPos.h)}px;
            border: 1px solid red;
          }
         </style>
        <div id="helper-${scope}" class="${scope} helper"></div>`;
}
