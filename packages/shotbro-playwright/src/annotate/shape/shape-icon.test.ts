import type {IconShape, RelativePosition} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";
import {test} from "@playwright/test";
import {renderIcon} from "./shape-icon";
import {testShape} from "../../test/test-utils";

test.describe('Shape Icon', () => {

    test('Simple test', async () => {
        const shape: IconShape = {}
        const elPos: ShotBroBox = {x: 1, y: 2, w: 3, h: 4};
        const html = await renderIcon('shape0', elPos, {icon: shape});
        test.expect(html).toMatchSnapshot('icon-simple.html');
    });

    test('position', async ({page}) => {
        let positions: RelativePosition[] = [
            'top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom',
            'bottom-left', 'left', 'center'
        ];
        for (const position of positions) {
            await testShape('info', page, 'icon', `position-${position}`, {
                icon: {position: position, name: 'emoji-smile-fill'}
            });
        }
    })
});