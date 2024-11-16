
import * as fs from 'node:fs';
import {Page, test} from '@playwright/test';
import {PNG} from 'pngjs';
import * as path from "node:path";
import {findPositions, generateMainScreenshot} from "../main-shot/main-screenshotter";
import {shotBroPlaywrightAnnotate} from "../annotate/annotate";
import {CliLog} from "../util/log";
import {ShotBroShape} from "../annotate/shape/shape-types";
import {ShotBroInput} from "../annotate/annotate-types";
import {ShotBroLogLevel} from "../shotbro-types";

export function testResultsPath(folder: string, fileName: string) {
  if (folder == '') {
    return path.join(folder, 'test-results', fileName);
  }
  fs.mkdirSync(path.join(folder, 'test-results'), {recursive: true});
  return path.join(folder, 'test-results', fileName);
}

export async function expectImageToMatchBaseline(outFile: string) {
  const fileName = path.basename(outFile);
  const parentDir = path.resolve(path.dirname(outFile), '..');
  const baselineFilePath = path.join(parentDir, fileName);
  const updateSnapshots = process.env.UPDATE_SNAPSHOTS === 'true';
  if (updateSnapshots) {
    console.log(`Updating baseline snapshot for ${fileName}`);
    fs.copyFileSync(outFile, baselineFilePath);
    // continue anyway to verify pixelmatch is working
  }
  const baseline = PNG.sync.read(fs.readFileSync(baselineFilePath));
  const compareTo = PNG.sync.read(fs.readFileSync(outFile));
  const diff = new PNG({width: baseline.width, height: baseline.height});
  const pixelmatchImport = await import('pixelmatch');
  let pixelmatch = pixelmatchImport.default;
  const numDiffPixels = pixelmatch(baseline.data, compareTo.data, diff.data, baseline.width, baseline.height, {threshold: 0.01});
  const buf = PNG.sync.write(diff);
  fs.writeFileSync(path.join(path.dirname(outFile), `diff-${fileName}`), buf);
  test.expect(numDiffPixels).toBe(0);
}

export async function testShape(logLevel: ShotBroLogLevel, pageRef:Page, testFolder: string, testName: string, shape: ShotBroShape) {
  let log = new CliLog(logLevel)
  let page = await pageRef.context()!.browser()!.newPage();
  await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-shapes-base.html'))}`);
  let input : ShotBroInput = {
    focus: {at: 'body'},
    shapes: [{at: '#test-div', ...shape}],
    shotName: `test-${testName}`
  };
  let outDir = `test-results/test-shapes/${testFolder}`;
  fs.mkdirSync(outDir, {recursive: true});
  let mainPngName = `${testName}-main-bg.png`;
  let mainPngPath = path.join(outDir, mainPngName);
  let htmlPath = path.resolve(path.join(outDir, `${testName}.html`));
  let focusPngPath = path.join(outDir, `${testName}.png`);
  await generateMainScreenshot(page, mainPngPath);
  let inputPositions = await findPositions(log, page, input);
  await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, '../../../src/bundled');
  if (logLevel != 'debug') {
    fs.rmSync(mainPngPath, {force: true});
    fs.rmSync(htmlPath, {force: true});
  }
}

export const SNAPSHOTS_DIR_NAME = '__snapshots__';
export const COMPARE_DIR_NAME = 'compare';
