import {renderBox} from "./shape-box";
import type {ShotBroBox} from "../annotate/annotate-types";
import {test} from "@playwright/test";
import {testShape, expectHtmlToMatchSnapshot} from "../test/test-utils";

test.describe('Shape Box', () => {

    test('Simple test', async () => {
        const elPos: ShotBroBox = {x: 1, y: 2, w: 40, h: 50}
        const html = await renderBox('shape0', elPos, {box: {}});
        await expectHtmlToMatchSnapshot('info', html, 'box', 'simple');
    });

    test('Thickness', async ({page}) => {
        let thicknesses = [1, 8, 32];
        for (const thickness of thicknesses) {
            await testShape('info', page, 'box', `thickness-${thickness}`, {
                box: {thickness}
            });
        }
    });

    test('Rotate', async ({page}) => {
        let rotations = [5, 25, 270];
        for (const rotate of rotations) {
            await testShape('info', page, 'box', `rotate-${rotate}`, {
                box: {rotate}
            });
        }
    });
});