import {renderArrow} from "./shape-arrow";
import {currentRunImgPath} from "../../test/test-utils";
import * as fs from "node:fs";
import {test} from "@playwright/test";

test.describe('Shape Arrow', () => {

  test('Simple test', async () => {
    const shapesHtml = [
      await renderArrow({x: 1, y: 2, w: 40, h: 50}, {
        //thickness: 'Hello World'
      })
    ]
    const baseHtml = `<html>
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
      <body>
      ${shapesHtml.join('')}
      </body>
      </html>`
    const outFile = currentRunImgPath(__dirname, 'test-arrow.html')
    fs.writeFileSync(outFile, baseHtml);
  });
});