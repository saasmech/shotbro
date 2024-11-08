
import {doesSbBbMatch, parseSbBb, stringifySbBb} from "../box-utils";

describe('sb-bb-converter', () => {

    test('nothing returns nothing', async () => {
      expect(parseSbBb('')).toBeUndefined();
    });

    test('easy', async () => {
      expect(parseSbBb('x:12;y:34;w:56;h:78;'))
        .toMatchObject({x: 12, y: 34, w: 56, h: 78});
    });

    test('decimal', async () => {
      expect(parseSbBb('x:1.2;y:.34;w:56.0;h:78.333333;'))
        .toMatchObject({x: 1.2, y: .34, w: 56.0, h: 78.333333});
    });

    test('stringify', async () => {
      expect(stringifySbBb({x: 123.23, y:456.45, w: 9876.32, h: 32}))
        .toBe('x:123.23;y:456.45;w:9876.32;h:32;');
    });

    test('matches', async () => {
      expect(doesSbBbMatch(
        {x: 123.23, y:456.45, w: 9876.32, h: 32},
        {x: 123.23, y:456.45, w: 9876.32, h: 32},
        )).toBe(true);
    });

    test('does not match', async () => {
      expect(doesSbBbMatch(
        {x: 9123.23, y:456.45, w: 9876.32, h: 32},
        {x: 123.23, y:456.45, w: 9876.32, h: 32},
        )).toBe(false);
    });

});