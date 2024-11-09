import {applyFocusBoxAdjustments} from "./focus-box";
import {test} from "@playwright/test";

test.describe('Focus Box', () => {

    test.describe('Box Calculations', () => {

        test('when scale is default box should be same', async () => {
            const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {});
            test.expect(box).toMatchObject({x: 10, y: 20, w: 320, h: 1632});
        })

        test('when scale used box should grow', async () => {
            const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scale: 2});
            test.expect(box).toMatchObject({x: 10, y: 20, w: 640, h: 3264});
        })

        test('when scaleX used box should grow', async () => {
            const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scaleX: 2});
            test.expect(box).toMatchObject({x: 10, y: 20, w: 640, h: 1632});
        })

        test('when translate used box should move', async () => {
            const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scale: 1, translate: 12});
            test.expect(box).toMatchObject({x: 22, y: 32, w: 320, h: 1632});
        })
    })


});