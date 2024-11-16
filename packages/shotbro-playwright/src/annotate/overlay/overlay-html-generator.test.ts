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
        const html = await generateHtmlForOverlayString(log, 'main.png', input, positions, true, 'bundled');
        test.expect(html).toMatchSnapshot('shapes-simple.html');
    })

    test('Style kitchen sink', async () => {
        const input: ShotBroInput = {
            shotName: 'test',
            shapes: [
                {icon: {id: 'icon1', name: '1-circle-fill', position: 'top-left'}},
                {icon: {id: 'icon2', name: '1-circle-fill', position: 'top'}},
                {icon: {id: 'icon3', name: '1-circle-fill', position: 'top-right'}},
                {icon: {id: 'icon4', name: '1-circle-fill', position: 'right'}},
                {icon: {id: 'icon5', name: '1-circle-fill', position: 'bottom-right'}},
                {icon: {id: 'icon6', name: '1-circle-fill', position: 'bottom'}},
                {icon: {id: 'icon7', name: '1-circle-fill', position: 'bottom-left'}},
                {icon: {id: 'icon8', name: '1-circle-fill', position: 'left'}},
                {icon: {id: 'icon9', name: '1-circle-fill', position: 'center'}},
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
                // icon
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                {x: 150, y: 50, w: 100, h: 100},
                // box
                {x: 20, y: 250, w: 100, h: 100},
                {x: 200, y: 250, w: 100, h: 50},
                // circle
                {x: 20, y: 450, w: 100, h: 100},
                {x: 200, y: 450, w: 100, h: 50},
                // text
                {x: 20, y: 650, w: 100, h: 100},
                {x: 200, y: 650, w: 100, h: 50},
            ]
        };
        const html = await generateHtmlForOverlayString(log, 'main.png', input, positions, true, '../../../bundled');
        let htmlFile = 'src/annotate/overlay/test-results/kitchen-sink.html';
        fs.writeFileSync(htmlFile, html, 'utf-8');
        test.expect(html).toMatchSnapshot('shapes-style.html');
    });

});