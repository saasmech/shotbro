import {generateHtmlForOverlayString} from "./overlay-html-generator";
import type {ShotBroInput} from "../shotbro-types";
import type {ShapeBoxes} from "../shape/shape-locator";

describe('Shapes HTML Generator', () => {

  test('Simple test', async () => {
    const input: ShotBroInput = {
      shotName: 'test',
      shapes: [
        {circle: {id: 'circle1'}}
      ]
    }
    const foundElementBoxes: ShapeBoxes = {
      'circle1': {x: 4, y: 5, w: 40, h: 50}
    };
    const html = await generateHtmlForOverlayString(input, {x: 0, y: 0, w: 100, h: 100},
      foundElementBoxes);
    expect(html).toMatchSnapshot('shapes-simple');
  })

  test('Style kitchen sink', async () => {
    const input: ShotBroInput = {
      shotName: 'test',
      shapes: [
        {circle: {id: 'circle1'}}, {circle: {id: 'circle2'}},
        {box: {id: 'box1'}}, {box: {id: 'box2'}},
        {text: {id: 'text1', value: 'Text1'}}, {text: {id: 'text2', value: 'Text2'}},
      ]
    }
    const foundElementBoxes: ShapeBoxes = {
      'circle1': {x: 20, y: 100, w: 100, h: 100},
      'circle2': {x: 200, y: 100, w: 100, h: 50},
      'box1': {x: 20, y: 300, w: 100, h: 100},
      'box2': {x: 200, y: 300, w: 100, h: 50},
      'text1': {x: 20, y: 500, w: 100, h: 100},
      'text2': {x: 200, y: 500, w: 100, h: 50},
    };
    const html = await generateHtmlForOverlayString(input, {x: 0, y: 0, w: 320, h: 500},
      foundElementBoxes);
    //fs.writeFileSync(path.join(__dirname, SNAPSHOTS_DIR_NAME, 'style.html'), html, 'utf-8')
    expect(html).toMatchSnapshot('shapes-style');
  })

});