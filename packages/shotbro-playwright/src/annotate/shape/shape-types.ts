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

  /**
   * The id of another shape
   * TODO: creates a circular dependency loop that needs to be resolved
   */
  // atShape?: string
}


// todo export type ShapePadding = {
//   padding?: number
//   paddingTop?: number
//   paddingRight?: number
//   paddingBottom?: number
//   paddingLeft?: number
// }

export type ShapeTransform = {
  /**
   * Number from 0-1, 0.5 will scale by half/50%
   * Example: 0.5
   */
  // scale?: number
  // scaleX?: number
  // scaleY?: number

  /**
   * Number of pixels to shift the shape by in both X and Y axis (can be negative)
   * Example: 22
   */
  translate?: number
  translateX?: number
  translateY?: number

  /**
   * Number of degrees to rotate the shape by (must be <360, can be negative).
   * Example: 90, 180
   */
  // rotate?: number
}

export type CircleShape = {
  thickness?: number
  //margin?: number

} & ShapeCommon & ShapePosition & ShapeTransform //& ShapePadding

export type ArrowShape = {
  thickness?: number
  length?: number
  rotate?: number
  alignTipTo?: 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left'
} & ShapeCommon & ShapePosition & ShapeTransform

export type BoxShape = {
  thickness?: number
} & ShapeCommon & ShapePosition & ShapeTransform //& ShapePadding

export type TextShape = {
  value?: string
  fontSize?: number
} & ShapeCommon & ShapePosition & ShapeTransform //& ShapePadding

export type ShotBroShape = {
  circle?: CircleShape
  box?: BoxShape
  text?: TextShape
  // todo line?: LineShape
  arrow?: ArrowShape
  // todo redact?: RedactShape
}