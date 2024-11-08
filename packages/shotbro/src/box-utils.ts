import type {ShotBroBox} from "./shape/shape-types";

/**
 * data-sb-bb = ShotBro Bounding Box / in css style key:value;...
 * data-sb-bb="x:123;y:456;w:789;h:123;"
 */
export function parseSbBb(sbBb: string): ShotBroBox | undefined {
  const bbMatch = /x:([0-9.]+);y:([0-9.]+);w:([0-9.]+);h:([0-9.]+);/i.exec(sbBb);
  if (!bbMatch) return;
  return {
    x: Number(bbMatch[1]),
    y: Number(bbMatch[2]),
    w: Number(bbMatch[3]),
    h: Number(bbMatch[4])
  }
}

export function stringifySbBb(sbBb: ShotBroBox) {
  return `x:${sbBb.x};y:${sbBb.y};w:${sbBb.w};h:${sbBb.h};`;
}

export function doesSbBbMatch(sbBb1: ShotBroBox, sbBb2: ShotBroBox) {
  return sbBb1.x == sbBb2.x && sbBb1.y == sbBb2.y &&
    sbBb1.w == sbBb2.w && sbBb1.h == sbBb2.h;
}
