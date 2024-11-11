#!/usr/bin/env ts-node

import * as path from "node:path";
import * as fs from "node:fs/promises";

async function main() {
    //const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const bundledDirs = ['modern-normalize', '@fontsource'];
    for (const bundledDir of bundledDirs) {
        const srcPath = path.join('node_modules', bundledDir);
        const targetPath = path.join('src', 'bundled', bundledDir);
        await fs.rm(targetPath, {recursive: true, force: true});
        await fs.cp(srcPath, targetPath, {recursive: true});
    }
}

await main();