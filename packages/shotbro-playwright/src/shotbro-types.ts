/*

More methods and keys (ide support) is better than complex interpreted strings.  Types will auto complete in
IDEs and are easy to program to.

People need a simple mental model to work from, so stick as close to CSS as we can.

We could use CSS for all property values however units like `rem` or `vw` would have no meaning
as they would be applied to the page that the shapes is drawn on, not the original page.

*/

export type ShotBroLogLevel = 'debug' | 'info' | 'warn';

export type ShotBroBox = { x: number; w: number; y: number; h: number };

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

export type ShotBroOutput = {
  shotAdded: boolean
  shotUrl?: string
  error?: string
}

export type ShotBroOutputConfig = {
  /**
   * The directory to save work files into
   * Default: `<current-directory>/.shotbro/out`
   */
  workingDirectory?: string

  /**
   * Sets the log level.
   * Default: "info"
   */
  logLevel?: ShotBroLogLevel
}

export type ShotBroUploadConfig = {

  testRunUlid: string

  /**
   * The directory to save work files into
   * Default: `<current-directory>/.shotbro/out`
   */
  workingDirectory?: string

  /**
   * The API Key for the app this shot belongs to.
   * If not set then process.env.SHOTBRO_APP_API_KEY will be used.
   */
  appApiKey?: string

  /**
   * Sets the log level.
   * Default: "info"
   */
  logLevel?: ShotBroLogLevel

  /**
   * Base URL for uploads. Should never end with a slash.
   * This can also be set via process.env.SHOTBRO_BASE_URL
   * Default: "https://showbro.io"
   */
  baseUrl?: string

  capturePlatformType?: 'playwright'
  capturePlatformVersion?: string

}

/**
 * Details about the app/website/webapp that the screen shot if of
 * and the browser/os/device that the shot was taken on
 */
export type ShotBroMetadata = {

  /**
   * Tags you want to make available for this shot
   * eg, "enterprise-view", "paid plan only", "public-view"
   */
  shotVersionTags?: string[]

  /**
   * The version of your app when the screenshot was taken.
   * Default: ISO date at the time the test run was started
   * Example: "1.2.3_beta123" or "v1" or "20220302123"
   */
  appVersion?: string

  /**
   * Name of the branch (or channel) of the app the screenshot is of
   * Default: `process.env.GITHUB_HEAD_REF` or "main"
   * Example: "beta", "alpha", "stable", "feature/add-customer-fields"
   */
  appBranch?: string

  /**
   * The name of the platform (operating system & browser) the screenshot was taken on.
   * Default: auto-calculated based on OS and Browser
   * Example: "windows", "macos/safari", "windows/chrome", "linux/firefox"
   */
  appPlatformName?: string

  /**
   * The version of the platform (operating system & browser) the screenshot was taken on.
   * Default: auto-calculated based on OS and Browser
   * Example: "21.3.7", "21.6.0/100.3.2"
   */
  appPlatformVersion?: string

  /**
   * A name for the screensize the screenshot was taken for.
   * Default: `window.innerWidth+'x'+window.innerHeight`
   * Example: "mobile", "desktop", "tablet", "1024x768"
   */
  appScreenSizeName?: string

  /**
   * Language code of the app.  Suggest you use the rfc5646 code. https://datatracker.ietf.org/doc/html/rfc5646
   * Default: auto-calculated based on Browser
   * Example: "fr", "es-ES", "en-US"
   */
  appLang?: string

  /**
   * The theme the app was set to at time of screenshot
   * Default: `window.matchMedia` is used to determine: dark, light or `undefined` (no preference)
   * Example: "dark", "light", "system", "compact", "minimal"
   */
  appTheme?: string

};

/**
 * System generated info sent to the server.  User is not able to override these.  User can override `ShotBroMetadata`.
 */
export type ShotBroSystemInfo = {
  /**
   * Auto generated by the client, used to detect duplicate submissions.
   */
  inputUlid?: string

  /**
   * Auto generated by the client, used to put uploads into a group
   */
  uploadGroupUlid?: string

  /**
   * The version of the app when the screenshot was taken.
   * Default: ISO date at the time the test run was started (eg, 2022-09-11T07:26:43.590Z)
   * Example: "1.2.3_beta123", "v1", "2022-09-11T07:26:43.590Z"
   */
  appVersion?: string

  /**
   * Name of the branch (or channel) the screenshot is for
   * Default: stable
   * Example: "beta", "alpha", "stable", "feature/add-customer-fields"
   */
  appBranch?: string

  /**
   * The name of the platform (operating system) the screenshot was taken on.  Use Node's Platform naming
   * https://nodejs.org/api/os.html#osplatform
   * Default: value returned by `os.platform()`
   * Examples: "darwin", "win32", "linux"
   */
  osPlatform?: string

  /**
   * The version of the platform (operating system) the screenshot was taken on.  Use Node's platform version naming
   * https://nodejs.org/api/os.html#osversion
   * Default: value returned by `os.version()`
   */
  osVersion?: string

  /**
   * Browser type.  Use playwrights naming
   * https://playwright.dev/docs/api/class-browsertype#browser-type-name
   * Examples: "safari", "chrome" (from playwright's: browser.browserType().name)
   */
  browserType?: string

  /**
   * From playwright's: `browser.version()`
   * eg, 100.23.1234
   */
  browserVersion?: string
  browserViewportWidth?: number
  browserViewportHeight?: number
  browserDevicePixelRatio?: number

  /**
   * Browser's: navigator.userAgent
   */
  browserUserAgent?: string

  /**
   * Browser's: window.navigator.language
   */
  browserLanguage?: string

  /**
   * Browser's: prefers-color-scheme, dark, light, default
   * Default: dark, light or null (`window.matchMedia` is used to determine)
   * Example: "dark", "light", "system", "compact", "minimal"
   */
  browserPrefersColorScheme?: string

  capturePlatformType?: 'playwright'
  capturePlatformVersion?: string
};



export type ShotBroCaptureConfig = {
  /**
   * Make sure this is unique within your app (3-120 characters long).  Use kebab-case (eg, cars-n-stuff).
   * Mandatory
   */
  shotStreamCode: string

  /**
   * How to output the shot (optional)
   */
  out?: ShotBroOutputConfig

  /**
   * Metadata about the shot and your app
   */
  metadata?: ShotBroMetadata
}


export type ShotBroInput = {
  /**
   * Make sure this is unique within your app (3-120 characters long).
   * Mandatory
   */
  shotName: string

  /**
   * The area of the page to take the screenshot of.
   * Default: whole page
   */
  focus?: ShotBroFocus

  /**
   * The shapes to draw over the screenshot (optional)
   * Default: none
   */
  shapes?: ShotBroShape[]

  /**
   * How to output the shot (optional)
   */
  out?: ShotBroOutputConfig

  /**
   * Metadata about the shot and your app
   */
  metadata?: ShotBroMetadata
};
