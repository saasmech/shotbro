import * as fs from "fs";
import * as os from 'os';
import * as path from 'path';
import type {Page} from "playwright";
import {uploadToApi} from "./uploader";
import {generateMainScreenshot} from "./main-shot/main-screenshotter";
import {ShotBroInput, ShotBroOutput, ShotBroSystemInfo} from './shotbro-types';
import {CliLog} from "./util/log";

// use date at start so it will be the same for all invocations while node is running
const ISO_DATE_AT_START = new Date().toISOString();

function prepareConfig(rawInput: ShotBroInput): ShotBroInput {
  // make a copy of the original, so we don't screw it up in any way
  // (seriously in 2022 this is still the fastest most portable way to do this)
  let input: ShotBroInput;
  try {
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
  if (!input.out.appApiKey) input.out.appApiKey = process.env.SHOTBRO_APP_API_KEY;
  if (!input.out.baseUrl) input.out.baseUrl = process.env.SHOTBRO_BASE_URL;
  if (!input.out.baseUrl) input.out.baseUrl = 'https://shotbro.io';
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
      infoColorScheme: scheme
    };
  });
  log.debug(`browserInfo ${JSON.stringify(browserInfo)}`)
  const systemInfo:ShotBroSystemInfo =  {
    appVersion: ISO_DATE_AT_START,
    // if running on github actions use something sensible.  If undefined the server can decide.
    appBranch: process.env.GITHUB_HEAD_REF,
    osPlatform: browserInfo.infoPlatform || os.platform(),
    osVersion: os.release(),
    browserType: browserInfo.infoBrand || page.context().browser()?.browserType()?.name(),
    browserVersion: browserInfo.infoVersion || page.context().browser()?.version(),
    browserUserAgent: browserInfo.infoUserAgent,
    browserLanguage: browserInfo.infoLanguage,
    browserViewportWidth: browserInfo.infoViewportWidth,
    browserViewportHeight: browserInfo.infoViewportHeight,
    browserPrefersColorScheme: browserInfo.infoColorScheme
  };
  log.debug(`systemInfo ${JSON.stringify(systemInfo)}`)
  return systemInfo;
}


function prepareOutDir(outDir: string, cleanOutDir: boolean) {
  if (!outDir) {
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ShotBro'));
  } else {
    fs.mkdirSync(outDir, {recursive: true});
  }
  if (cleanOutDir) {
    const oldFiles = fs.readdirSync(outDir);
    for (const oldFile of oldFiles) {
      fs.unlinkSync(path.join(outDir, oldFile));
    }
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

  let outDir = shotBroInput.out?.workingDirectory || '.shotbro/out';
  let output: ShotBroOutput = {
    shotAdded: false,
  };
  let cleanOutDir = true;
  let cleanupWhenDone = false;
  try {
    log.debug(`Prepare output dir ${outDir}`)
    outDir = prepareOutDir(outDir, cleanOutDir);

    let mainPngPath = path.join(outDir, 'main.png');
    let mainHtmlPath = path.join(outDir, 'main.html');
    log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
    log.debug(`  HTML be saved locally to ${mainHtmlPath}`)
    await generateMainScreenshot(page, mainHtmlPath, mainPngPath);
    output.shotUrl = await uploadToApi(input, mainHtmlPath, mainPngPath, systemInfo, log);
    output.shotAdded = true;

    // TODO: generate markdown doc of screenshots appended to for each test run
  } catch(e) {
    output.error = String(e)
    log.warn(`Could not capture ${shotBroInput.shotName}: ${e}`)

  } finally {
    if (cleanupWhenDone) cleanupOutDir(outDir)
  }
  return output
}

function cleanupOutDir(outDir: string) {
  try {
    if (outDir) fs.rmSync(outDir, {recursive: true});
  } catch (e) {
    console.error(`An error has occurred while cleaning up ${outDir}. Error: ${e}`);
  }
}
