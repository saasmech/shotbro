import {renderBox} from "../shape/shape-box";
import {renderCircle} from "../shape/shape-circle";
import {type ShotBroBox, ShotBroInput} from "../annotate/annotate-types";
import {InputPositions} from "../main-shot/main-screenshot";
import {CliLog} from "../util/log";
import {renderIcon} from "../shape/shape-icon";

export async function generateHtmlForOverlayString(
    log: CliLog,
    mainPng: string,
    input: ShotBroInput,
    inputPositions: InputPositions,
    debug: boolean | undefined,
    bundledPath: string | undefined
) {
    const shapesHtml = [];
    log.debug("generateHtmlForOverlayString: ", mainPng, debug, bundledPath);
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
        <link href="${bundledPath}/@fontsource/open-sans/500.css" rel="stylesheet"/>
        <link href="${bundledPath}/bootstrap/dist/css/bootstrap.css" rel="stylesheet"/>
        <link href="${bundledPath}/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet"/>
        <style>
          body {
            font-family: "Open Sans", sans-serif;
            background-image: url('${mainPng}');
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
            top: ${elPos.y}px;
            left: ${elPos.x}px;
            width: ${elPos.w}px;
            height: ${elPos.h}px;
            border: 1px solid red;
          }
         </style>
        <div id="helper-${scope}" class="${scope} helper"></div>`;
}
