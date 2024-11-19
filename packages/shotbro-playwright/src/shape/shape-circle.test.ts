import {renderCircle} from "./shape-circle";
import type {ShotBroBox} from "../annotate/annotate-types";
import {test} from "@playwright/test";
import {expectHtmlToMatchSnapshot, testShape} from "../test/test-utils";

test.describe('Shape Circle', () => {

    test('Simple test', async () => {
        const elPos: ShotBroBox = {x: 1, y: 2, w: 40, h: 50}
        const html = await renderCircle('shape0', elPos, {circle: {}});
        await expectHtmlToMatchSnapshot('info', html, 'circle', 'simple');
    });

    test('Thickness', async ({page}) => {
        let thicknesses = [1, 8, 32];
        for (const thickness of thicknesses) {
            await testShape('info', page, 'circle', `thickness-${thickness}`, {
                circle: {thickness}
            });
        }
    });
});