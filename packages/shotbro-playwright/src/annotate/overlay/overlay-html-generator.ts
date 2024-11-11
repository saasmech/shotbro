import {renderText} from "../shape/shape-text";
import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {type ShotBroBox, ShotBroInput} from "../annotate-types";
import {InputPositions} from "../../main-shot/main-screenshotter";
import {renderArrow} from "../shape/shape-arrow";
import {CliLog} from "../../util/log";

export async function generateHtmlForOverlayString(
    log: CliLog,
    mainPng: string | null,
    input: ShotBroInput,
    inputPositions: InputPositions,
    debug: boolean | undefined,
    bundledPathPrefix: string | undefined
) {
    const shapesHtml = [];
    log.debug("generateHtmlForOverlayString: ", input, inputPositions, debug, bundledPathPrefix);
    if (input.shapes) {
        for (let i = 0; i < input.shapes.length; i++) {
            let shape = input.shapes[i];
            let shapeUniqId = 'shape' + i;
            let shapePos = inputPositions.shapePositions[i];
            if (shape && shapePos) {
                let html: string = '';
                if (shape.arrow) html = await renderArrow(shapeUniqId, shapePos, shape.arrow);
                if (shape.box) html = await renderBox(shapeUniqId, shapePos, shape.box);
                if (shape.circle) html = await renderCircle(shapeUniqId, shapePos, shape.circle);
                if (shape.text) html = await renderText(shapeUniqId, shapePos, shape.text);
                shapesHtml.push(html);
                if (debug) {
                    let posHelper = debug ? renderHelperBox(shapeUniqId, shapePos) : '';
                    shapesHtml.push(posHelper);
                }
            }
        }
    }
    const bundledPath = bundledPathPrefix ? bundledPathPrefix : '';
    const modernNormalizePath = bundledPath + "bundled/modern-normalize/modern-normalize.css";
    const openSansPath = bundledPath + "bundled/@fontsource/open-sans/500.css";
    const mainPngCss = mainPng ? "url('" + mainPng + "')" : 'none';

    /**
     * Note use of normalize and open sans font is to ensure there are minimal cross OS differences.
     */
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Overlay</title>
        <link href="${modernNormalizePath}" rel="stylesheet"/>
        <link href="${openSansPath}" rel="stylesheet"/>
        <style>
          body {
            font-family: "Open Sans", sans-serif;
            width: ${inputPositions.focusBoxPosition!.w}px;
            height: ${inputPositions.focusBoxPosition!.h}px;
            overflow: hidden;
            background-image: ${mainPngCss};
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
            position: fixed;
            top: ${elPos.y}px;
            left: ${elPos.x}px;
            width: ${elPos.w}px;
            height: ${elPos.h}px;
            border: 1px solid red;
          }
         </style>
        <div id="helper-${scope}" class="${scope} helper"></div>`;
}
