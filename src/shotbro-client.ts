import * as fs from "fs";
import * as os from 'os';
import * as path from 'path';
import {ulid} from "./util/ulid";
import type {Page} from "playwright";
import {uploadToApi} from "./uploader";
import {generateMainScreenshot} from "./main-shot/main-screenshotter";
import {ShotBroInput, ShotBroResult} from './shotbro-types';
import {CliLog} from "./util/log";

// use date at start so it will be the same for all invocations while node is running
const ISO_DATE_AT_START = new Date().toISOString();

function parpareConfig(rawInput: ShotBroInput): ShotBroInput {
  // make a copy of the original, so we don't screw it up in any way
  // (seriously in 2022 this is still the fastest most portable way to do this)
  let input: ShotBroInput;
  try {
    input = JSON.parse(JSON.stringify(rawInput)) as ShotBroInput;
  } catch(e) {
    console.error('Could not parse input', rawInput)
    throw e;
  }

  if (!input.shotName || input.shotName.length < 3) {
    throw new Error('shotName must be at least 3 characters')
  }
  if (input.shotName.length > 120) {
    throw new Error('shotName must be less than 120 characters')
  }

  if (!input.metadata) input.metadata = {}
  if (!input.metadata.app) input.metadata.app = {}
  if (!input.metadata.app.appVersion) input.metadata.app.appVersion = ISO_DATE_AT_START;

  if (!input.metadata.device) input.metadata.device = {}
  if (!input.metadata.device.osVersion) input.metadata.device.osVersion = os.version();
  if (!input.metadata.device.osPlatform) input.metadata.device.osVersion = os.platform();
  if (!input.metadata.device.browserType) input.metadata.device.browserType = ''; // TODO
  if (!input.metadata.device.browserVersion) input.metadata.device.browserVersion = ''; // TODO
  if (!input.metadata.device.browserUserAgent) input.metadata.device.browserUserAgent = ''; // TODO
  if (!input.metadata.device.browserLangPrimary) input.metadata.device.browserLangPrimary = ''; // TODO
  if (!input.metadata.device.browserLangSecondary) input.metadata.device.browserLangSecondary = ''; // TODO
  if (!input.metadata.device.browserViewportWidth) input.metadata.device.browserViewportWidth = 123; // TODO
  if (!input.metadata.device.browserViewportHeight) input.metadata.device.browserViewportHeight = 123; // TODO
  if (!input.metadata.device.browserPrefersColorScheme) input.metadata.device.browserPrefersColorScheme = ''; // TODO

  if (!input.out) input.out = {}
  if (!input.out.appApiKey) input.out.appApiKey = process.env.SHOTBRO_APP_API_KEY;
  if (!input.out.baseUrl) input.out.baseUrl = process.env.SHOTBRO_BASE_URL;
  if (!input.out.baseUrl) input.out.baseUrl = 'https://shotbro.io';

  return input;
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

/**
 *
 * @param page Playwright page that you want to screenshot
 * @param shotBroInput
 */
export async function shotBro(page: Page, shotBroInput: ShotBroInput): Promise<ShotBroResult> {
  const log = new CliLog(shotBroInput.out?.debug ? 'debug':'info');
  const shotId = ulid();
  const input = parpareConfig(shotBroInput);

  let outDir = '.shotbro/out';
  let cleanOutDir = true;
  let cleanupWhenDone = false;
  try {
    log.debug(`Prepare output dir ${outDir}`)
    outDir = prepareOutDir(outDir, cleanOutDir);

    let mainPngPath = path.join(outDir, 'main.png');
    let mainHtmlPath = path.join(outDir, 'main.html');
    log.debug(`Screenshot PNG be saved locally to ${mainPngPath}`)
    log.debug(`  HTML be saved locally to ${mainHtmlPath}`)
    await generateMainScreenshot(page, mainPngPath, mainHtmlPath);
    await uploadToApi(input, mainPngPath, mainHtmlPath, log);

    // TODO: generate markdown doc of screenshots appended to for each test run

  } finally {
    if (cleanupWhenDone) cleanupOutDir(outDir)
  }

  return {shotId: shotId}
}

function cleanupOutDir(outDir: string) {
  try {
    if (outDir) fs.rmSync(outDir, {recursive: true});
  } catch (e) {
    console.error(`An error has occurred while cleaning up ${outDir}. Error: ${e}`);
  }
}
