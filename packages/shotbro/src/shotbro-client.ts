import * as fs from "fs";
import * as os from 'os';
import * as path from 'path';
import {ulid} from "./util/ulid";
import type {Page} from "playwright";
import {uploadToApi} from "./uploader";
import {generateMainScreenshot} from "./main-shot/main-screenshotter";
import {ShotBroInput, ShotBroResult, ShotBroOutputConfig} from './shotbro-types';

function parpareConfig(shotName: string, shotBroConfig: ShotBroInput): ShotBroInput {
  // make a copy of the original so we don't screw it up in any way
  // (seriously in 2022 this is still the fastest most portable way to do this)
  const defaultedConfig = JSON.parse(JSON.stringify(shotBroConfig));

  if (!shotName) {

  }
  if (shotName.length > 120) {
    // 120 = same as length of code in intellij
  }
  if (shotName != encodeURIComponent(shotName)) {
    // shotname must be url safe (for now)
  }
  return defaultedConfig;
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
 * @param shotName Make sure this is unique within your repo (< 120 chars)
 * @param page Playwright page that you want to screenshot
 * @param shotBroConfig
 * @param outputConfig
 */
export async function shotBro(shotName: string, page: Page, shotBroConfig: ShotBroInput, outputConfig?: ShotBroOutputConfig): Promise<ShotBroResult> {
  const shotId = ulid();
  const shotBroProps = parpareConfig(shotName, shotBroConfig);

  let outDir = '.shotbro/out';
  let cleanOutDir = true;
  let cleanupWhenDone = false;
  try {
    outDir = prepareOutDir(outDir, cleanOutDir);

    let main2ScreenshotPath = path.join(outDir, 'main.png');
    let main2ContentPath = path.join(outDir, 'main.html');
    await generateMainScreenshot(page, main2ScreenshotPath, main2ContentPath);
    await uploadToApi(shotBroProps, main2ScreenshotPath, main2ContentPath);

  } finally {
    if (cleanupWhenDone) cleanupOutDir(outDir)
  }

  return {shotId: shotId}
}

function cleanupOutDir(outDir) {
  try {
    if (outDir) fs.rmSync(outDir, {recursive: true});
  } catch (e) {
    console.error(`An error has occurred while cleaning up ${outDir}. Error: ${e}`);
  }
}
