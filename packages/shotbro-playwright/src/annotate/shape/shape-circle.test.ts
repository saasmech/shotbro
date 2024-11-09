import {renderCircle} from "./shape-circle";
import type {CircleShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";
import {test} from "@playwright/test";

test.describe('Shape Circle', () => {

    test('Simple test', async () => {
        const shape: CircleShape = {
            //thickness: 'Hello World'
        }
        const elPos: ShotBroBox = {x: 1, y: 2, w: 40, h: 50}
        const html = await renderCircle('shape0', elPos, shape);
        test.expect(html).toMatchSnapshot('circle-simple.html');
    })
});