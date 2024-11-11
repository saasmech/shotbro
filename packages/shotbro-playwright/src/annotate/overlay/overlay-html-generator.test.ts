import {generateHtmlForOverlayString} from "./overlay-html-generator";
import type {ShotBroInput} from "../annotate-types";
import {InputPositions} from "../../main-shot/main-screenshotter";
import {test} from "@playwright/test";
import * as fs from "node:fs";
import {CliLog} from "../../util/log";

test.describe('Shapes HTML Generator', () => {

    const log = new CliLog('debug');

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
        const html = await generateHtmlForOverlayString(log, 'main.png', input, positions, true, '');
        test.expect(html).toMatchSnapshot('shapes-simple.html');
    })

    test('Style kitchen sink', async () => {
        const input: ShotBroInput = {
            shotName: 'test',
            shapes: [
                {arrow: {id: 'arrow1', alignTipTo: 'top'}},
                {arrow: {id: 'arrow2' }}, // right
                {arrow: {id: 'arrow3', alignTipTo: 'bottom'}},
                {arrow: {id: 'arrow4', alignTipTo: 'left'}},
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
                {x: 150, y: 50, w: 100, h: 50},
                {x: 300, y: 50, w: 100, h: 100},
                {x: 450, y: 50, w: 100, h: 50},
                {x: 20, y: 250, w: 100, h: 100},
                {x: 200, y: 250, w: 100, h: 50},
                {x: 20, y: 450, w: 100, h: 100},
                {x: 200, y: 450, w: 100, h: 50},
                {x: 20, y: 650, w: 100, h: 100},
                {x: 200, y: 650, w: 100, h: 50},
            ]
        };
        const html = await generateHtmlForOverlayString(log, null, input, positions, true, '../../../');
        let htmlFile = 'src/annotate/overlay/test-results/kitchen-sink.html';
        fs.writeFileSync(htmlFile, html, 'utf-8');
        test.expect(html).toMatchSnapshot('shapes-style.html');
    });

});