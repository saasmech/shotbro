import {ShotBroBox} from "../annotate-types";

export type ShapeCommon = {
    /**
     * ID of the shape
     */
    id?: string

    /**
     * Any valid CSS color.
     * Example: "#ff0000", "red", "rgb(255, 0, 153)", "rgba(51, 170, 51, .1)"
     */
    color?: string
}

export type ShapePosition = {

    /**
     * CSS style selector (eg, #abc123 or .btn-primary)
     */
    at?: string

    /**
     * The exact position and size in pixels relative to the top left of the viewport.
     */
    atPos?: ShotBroBox

    /**
     * The value for a `data-testid` attribute (syntactic sugar for CSS selector: `[data-testid=X]`)
     */
    atTestId?: string

    /**
     * Searches for text on screen
     */
    atText?: string

    // MAYBE: The id of another shape
    // note, creates a circular dependency loop that needs to be resolved
    // atShape?: string
}

export type ShapeTransform = {
    /**
     * Number of pixels to shift the shape by in both X and Y axis (can be negative)
     * Example: 22
     */
    translate?: number

    /**
     * Number of pixels to shift the shape by in the X axis (can be negative)
     * Example: 22
     */
    translateX?: number

    /**
     * Number of pixels to shift the shape by in the Y axis (can be negative)
     * Example: 22
     */
    translateY?: number

    // MAYBE: scale
    // * Number from 0-1, 0.5 will scale by half/50%
    // * Example: 0.5
    // scale?: number
    // scaleX?: number
    // scaleY?: number
}

export type CircleShape = {
    thickness?: number
} & ShapeCommon & ShapeTransform

export type BoxShape = {
    thickness?: number
} & ShapeCommon & ShapeTransform

export type RelativePosition = 'top-left' | 'top' | 'top-right'
    | 'right'
    | 'bottom-right' | 'bottom' | 'bottom-left'
    | 'left'
    | 'center';

export type IconShape = {
    name?: string
    size?: number
    position?: RelativePosition
    class?: string
} & ShapeCommon & ShapeTransform

export type ShotBroShape = {
    circle?: CircleShape
    box?: BoxShape
    icon?: IconShape
    // MAYBE: line
    // MAYBE: redact, same as box but with preset with fill black
    // note, tried to implement arrow, very hard to render, use icon instead
    // note, tried to implement text, way to many render options, use icon or do own text outside screenshot
}
