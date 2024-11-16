import * as fs from 'node:fs/promises';
import {expect, Page, test} from '@playwright/test';
import {PNG} from 'pngjs';
import * as path from "node:path";
import {findPositions, generateMainScreenshot} from "../main-shot/main-screenshot";
import {shotBroPlaywrightAnnotate} from "../annotate/annotate";
import {CliLog} from "../util/log";
import {ShotBroShape} from "../shape/shape-types";
import {ShotBroInput} from "../annotate/annotate-types";
import {ShotBroLogLevel} from "../shotbro-types";

export function isUpdatingSnapshots() {
    return process.env.UPDATE_SNAPSHOTS === 'yes';
}

export async function expectPngToMatchSnapshot(logLevel: ShotBroLogLevel, pngPath: string, testFolder: string, testName: string) {
    const log = new CliLog(logLevel);
    let snapshotsDir = `src/test/__snapshots__/${testFolder}`;
    await fs.mkdir(snapshotsDir, {recursive: true});
    let outDir = `test-results/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let fileName = `${testName}.png`;
    let compareFile = `${testName}-comparison-to-snapshot.png`;
    let compareFilePath = path.resolve(path.join(outDir, compareFile));
    let snapshotFilePath = path.resolve(path.join(snapshotsDir, fileName));
    let outFile = path.resolve(pngPath);
    if (isUpdatingSnapshots()) {
        log.info(`Updating baseline snapshot for ${fileName}`);
        await fs.copyFile(outFile, snapshotFilePath);
        // continue anyway to verify matching is working
    }
    const snapshotPng = PNG.sync.read(await fs.readFile(snapshotFilePath));
    const outPng = PNG.sync.read(await fs.readFile(outFile));
    const diff = new PNG({width: snapshotPng.width, height: snapshotPng.height});
    const pixelMatchImport = await import('pixelmatch');
    let pixelMatch = pixelMatchImport.default;
    const numDiffPixels = pixelMatch(snapshotPng.data, outPng.data, diff.data, snapshotPng.width, snapshotPng.height, {threshold: 0.01});
    if (numDiffPixels > 0) {
        const buf = PNG.sync.write(diff);
        // @ts-ignore
        await fs.writeFile(compareFilePath, buf);
    }
    test.expect(numDiffPixels).toBe(0);
}

export async function expectHtmlToMatchSnapshot(logLevel: ShotBroLogLevel, html: string, testFolder: string, testName: string) {
    const log = new CliLog(logLevel);
    let snapshotsDir = `src/test/__snapshots__/${testFolder}`;
    await fs.mkdir(snapshotsDir, {recursive: true});
    let outDir = `test-results/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let fileName = `${testName}.html`;
    let snapshotFilePath = path.resolve(path.join(snapshotsDir, fileName));
    log.debug(`snapshotFilePath ${snapshotFilePath}`);
    let outFile = path.resolve(path.join(outDir, fileName));
    log.debug(`outFile ${outFile}`);
    await fs.writeFile(outFile, html);
    if (isUpdatingSnapshots()) {
        log.info(`Updating baseline snapshot for ${fileName}`);
        await fs.copyFile(outFile, snapshotFilePath);
        // continue anyway to verify matching is working
    }
    let snapshotHtml = await fs.readFile(snapshotFilePath, {encoding: 'utf-8'});
    expect(html, `Snapshot for ${testFolder} / ${testName} does not match`).toMatch(snapshotHtml);
}

export async function testShape(logLevel: ShotBroLogLevel, pageRef: Page, testFolder: string, testName: string, shape: ShotBroShape) {
    const log = new CliLog(logLevel)
    let page = await pageRef.context()!.browser()!.newPage();
    await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-shapes-base.html'))}`);
    let input: ShotBroInput = {
        focus: {at: 'body'},
        shapes: [{at: '#test-div', ...shape}],
        shotName: `test-${testName}`
    };
    let outDir = `test-results/test-shapes/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let mainPngName = `${testName}-main-bg.png`;
    let mainPngPath = path.join(outDir, mainPngName);
    let htmlPath = path.resolve(path.join(outDir, `${testName}.html`));
    let focusPngPath = path.join(outDir, `${testName}.png`);
    await generateMainScreenshot(page, mainPngPath);
    let inputPositions = await findPositions(log, page, input);
    await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, '../../../src/bundled');
    if (logLevel != 'debug') {
        await fs.rm(mainPngPath, {force: true});
        await fs.rm(htmlPath, {force: true});
    }
    await expectPngToMatchSnapshot(logLevel, focusPngPath, testFolder, testName);
}
