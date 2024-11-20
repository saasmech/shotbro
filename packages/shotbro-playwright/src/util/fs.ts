import {CliLog} from "./log";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function cleanupDir(log: CliLog, dirToClean: string) {
    if (!dirToClean) return;
    log.debug(`Cleaning ${dirToClean}`)
    try {
        await fs.rm(dirToClean, {recursive: true});
    } catch (e) {
        log.warn(`An error has occurred while cleaning up ${dirToClean}. Error: ${e}`);
    }
}

export async function prepareDir(log: CliLog, outDir: string) {
    if (!outDir) {
        outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ShotBro'));
        log.debug(`dir is not set, using temp dir ${outDir}`);
    } else {
        try {
            await fs.access(outDir);
            log.debug(`dir access ok ${outDir}`)
        } catch (e) {
            log.debug(`dir access fail, creating ${outDir}`)
            await fs.mkdir(outDir, {recursive: true});
        }
    }
    return path.resolve(outDir);
}
