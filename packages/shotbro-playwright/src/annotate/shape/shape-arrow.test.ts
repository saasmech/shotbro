import {renderArrow} from "./shape-arrow";
import {test} from "@playwright/test";

test.describe('Shape Arrow', () => {

    test('Simple test', async () => {
        const html =
            await renderArrow('shape0', {x: 1, y: 2, w: 40, h: 50}, {
                //thickness: 'Hello World'
            });
        test.expect(html).toMatchSnapshot('arrow-simple.html');
    });
});