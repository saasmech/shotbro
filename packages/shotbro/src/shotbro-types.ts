
import {Property} from 'csstype';

// more methods and keys (ide support) is better than complex strings (no ide auto complete)
// x - nothing / css selector
// at[x|TestId|Text|Locator|Shape]
// at[x|TestId|Text|Locator|Shape]
// at[x|TestId|Text|Locator|Shape]
// at[x|TestId|Text|Locator|Shape]

namespace Property2 {
  export type Scale = string|number
  export type Padding<t> = string|number|t
  export type PaddingTop<t> = string|number|t
  export type PaddingRight<t> = string|number|t
  export type PaddingBottom<t> = string|number|t
  export type PaddingLeft<t> = string|number|t
  export type Translate<t> = string|number|t
  export type Rotate = string|number
  export type Color = string|number
  export type Border = string|number
  export type BorderWidth = string|number
  export type BorderStyle = string|number
  export type BorderColor = string|number
  export type Width<t> = string|number|t
}
/*
people need a simple mental model to work from

tool creates a shape and locates it somewhere

css is used to adjust all other stuffs
margin of the shape - does not work, what is the margin pushing us from?
padding - works
scale - fine but clunky (`transform: scaleX(1.1)`)
transform: rotate(45deg);
transform: translate(12px, 10px);
 */

export type Length = (string & {}) | 0 | number

export type CommonProps = {
  id?: string // shape id
  color?: Property.Color
}

export type ShotBox = { x: number; width: number; y: number; height: number };


export type PositionProps = {

  /**
   * CSS style selector (eg, #abc123 or .btn-primary)
   */
  at?: string

  /**
   * The exact position and size in pixels relative to the top left of the viewport.
   */
  atPos?: ShotBox

  /**
   * The value for a `data-testid` attribute (eg, specifying X will translate to CSS selector: `[data-testid=X]`)
   */
  atTestId?: string

  /**
   * Searches for text on screen
   */
  atText?: string

  /**
   * The id of another shape
   */
  atShape?: string
}

export type ShotBroOutputConfig = {
  file?: string
}

export type PaddingProps = {
  padding?: Property.Padding<Length>
  // paddingTop?: Property.PaddingTop<Length>
  // paddingRight?: Property.PaddingRight<Length>
  // paddingBottom?: Property.PaddingBottom<Length>
  // paddingLeft?: Property.PaddingLeft<Length>
}

export type TransformProps = {
  scale?: Property.Scale | Property.Scale[]
  // scaleX?: Property.Scale
  // scaleY?: Property.Scale
  translate?: Property.Translate<Length> | Property.Translate<Length>[]
  // translateX?: Property.Translate<Length>
  // translateY?: Property.Translate<Length>
  rotate?: Property.Rotate
}


export type CircleProps = {
  thickness?: number
  margin?: number

} & CommonProps & PositionProps & TransformProps & PaddingProps

export type ArrowProps = {
  thickness?: number
  length?: number
  alignTipTo?: 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left'
} & CommonProps & PositionProps & TransformProps

export type BoxProps = {
  margin?: number
  thickness?: number
} & CommonProps & PositionProps & TransformProps

export type TextProps = {
  value?: string
  fontSize?: Property.FontSize
} & CommonProps & PositionProps & TransformProps & PaddingProps

export type Shape = {
  circle?: CircleProps
  arrow?: ArrowProps
  box?: BoxProps
  text?: TextProps
}

export type ShotBroResult = {
  shotId: string
}
export type ShotBroInput = {
  shapes?: Shape[]
  scale?: number | [number, number]
  translate?: number | [number, number]
} & PositionProps;