import type {Page, TestInfo} from '@playwright/test';
import {PW_TEST_INFO_ANNOTATION_KEY} from './reporter'

import type {ShotBroLogLevel, ShotBroOutput, ShotBroSystemInfo} from './shotbro-types';
import {ShotBroCaptureConfig} from "./shotbro-types";

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {findPositions, generateMainScreenshot} from './main-shot/main-screenshot';
import {CliLog} from './util/log';
import {ulid} from './util/ulid';
import {ShotBroInput} from "./annotate/annotate-types";
import {shotBroPlaywrightAnnotate} from "./annotate/annotate";
import {cleanupDir, prepareDir} from "./util/fs";


function prepareCaptureConfig(rawInput: ShotBroCaptureConfig): ShotBroCaptureConfig {
    let input: ShotBroCaptureConfig;
    try {
        // make a copy of the original, so we don't screw it up in any way
        // (use most portable way to do this)
        input = JSON.parse(JSON.stringify(rawInput)) as ShotBroCaptureConfig;
    } catch (e) {
        console.error('Could not copy input', rawInput)
        throw e;
    }
    if (!input.streamCode || input.streamCode.length < 3) {
        throw new Error('shotName must be at least 3 characters')
    }
    if (input.streamCode.length > 120) {
        throw new Error('shotName must be less or equal to than 120 characters')
    }
    return input;
}

export async function playwrightPrepareSystemInfo(page: Page, log: CliLog): Promise<ShotBroSystemInfo> {
    const browserInfo = await page.evaluate(async () => {
        let scheme = undefined
        // @ts-ignore
        if (window.matchMedia('(prefers-color-scheme: light)').matches) scheme = 'light'
        // @ts-ignore
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) scheme = 'dark'

        // https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API
        // @ts-ignore
        let userAgentData = navigator?.userAgentData;
        let browserVersion = userAgentData?.brands[0]?.version;
        let browserBrand = userAgentData?.brands[0]?.brand;
        let browserPlatform = userAgentData?.platform;
        return {
            infoPlatform: browserPlatform,
            infoBrand: browserBrand,
            infoVersion: browserVersion,
            // @ts-ignore
            infoLanguage: navigator.language,
            // @ts-ignore
            infoUserAgent: navigator.userAgent,
            // @ts-ignore
            infoViewportWidth: window.innerWidth,
            // @ts-ignore
            infoViewportHeight: window.innerHeight,
            infoColorScheme: scheme,
            // @ts-ignore
            infoDevicePixelRatio: window.devicePixelRatio
        };
    });
    log.debug(`browserInfo ${JSON.stringify(browserInfo)}`)
    const systemInfo: ShotBroSystemInfo = {
        inputUlid: `iu-${ulid()}`,
        osPlatform: browserInfo.infoPlatform || os.platform(),
        osVersion: os.release(),
        browserType: browserInfo.infoBrand || page.context().browser()?.browserType()?.name(),
        browserVersion: browserInfo.infoVersion || page.context().browser()?.version(),
        browserUserAgent: browserInfo.infoUserAgent,
        browserLanguage: browserInfo.infoLanguage,
        browserViewportWidth: browserInfo.infoViewportWidth,
        browserViewportHeight: browserInfo.infoViewportHeight,
        browserPrefersColorScheme: browserInfo.infoColorScheme,
        browserDevicePixelRatio: browserInfo.infoDevicePixelRatio,
        capturePlatformType: 'playwright',
        capturePlatformVersion: '0.0.0', // overwritten later by uploader and reporter
    };
    log.debug(`systemInfo ${JSON.stringify(systemInfo)}`)
    return systemInfo;
}

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param page Playwright page that you want to screenshot
 * @param testInfo Playwright testInfo
 * @param inputCaptureConfig
 * @param input
 */
export async function shotBroPlaywright(
    page: Page, testInfo: TestInfo, inputCaptureConfig: ShotBroCaptureConfig, input?: ShotBroInput
): Promise<ShotBroOutput> {
    let outDir = path.join('shotbro-results');
    let logLevel: ShotBroLogLevel = 'info';
    let bundledAssetsPath = path.join('node_modules', 'shotbro-playwright', 'dist', 'bundled');

    // if reporter.ts is used need to record info in annotations
    // testInfo.annotations.forEach((a) => {
    //     if (!a.description) return;
    //     if (a.type === PW_TEST_INFO_OUT_DIR_KEY) outDir = a.description as string;
    //     if (a.type === PW_TEST_INFO_LOG_LEVEL_KEY) logLevel = a.description as ShotBroLogLevel;
    // });

    if (inputCaptureConfig.logLevel) logLevel = inputCaptureConfig.logLevel;
    if (inputCaptureConfig.outDir) outDir = inputCaptureConfig.outDir;
    if (inputCaptureConfig.bundledAssetsPath) bundledAssetsPath = inputCaptureConfig.bundledAssetsPath;

    let bundledAssetsUrl = `file://${path.resolve(bundledAssetsPath)}`;
    const log = new CliLog(logLevel);
    const captureConfig = prepareCaptureConfig(inputCaptureConfig);
    const systemInfo = await playwrightPrepareSystemInfo(page, log);

    if (testInfo?.annotations?.push) {
        testInfo.annotations.push({type: PW_TEST_INFO_ANNOTATION_KEY, description: systemInfo.inputUlid});
    } else {
        log.warn('Unable to store inputUlid in testInfo annotations.');
    }

    let output: ShotBroOutput = {
        shotAdded: false,
    };
    let cleanOutDir = false;
    try {
        if (cleanOutDir) await cleanupDir(log, outDir)

        log.debug(`Prepare output dir ${outDir}`)
        outDir = await prepareDir(log, outDir);
        let mainPngName = `${systemInfo.inputUlid}.png`;
        let mainPngPath = path.join(outDir, mainPngName);
        log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)

        await generateMainScreenshot(page, mainPngPath);

        if (input) {
            let focusPngDir = path.join(outDir, inputCaptureConfig.streamCode);
            let focusPngPath = path.join(focusPngDir, `${input.shotName}.png`);
            await prepareDir(log, focusPngDir);
            let inputPositions = await findPositions(log, page, input);
            let htmlPath = path.join(outDir, `${systemInfo.inputUlid}-focus.html`);
            log.debug(`Focus png be saved locally to ${focusPngPath}`);
            await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, bundledAssetsUrl, false);
            if (`${logLevel}` !== 'debug') {
                await fs.rm(htmlPath);
                await fs.rm(mainPngPath);
            }
        }

        // MAYBE: generate markdown doc of screenshots appended to for each test run
    } catch (e) {
        output.error = String(e)
        log.warn(`Could not capture ${captureConfig.streamCode}: ${e}`)
    }
    return output
}

// TODO: only needed when uploading is supported
// noinspection JSUnusedGlobalSymbols
// export default ShotBroPlaywrightReporter;

export type {
    ShotBroCaptureConfig,
    ShotBroOutput,
    ShotBroSystemInfo,
    ShotBroReporterConfig,
    ShotBroLogLevel,
    ShotBroMetadata,
} from './shotbro-types';
