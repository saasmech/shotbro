
import * as fs from 'node:fs';
import {test} from '@playwright/test';
import {PNG} from 'pngjs';
import * as path from "node:path";

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

export const SNAPSHOTS_DIR_NAME = '__snapshots__';
export const COMPARE_DIR_NAME = 'compare';
