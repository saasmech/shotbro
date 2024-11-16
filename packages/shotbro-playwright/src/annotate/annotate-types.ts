import {ShapePosition, ShotBroShape} from "../shape/shape-types";

export type ShotBroBox = {
    w: number, h: number,
    x: number, y: number,
};

export type ShotBroFocus = {

    /**
     * CSS style selector (eg, #abc123 or .btn-primary)
     */
    at?: string

    /**
     * The exact position and size in pixels relative to the top left of the viewport.
     */
    atPos?: ShotBroBox

    /**
     * The value for a `data-testid` attribute (eg, specifying X will translate to CSS selector: `[data-testid=X]`)
     */
    atTestId?: string

    /**
     * Searches for text on screen
     */
    atText?: string

    /**
     * Number from 0-1, 0.5 will scale by half/50%.  Scales both X and Y.
     * Example: 0.5
     * Default: 1.1
     */
    scale?: number
    scaleX?: number
    scaleY?: number

    /**
     * Move the focus box (in pixels) on both axis (x and y).  Can be negative.
     * Default: 0
     */
    translate?: number
    translateX?: number
    translateY?: number
}

export type ShotBroShapeInput = ShapePosition & ShotBroShape;

export type ShotBroInput = {
    shotName: string,
    shapes?: ShotBroShapeInput[],
    focus?: ShotBroFocus
};
