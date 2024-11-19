#!/usr/bin/env ts-node

import * as path from "node:path";
import * as fs from "node:fs/promises";

/**
 * Copy plain file dependencies (CSS, Fonts) so that consumers of the library don't need to have any dependencies on
 * other libraries.
 */
async function main() {
    //const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const bundledDirs = ['@fontsource', 'bootstrap', 'bootstrap-icons'];
    for (const bundledDir of bundledDirs) {
        const srcPath = path.join('node_modules', bundledDir);
        const targetPath = path.join('dist', 'bundled', bundledDir);
        await fs.rm(targetPath, {recursive: true, force: true});
        await fs.cp(srcPath, targetPath, {recursive: true});
    }
}

// @ts-ignore
main().then();
