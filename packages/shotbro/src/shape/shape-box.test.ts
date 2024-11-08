import {renderBox} from "./shape-box";
import type {ShotBroBox, BoxShape} from "./shape-types";

describe('Shape Box', () => {

  test('Simple test', async () => {
    const shape: BoxShape = {
      //thickness: 'Hello World'
    }
    const elPos: ShotBroBox = {x: 1, y: 2, w: 40, h: 50}
    const html = await renderBox(elPos, shape);
    expect(html).toMatchSnapshot('box-simple');
  })
});