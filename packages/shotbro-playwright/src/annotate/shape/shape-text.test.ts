import {renderText} from "./shape-text";
import type {TextShape} from "./shape-types";
import type {ShotBroBox} from "../annotate-types";
import {test} from "@playwright/test";

test.describe('Shape Text', () => {

  test('Simple test', async () => {
    const shape: TextShape = {
      value: 'Hello World'
    }
    const elPos: ShotBroBox = {x: 1, y: 2, w: 3, h: 4}
    const html = await renderText(elPos, shape);
    test.expect(html).toMatchSnapshot('text-simple');
  })
});