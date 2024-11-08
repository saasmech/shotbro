import * as path from "path";
import {calculateFocusBox, applyFocusBoxAdjustments} from "./focus-box";
import {JSDOM} from "jsdom";
import * as fs from "fs";
import * as jsdom from "jsdom";

describe('Focus Box', () => {

  describe('Box Calculations', () => {

    test('when default used, box should match whole page', async () => {
      const htmlFilePath = path.join(__dirname, 'test', 'boxes-sb-bb.html')
      const virtualConsole = new jsdom.VirtualConsole();
      virtualConsole.sendTo(console);
      const dom = new JSDOM(fs.readFileSync(htmlFilePath, 'utf-8'), {
        virtualConsole
      });
      const box = await calculateFocusBox(dom, {shotName: 'hi'});
      expect(box).toMatchObject({x: 0, y: 0, w: 320, h: 888});
    })

    test('when specific id used, box should match element', async () => {
      const htmlFilePath = path.join(__dirname, 'test', 'boxes-sb-bb.html')
      const virtualConsole = new jsdom.VirtualConsole();
      virtualConsole.sendTo(console);
      const dom = new JSDOM(fs.readFileSync(htmlFilePath, 'utf-8'), {
        virtualConsole
      });
      const box = await calculateFocusBox(dom, {shotName: 'hi', focus: {at: '#box1'}});
      expect(box).toMatchObject({x: 34, y: 34, w: 50, h: 50});
    })

    test('when scale is default box should be same', async () => {
      const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {});
      expect(box).toMatchObject({x: 10, y: 20, w: 320, h: 1632});
    })

    test('when scale used box should grow', async () => {
      const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scale: 2});
      expect(box).toMatchObject({x: 10, y: 20, w: 640, h: 3264});
    })

    test('when scaleX used box should grow', async () => {
      const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scaleX: 2});
      expect(box).toMatchObject({x: 10, y: 20, w: 640, h: 1632});
    })

    test('when translate used box should move', async () => {
      const box = await applyFocusBoxAdjustments({x: 10, y: 20, w: 320, h: 1632}, {scale: 1, translate: 12});
      expect(box).toMatchObject({x: 22, y: 32, w: 320, h: 1632});
    })
  })


});