const pixelmatch = require('../third_party/pixelmatch.js');
import * as fs from 'fs';
import {test} from '@playwright/test';
import {PNG} from 'pngjs';
// import {PNG} from 'pngjs/browser';
import * as path from "path";

export function currentRunImgPath(folder: string, fileName: string) {
  return path.join(folder, '__snapshots__', COMPARE_DIR_NAME, fileName);
}

export async function expectImageToMatchBaseline(outFile: string) {
  const fileName = path.basename(outFile);
  const parentDir = path.resolve(path.dirname(outFile), '..');
  const baselineFilePath = path.join(parentDir, fileName);
  const baseline = PNG.sync.read(fs.readFileSync(baselineFilePath));
  const compareTo = PNG.sync.read(fs.readFileSync(outFile));
  const diff = new PNG({width: baseline.width, height: baseline.height});
  const numDiffPixels = pixelmatch(baseline.data, compareTo.data, diff.data, baseline.width, baseline.height, {threshold: 0.01});
  const buf = PNG.sync.write(diff);
  fs.writeFileSync(path.join(path.dirname(outFile), `diff-${fileName}`), buf);
  test.expect(numDiffPixels).toBe(0);
}

export const SNAPSHOTS_DIR_NAME = '__snapshots__';
export const COMPARE_DIR_NAME = 'compare';
