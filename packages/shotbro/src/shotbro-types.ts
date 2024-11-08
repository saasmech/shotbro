import {ShotBroShape} from "./shape/shape-types";

export type ShotBroBox = {
    w: number, h: number,
    x: number, y: number,

};

export type ShotBroFocus = {
    at?: string,
    atPos?: ShotBroBox,
    scale?: number,
    scaleX?: number,
    scaleY?: number,
    translate?: number,
    translateX?: number,
    translateY?: number,
};

export type ShotBroInput = {
    shotName: string,
    shapes?: ShotBroShape[],
    focus?: ShotBroFocus
};
