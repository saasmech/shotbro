import {atToLocatorStr, ensureShapesHaveId, locateShapes} from "./shape-locator";
import {ShotBroInput} from "../shotbro-types";

describe('Shape Locator', () => {

  test('Simple Text', async () => {
    const locatorStr = atToLocatorStr({atText: 'Hello World'});
    expect(locatorStr).toBe('text="Hello World"');
  });

  test('Simple ID', async () => {
    const locatorStr = atToLocatorStr({at: '#abc123'});
    expect(locatorStr).toBe('#abc123');
  });

  test('Simple test id', async () => {
    const locatorStr = atToLocatorStr({atTestId: 'abc123'});
    expect(locatorStr).toBe('[data-testid="abc123"]');
  });

  test('Simple test id', async () => {
    const locatorStr = atToLocatorStr({atShape: 'abc123'});
    expect(locatorStr).toBe('[data-shapeid="abc123"]');
  });

  test('Simple test locate shapes', async () => {
    const input: ShotBroInput = {
      shotName: 'test',
      shapes: [
        {circle: {id: 's1', at: "#el1"}}
      ]
    }
    const shotBoxes = await locateShapes(`<html lang="en"><body><div id="el1" data-sb-bb="x:12;y:13;w:14;h:15;"></div></body></html>`, input);
    expect(shotBoxes).toMatchObject({s1: {x: 12, y: 13, w: 14, h: 15}});
  });

  test('Ensure shapes have ids', async () => {
    const input: ShotBroInput = {
      shotName: 'test', shapes: [{circle: {}}]
    }
    await ensureShapesHaveId(input);
    expect(input.shapes).toMatchObject([{circle: {id: '_shape0'}}]);
  });

  test('Ensure ids are not overwritten', async () => {
    const input: ShotBroInput = {
      shotName: 'test', shapes: [{circle: {id: 's1'}}]
    }
    await ensureShapesHaveId(input);
    expect(input.shapes).toMatchObject([{circle: {id: 's1'}}]);
  });

});