import {generateHtmlForOverlayString} from "./overlay-html-generator";
import type {ShotBroInput} from "../annotate-types";
import {InputPositions} from "../../main-shot/main-screenshotter";
import {test} from "@playwright/test";
import * as fs from "node:fs";
import {testResultsPath} from "../../test/test-utils";

test.describe('Shapes HTML Generator', () => {

    test('Simple test', async () => {
        const input: ShotBroInput = {
            shotName: 'test',
            shapes: [
                {circle: {id: 'circle1'}}
            ]
        };
        const positions: InputPositions = {
            focusBoxPosition: {x: 0, y: 0, w: 100, h: 100},
            shapePositions: [{x: 4, y: 5, w: 40, h: 50}]
        };
        const html = await generateHtmlForOverlayString('main.png', input, positions);
        test.expect(html).toMatchSnapshot('shapes-simple.html');
    })

    test('Style kitchen sink', async () => {
        const input: ShotBroInput = {
            shotName: 'test',
            shapes: [
                {arrow: {id: 'arrow1'}},
                {arrow: {id: 'arrow2', alignTipTo: 'right'}},
                {box: {id: 'box1'}},
                {box: {id: 'box2'}},
                {circle: {id: 'circle1'}},
                {circle: {id: 'circle2'}},
                {text: {id: 'text1', value: 'Text1'}},
                {text: {id: 'text2', value: 'Text2'}},
            ]
        }
        const positions: InputPositions = {
            focusBoxPosition:
                {x: 0, y: 0, w: 400, h: 1000},
            shapePositions: [
                {x: 20, y: 50, w: 100, h: 100},
                {x: 200, y: 50, w: 100, h: 50},
                {x: 20, y: 250, w: 100, h: 100},
                {x: 200, y: 250, w: 100, h: 50},
                {x: 20, y: 450, w: 100, h: 100},
                {x: 200, y: 450, w: 100, h: 50},
                {x: 20, y: 650, w: 100, h: 100},
                {x: 200, y: 650, w: 100, h: 50},
            ]
        };
        const html = await generateHtmlForOverlayString(null, input, positions);
        let htmlFile = testResultsPath(__dirname, 'kitchen-sink.html');
        fs.writeFileSync(htmlFile, html, 'utf-8')
        test.expect(html).toMatchSnapshot('shapes-style.html');
    })

});