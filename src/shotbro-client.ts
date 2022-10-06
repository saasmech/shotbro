import type {Page} from '@playwright/test';
import type {
  ShotBroInput,
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

function prepareConfig(rawInput: ShotBroInput): ShotBroInput {
  let input: ShotBroInput;
  try {
    // make a copy of the original, so we don't screw it up in any way
    // (use most portable way to do this)
    input = JSON.parse(JSON.stringify(rawInput)) as ShotBroInput;
  } catch (e) {
    console.error('Could not copy input', rawInput)
    throw e;
  }
  if (!input.shotName || input.shotName.length < 3) {
    throw new Error('shotName must be at least 3 characters')
  }
  if (input.shotName.length > 120) {
    throw new Error('shotName must be less than 120 characters')
  }
  if (!input.out) input.out = {}
  if (!input.out.workingDirectory) input.out.workingDirectory = '.shotbro/out';
  return input;
}

export async function prepareSystemInfo(page: Page, log: CliLog): Promise<ShotBroSystemInfo> {
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
 * @param shotBroInput
 */
export async function shotBroPlaywright(page: Page, shotBroInput: ShotBroInput): Promise<ShotBroOutput> {
  const log = new CliLog(shotBroInput.out?.logLevel || 'info');
  const input = prepareConfig(shotBroInput);
  const systemInfo = await prepareSystemInfo(page, log);

  let outDir = input.out!.workingDirectory!;
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
    let mainHtmlPath = path.join(outDir, `${systemInfo.inputUlid}.html`);
    log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
    log.debug(`  HTML be saved locally to ${mainHtmlPath}`)
    await generateMainScreenshot(page, mainHtmlPath, mainPngPath);
    fs.writeFileSync(path.join(outDir, `${systemInfo.inputUlid}.json`), JSON.stringify({
      shotBroInput: input, systemInfo
    }), 'utf-8')
    const lineObj: IndexLineObj = {inputUlid: systemInfo.inputUlid!}
    if (!fs.existsSync(indexJsonLPath)) fs.writeFileSync(indexJsonLPath, '', 'utf-8')
    fs.appendFileSync(indexJsonLPath, JSON.stringify(lineObj))

    // TODO: generate markdown doc of screenshots appended to for each test run
  } catch (e) {
    output.error = String(e)
    log.warn(`Could not capture ${input.shotName}: ${e}`)

  }
  return output
}

type IndexLineObj = {
  inputUlid: string
}

export async function shotBroUpload(uploadConfigRaw: ShotBroUploadConfig): Promise<ShotBroOutput[]> {
  const log = new CliLog(uploadConfigRaw.logLevel || 'info');
  const uploadConfig = prepareUploadConfig(uploadConfigRaw)
  let outDir = uploadConfig!.workingDirectory!;
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
    let mainHtmlPath = path.join(outDir, `${lineObj.inputUlid}.html`);
    const output = await uploadToApi(uploadConfig, mainJson.shotBroInput, mainHtmlPath, mainPngPath, mainJson.systemInfo, log);
    outputs.push(output)
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
  ShotBroInput,
  ShotBroOutput,
  ShotBroSystemInfo,
  ShotBroUploadConfig,
  ShotBroLogLevel,
  ShotBroOutputConfig,
  ShotBroMetadata,
  ShotBroBox,
  BoxShape,
  ArrowShape,
  CircleShape,
  ShapeCommon,
  ShotBroFocus,
  ShotBroShape,
  TextShape,
  ShapePosition,
  ShapeTransform
} from './shotbro-types';
