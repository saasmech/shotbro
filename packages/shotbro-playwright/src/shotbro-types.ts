/*

More methods and keys (ide support) is better than complex interpreted strings.

Types will auto complete in IDEs and are easy to program to.

People need a simple mental model to work from, so stick as close to CSS as we can.

We could use CSS for all property values however units like `rem` or `vw` would have no meaning
as they would be applied to the page that the shapes is drawn on, not the original page.

*/

export type ShotBroLogLevel = 'debug' | 'info' | 'warn';

export type ShotBroOutput = {
    shotAdded: boolean
    shotUrl?: string
    error?: string
}

export type ShotBroReporterConfig = {

    /**
     * The directory to save work files into
     * Default: `<current-directory>/.shotbro/out`
     */
    workingDirectory?: string

    /**
     * The API Key for the app this shot belongs to.
     * If not set then `process.env.SHOTBRO_APP_API_KEY` will be used.
     */
    appApiKey?: string

    /**
     * Sets the log level.
     * Options: info, debug, warn.
     * Default: "info"
     */
    logLevel?: ShotBroLogLevel

    /**
     * Base URL for uploads. Should never end with a slash.
     * This can also be set via process.env.SHOTBRO_BASE_URL
     * Default: "https://showbro.io"
     */
    baseUrl?: string

    /**
     * Branch name for the test run.
     * If not set will default to `process.env.GITHUB_REF_NAME` or 'main'.
     * Default: "main"
     */
    branchName?: string,

    /**
     * Name of the build the test run is for.
     * If not set will default to `process.env.GITHUB_RUN_NUMBER` or a sequential number.
     * Default: a sequential number
     */
    buildName?: string,
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

    // same for whole test run
    capturePlatformType?: 'playwright'
    capturePlatformVersion?: string
    branchName?: string
    buildName?: string
};

export type ShotBroCaptureConfig = {
    /**
     * The code for the stream you want this shot to be part of. (3-120 characters long).
     * Suggest using Use dot separated kebab-case (eg, main.user-account.settings.server).
     * Mandatory.
     */
    streamCode: string

    /**
     * Metadata about the shot and your app
     */
    //metadata?: ShotBroMetadata
}
