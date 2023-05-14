import type {Page, TestInfo} from '@playwright/test';
import type {FullConfig, FullResult, Reporter, Suite, TestCase, TestResult} from '@playwright/test/reporter';

import type {
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroReporterConfig, ShotBroLogLevel
} from './shotbro-types';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {uploadToApi} from './uploader';
import {generateMainScreenshot} from './main-shot/main-screenshotter';
import {CliLog} from './util/log';
import {ulid} from './util/ulid';
import {ShotBroCaptureConfig} from "./shotbro-types";

// use date at start, so it will be the same for all invocations while node is running
const ISO_DATE_AT_START = new Date().toISOString();
const PW_TEST_INFO_ANNOTATION_KEY = 'shotbro-input-ulid';
const PW_TEST_INFO_WORKING_DIR_KEY = 'shotbro-working-dir';
const PW_TEST_INFO_LOG_LEVEL_KEY = 'shotbro-log-level';

function prepareReporterConfig(config: ShotBroReporterConfig): ShotBroReporterConfig {
  if (!config) config = {}
  if (!config.appApiKey) config.appApiKey = process.env.SHOTBRO_APP_API_KEY;
  if (!config.baseUrl) config.baseUrl = process.env.SHOTBRO_BASE_URL;
  if (!config.baseUrl) config.baseUrl = 'https://shotbro.io';
  if (!config.workingDirectory) config.workingDirectory = '.shotbro/out';
  if (!config.logLevel) config.logLevel = 'info';
  return config;
}

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
  if (!input.shotStreamCode || input.shotStreamCode.length < 3) {
    throw new Error('shotName must be at least 3 characters')
  }
  if (input.shotStreamCode.length > 120) {
    throw new Error('shotName must be less than 120 characters')
  }
  return input;
}

export async function playwrightPrepareSystemInfo(page: Page, log: CliLog, uploadGroupUlid: string): Promise<ShotBroSystemInfo> {
  const browserInfo = await page.evaluate(async () => {
    let scheme = undefined
    if (window.matchMedia('(prefers-color-scheme: light)').matches) scheme = 'light'
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
      infoLanguage: navigator.language,
      infoUserAgent: navigator.userAgent,
      infoViewportWidth: window.innerWidth,
      infoViewportHeight: window.innerHeight,
      infoColorScheme: scheme,
      infoDevicePixelRatio: window.devicePixelRatio
    };
  });
  log.debug(`browserInfo ${JSON.stringify(browserInfo)}`)
  const systemInfo: ShotBroSystemInfo = {
    inputUlid: `iu:${ulid()}`,
    uploadGroupUlid: `ug:${uploadGroupUlid}`,
    appVersion: ISO_DATE_AT_START,
    // if running on GitHub actions use something sensible.  If undefined the server can decide.
    appBranch: process.env.GITHUB_HEAD_REF,
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


function prepareOutDir(outDir: string) {
  if (!outDir) {
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ShotBro'));
  } else {
    fs.mkdirSync(outDir, {recursive: true});
  }
  return path.resolve(outDir);
}

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param page Playwright page that you want to screenshot
 * @param testInfo Playwright testInfo
 * @param inputCaptureConfig
 */
export async function shotBroPlaywright(
  page: Page, testInfo: TestInfo, inputCaptureConfig: ShotBroCaptureConfig
): Promise<ShotBroOutput> {

  let outDir = '.shotbro/out';
  let logLevel : ShotBroLogLevel = 'info';
  testInfo.annotations.forEach((a) => {
    if (a.type === PW_TEST_INFO_WORKING_DIR_KEY) outDir = a.description as string;
    if (a.type === PW_TEST_INFO_LOG_LEVEL_KEY) logLevel = a.description as ShotBroLogLevel;
  });


  const uploadGroupUlid = ulid();
  const log = new CliLog(logLevel);
  const captureConfig = prepareCaptureConfig(inputCaptureConfig);
  const systemInfo = await playwrightPrepareSystemInfo(page, log, uploadGroupUlid);

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
    if (cleanOutDir) cleanupOutDir(outDir)

    log.debug(`Prepare output dir ${outDir}`)
    outDir = prepareOutDir(outDir);
    let mainPngPath = path.join(outDir, `${systemInfo.inputUlid}.png`);
    let elPosJsonPath = path.join(outDir, `${systemInfo.inputUlid}.json`);
    log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
    log.debug(`  JSON be saved locally to ${elPosJsonPath}`)
    await generateMainScreenshot(page, elPosJsonPath, mainPngPath);
    fs.writeFileSync(path.join(outDir, `${systemInfo.inputUlid}.json`), JSON.stringify({
      captureConfig, systemInfo
    }), 'utf-8');


    // TODO: generate markdown doc of screenshots appended to for each test run
  } catch (e) {
    output.error = String(e)
    log.warn(`Could not capture ${captureConfig.shotStreamCode}: ${e}`)
  }
  return output
}

