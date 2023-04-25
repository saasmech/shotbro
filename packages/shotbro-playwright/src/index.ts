import type {Page} from '@playwright/test';

import type {
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroUploadConfig
} from './shotbro-types';

import * as fs from 'fs';
import * as readline from 'readline';
import * as os from 'os';
import * as path from 'path';
import {uploadToApi} from './uploader';
import {generateMainScreenshot} from './main-shot/main-screenshotter';
import {CliLog} from './util/log';
import {ulid} from './util/ulid';
import {ShotBroCaptureConfig} from "./shotbro-types";

// use date at start, so it will be the same for all invocations while node is running
const ISO_DATE_AT_START = new Date().toISOString();

function prepareUploadConfig(uploadConfig: ShotBroUploadConfig): ShotBroUploadConfig {
  if (!uploadConfig) uploadConfig = {}
  if (!uploadConfig.appApiKey) uploadConfig.appApiKey = process.env.SHOTBRO_APP_API_KEY;
  if (!uploadConfig.baseUrl) uploadConfig.baseUrl = process.env.SHOTBRO_BASE_URL;
  if (!uploadConfig.baseUrl) uploadConfig.baseUrl = 'https://shotbro.io';
  if (!uploadConfig.workingDirectory) uploadConfig.workingDirectory = '.shotbro/out';
  return uploadConfig;

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
  if (!input.out) input.out = {}
  if (!input.out.workingDirectory) input.out.workingDirectory = '.shotbro/out';
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
 * @param inputCaptureConfig
 * @param uploadConfig false=disable upload, or a ShotBroUploadConfig
 */
export async function shotBroPlaywright(
  page: Page, inputCaptureConfig: ShotBroCaptureConfig,
  uploadConfig?: ShotBroUploadConfig|false): Promise<ShotBroOutput> {

  const log = new CliLog(inputCaptureConfig.out?.logLevel || 'info');
  const captureConfig = prepareCaptureConfig(inputCaptureConfig);
  const uploadGroupUlid = ulid();
  const systemInfo = await playwrightPrepareSystemInfo(page, log, uploadGroupUlid);

  let outDir = captureConfig.out!.workingDirectory!;
  let output: ShotBroOutput = {
    shotAdded: false,
  };
  let cleanOutDir = true;
  try {
    if (cleanOutDir) cleanupOutDir(outDir)

    log.debug(`Prepare output dir ${outDir}`)
    outDir = prepareOutDir(outDir);
    let indexJsonLPath = path.join(outDir, 'index.jsonl');
    let mainPngPath = path.join(outDir, `${systemInfo.inputUlid}.png`);
    let elPosJsonPath = path.join(outDir, `${systemInfo.inputUlid}.json`);
    log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
    log.debug(`  JSON be saved locally to ${elPosJsonPath}`)
    await generateMainScreenshot(page, elPosJsonPath, mainPngPath);
    fs.writeFileSync(path.join(outDir, `${systemInfo.inputUlid}.json`), JSON.stringify({
      captureConfig, systemInfo
    }), 'utf-8');

    const lineObj: IndexLineObj = {inputUlid: systemInfo.inputUlid!}
    if (!fs.existsSync(indexJsonLPath)) fs.writeFileSync(indexJsonLPath, '', 'utf-8')
    fs.appendFileSync(indexJsonLPath, JSON.stringify(lineObj), 'utf-8');
    fs.appendFileSync(indexJsonLPath, '\n', 'utf-8');

    // TODO: generate markdown doc of screenshots appended to for each test run
  } catch (e) {
    output.error = String(e)
    log.warn(`Could not capture ${captureConfig.shotStreamCode}: ${e}`)
  }
  return output
}

type IndexLineObj = {
  inputUlid: string
}

// TODO: is this needed anymore?
// noinspection JSUnusedGlobalSymbols
export async function shotBroUpload(uploadConfig: ShotBroUploadConfig): Promise<ShotBroOutput[]> {
  const log = new CliLog(uploadConfig.logLevel || 'info');
  const preparedUploadConfig = prepareUploadConfig(uploadConfig)
  let outDir = preparedUploadConfig!.workingDirectory!;
  let indexJsonLPath = path.join(outDir, 'index.jsonl');
  const fileStream = fs.createReadStream(indexJsonLPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity    // recognize all instances of CR LF ('\r\n') in input.txt as a single line break
  });
  const outputs = [];
  for await (const line of rl) {
    const lineObj = JSON.parse(line) as IndexLineObj;
    const mainJson = JSON.parse(fs.readFileSync(path.join(outDir, `${lineObj.inputUlid}.json`)).toString('utf-8'))
    let mainPngPath = path.join(outDir, `${lineObj.inputUlid}.png`);
    let elPosJsonPath = path.join(outDir, `${lineObj.inputUlid}.json`);
    let systemInfo: ShotBroSystemInfo = mainJson.systemInfo as ShotBroSystemInfo;
    let captureConfig: ShotBroCaptureConfig = mainJson.captureConfig as ShotBroCaptureConfig;
    if (!captureConfig.metadata) captureConfig.metadata = {};
    captureConfig.metadata.appVersion = ISO_DATE_AT_START;
    systemInfo.capturePlatformType = preparedUploadConfig.capturePlatformType;
    systemInfo.capturePlatformVersion = preparedUploadConfig.capturePlatformVersion;
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

// types
export type {
  ShotBroCaptureConfig,
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroUploadConfig,
  ShotBroLogLevel,
  ShotBroOutputConfig,
  ShotBroMetadata,
} from './shotbro-types';
