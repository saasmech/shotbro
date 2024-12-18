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

export function isSkipPngCompare() {
    return process.env.SKIP_PNG_COMPARE === 'yes';
}

export async function expectPngToMatchSnapshot(logLevel: ShotBroLogLevel, pngPath: string, testFolder: string, testName: string) {
    const log = new CliLog(logLevel);
    let snapshotsDir = `src/__snapshots__/${testFolder}`;
    await fs.mkdir(snapshotsDir, {recursive: true});
    let outDir = `test-results/compare/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let fileName = `${testName}.png`;
    let compareFile = `${testName}-comparison-to-snapshot.png`;
    let compareFilePath = path.resolve(path.join(outDir, compareFile));
    let snapshotFilePath = path.resolve(path.join(snapshotsDir, fileName));
    let outFile = path.resolve(pngPath);
    if (isUpdatingSnapshots()) {
        log.info(`Updating baseline snapshot for ${testFolder}/${fileName}`);
        await fs.copyFile(outFile, snapshotFilePath);
        // continue anyway to verify matching is working
    }
    const snapshotPng = PNG.sync.read(await fs.readFile(snapshotFilePath));
    const outPng = PNG.sync.read(await fs.readFile(outFile));
    const diff = new PNG({width: snapshotPng.width, height: snapshotPng.height});
    const pixelMatchImport = await import('pixelmatch');
    let pixelMatch = pixelMatchImport.default;
    let numDiffPixels: number;
    if (snapshotPng.width != outPng.width || snapshotPng.height != outPng.height) {
        log.warn(`${testFolder}/${testName} Sizes don't match snapshot: ${snapshotPng.width}x${snapshotPng.height} out: ${outPng.width}x${outPng.height}`);
    }
    try {
        numDiffPixels = pixelMatch(snapshotPng.data, outPng.data, diff.data, snapshotPng.width, snapshotPng.height, {threshold: 0.1});
    } catch (e) {
        numDiffPixels = 99;
        log.warn(`${testFolder}/${testName} PixelMatch failed: ${e}`);
    }
    if (numDiffPixels > 0) {
        log.warn(`${testFolder}/${testName} diff pixels ${numDiffPixels}`);
        const buf = PNG.sync.write(diff);
        // @ts-ignore
        await fs.writeFile(compareFilePath, buf);
    }
    if (!isSkipPngCompare()) {
        // when running on different machines (ci) sub-pixel rendering screws with PNG compare
        test.expect(numDiffPixels).toBe(0);
    }
}

export async function expectHtmlToMatchSnapshot(logLevel: ShotBroLogLevel, html: string, testFolder: string, testName: string) {
    const log = new CliLog(logLevel);
    let snapshotsDir = `src/__snapshots__/${testFolder}`;
    await fs.mkdir(snapshotsDir, {recursive: true});
    let outDir = `test-results/compare/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let fileName = `${testName}.html`;
    let snapshotFilePath = path.resolve(path.join(snapshotsDir, fileName));
    log.debug(`snapshotFilePath ${snapshotFilePath}`);
    let outFile = path.resolve(path.join(outDir, fileName));
    log.debug(`outFile ${outFile}`);
    await fs.writeFile(outFile, html);
    if (isUpdatingSnapshots()) {
        log.info(`Updating baseline snapshot for ${testFolder}/${fileName}`);
        await fs.copyFile(outFile, snapshotFilePath);
        // continue anyway to verify matching is working
    }
    let snapshotHtml = await fs.readFile(snapshotFilePath, {encoding: 'utf-8'});
    expect(html, `Snapshot for ${testFolder} / ${testName} does not match`).toMatch(snapshotHtml);
}

export async function testShape(logLevel: ShotBroLogLevel, pageRef: Page, testFolder: string, testName: string, shape: ShotBroShape) {
    const log = new CliLog(logLevel)
    let outDir = `test-results/compare/${testFolder}`;
    await fs.mkdir(outDir, {recursive: true});
    let mainPngName = `${testName}-shape-main.png`;
    let mainPngPath = path.join(outDir, mainPngName);
    let htmlPath = path.resolve(path.join(outDir, `${testName}-shape.html`));
    let focusPngPath = path.join(outDir, `${testName}-shape.png`);
    let page = await pageRef.context()!.browser()!.newPage();
    await page.setViewportSize({width: 2000, height: 2000});
    await page.goto(`file:${path.resolve(path.join('src', 'test', 'test-shapes-base.html'))}`);
    let input: ShotBroInput = {
        focus: {at: 'body'},
        shapes: [{at: '#test-div', ...shape}],
        shotName: `test-${testName}`
    };
    await generateMainScreenshot(page, mainPngPath);
    let inputPositions = await findPositions(log, page, input);
    await shotBroPlaywrightAnnotate(log, page, mainPngName, htmlPath, input, inputPositions, focusPngPath, '../../../dist/bundled', false);
    if (logLevel != 'debug') {
        await fs.rm(mainPngPath, {force: true});
    }
    const html = await fs.readFile(htmlPath, {encoding: 'utf-8'});
    await expectHtmlToMatchSnapshot(logLevel, html, testFolder, testName);
    await expectPngToMatchSnapshot(logLevel, focusPngPath, testFolder, testName);
}