// noinspection JSUnusedGlobalSymbols
async function shotBroUpload(uploadConfig: ShotBroReporterConfig, inputUlids: string[], log: CliLog,
                             capturePlatformVersion: string): Promise<ShotBroOutput[]> {
  const preparedUploadConfig = prepareReporterConfig(uploadConfig)
  let outDir = preparedUploadConfig!.workingDirectory!;

  const outputs = [];
  for await (const inputUlid of inputUlids) {
    log.debug(`ShotBro: Processing`, inputUlid);
    const mainJson = JSON.parse(fs.readFileSync(path.join(outDir, `${inputUlid}.json`)).toString('utf-8'))
    let mainPngPath = path.join(outDir, `${inputUlid}.png`);
    let elPosJsonPath = path.join(outDir, `${inputUlid}.json`);
    let systemInfo: ShotBroSystemInfo = mainJson.systemInfo as ShotBroSystemInfo;
    systemInfo.capturePlatformVersion = capturePlatformVersion;
    let captureConfig: ShotBroCaptureConfig = mainJson.captureConfig as ShotBroCaptureConfig;
    if (!captureConfig.metadata) captureConfig.metadata = {};
    captureConfig.metadata.appVersion = ISO_DATE_AT_START;
    const output = await uploadToApi(preparedUploadConfig, captureConfig, elPosJsonPath, mainPngPath, systemInfo, log);
    outputs.push(output);
  }
  return outputs;
}

function cleanupOutDir(outDir: string) {
  try {
    if (outDir) fs.rmSync(outDir, {recursive: true});
  } catch (e) {
    console.error(`An error has occurred while cleaning up ${outDir}. Error: ${e}`);
  }
}

class ShotBroPlaywrightReporter implements Reporter {
  private readonly options: ShotBroReporterConfig;
  private readonly log: CliLog;
  private testRunUlid?: string;
  private inputUlids: string[] = [];
  private capturePlatformVersion?: string

  constructor(options: ShotBroReporterConfig) {
    this.options = prepareReporterConfig(options);
    this.log = new CliLog(this.options.logLevel || 'info');
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.capturePlatformVersion = config.version;
    this.testRunUlid = ulid();
    this.log.info(`ShotBro: begin`, this.testRunUlid);
    this.log.debug(`ShotBro: configured for`, {
      baseUrl: this.options.baseUrl,
      workingDirectory: this.options.workingDirectory,
      logLevel: this.options.logLevel,
    });

  }

  onTestBegin(test: TestCase, result: TestResult) {
    test.annotations.push({type: PW_TEST_INFO_WORKING_DIR_KEY, description: this.options.workingDirectory!});
    test.annotations.push({type: PW_TEST_INFO_LOG_LEVEL_KEY, description: this.options.logLevel!});
  }

  onTestEnd(test: TestCase, result: TestResult) {
    result.attachments;
    test.annotations.forEach((a) => {
      if (a.type === PW_TEST_INFO_ANNOTATION_KEY) {
        this.log.debug('ShotBro: add shot', a.description);
        this.inputUlids.push(a.description as string);
      }
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    this.log.info(`ShotBro: Test run finished with status: ${result.status}`);
    this.log.debug(`ShotBro: ulids for upload`, this.inputUlids);
    if (result.status === 'passed') {
      this.log.info(`ShotBro: Starting uploads`);
      await shotBroUpload(this.options, this.inputUlids, this.log, this.capturePlatformVersion!);
      this.log.info(`ShotBro: Completed`, this.testRunUlid);
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default ShotBroPlaywrightReporter;


export type {
  ShotBroCaptureConfig,
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroReporterConfig,
  ShotBroLogLevel,
  ShotBroMetadata,
} from './shotbro-types';
