
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

export type ShotBox = { x: number; w: number; y: number; h: number };


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
  /**
   * Make sure this is unique within your app
   */
  shotName: string

  shapes?: Shape[]
  scale?: number | [number, number]
  translate?: number | [number, number]

  out?: ShotBroOutputConfig
  metadata?: ShotBroMetadata
} & PositionProps;


export type ShotBroOutputConfig = {
  file?: string

  /**
   * Base URL for uploads. Should never end with a slash.
   * This can also be set via process.env.
   * Default: "https://showbro.io"
   */
  baseUrl?: string

  /**
   * If not set process.env.SHOTBRO_APP_API_KEY will be used.
   * Required
   */
  appApiKey?: string

  /**
   * When set to true will display debug info.
   * Default: false
   */
  debug?: boolean
}

export type ShotBroMetadata = {
  /**
   * Details about the app/website/webapp that the screen shot if of
   */
  app?: {
    /**
     * eg, 1.2.3_beta123
     */
    appVersion?: string
  },

  /**
   * Details about the browser/os/device that the shot was taken on
   */
  device?: {
    /**
     * node's os.platform()
     * https://nodejs.org/api/os.html#osplatform
     */
    osPlatform?: string

    /**
     * node's os.version()
     * https://nodejs.org/api/os.html#osversion
     */
    osVersion?: string

    /**
     * eg, safari|chrome| from playwright's: browser.browserType().name
     * https://playwright.dev/docs/api/class-browsertype#browser-type-name
     */
    browserType?: string

    /**
     * From playwright's: browser.version()
     * eg, 100.23.1234
     */
    browserVersion?: string

    /**
     * Browser's: Window.innerWidth
     */
    browserViewportWidth?: number

    /**
     * Browser's: Window.innerHeight
     */
    browserViewportHeight?: number

    /**
     * Browser's: navigator.userAgent
     */
    browserUserAgent?: string

    /**
     * Browser's: window.navigator.language.split('-')[0]
     */
    browserLangPrimary?: string

    /**
     * Browser's: window.navigator.language.split('-')[1]
     */
    browserLangSecondary?: string

    /**
     * Browser's: prefers-color-scheme, dark, light, default
     * https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
     * let scheme = undefined
     * if (window.matchMedia?('(prefers-color-scheme: light)').matches) scheme = 'light'
     * if (window.matchMedia?('(prefers-color-scheme: dark)').matches) scheme = 'dark'
     */
    browserPrefersColorScheme?: string

    // later: keys you would use for a ios|android|windows app screenshot
    // deviceLocale: z.string(),
    // deviceName: z.string(),
    // deviceVersion: z.string(),
  }
};