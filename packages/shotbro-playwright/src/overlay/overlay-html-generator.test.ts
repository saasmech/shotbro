import {generateHtmlForOverlayString} from "./overlay-html-generator";
import type {ShotBroInput} from "../annotate/annotate-types";
import {InputPositions} from "../main-shot/main-screenshot";
import {test} from "@playwright/test";
import {CliLog} from "../util/log";
import {expectHtmlToMatchSnapshot} from "../test/test-utils";

test.describe('Shapes HTML Generator', () => {

    const log = new CliLog('info');

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
        const html = await generateHtmlForOverlayString(log, '../../checkerboard.png', input, positions, true, '../../../bundled');
        await expectHtmlToMatchSnapshot('info', html, 'overlay', 'simple');
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
            ]
        };
        const html = await generateHtmlForOverlayString(
            log, '../../../src/test/checkerboard.png', input,
            positions, true, '../../../src/bundled');
        await expectHtmlToMatchSnapshot('info', html, 'overlay', 'kitchen-sink');
    });

});