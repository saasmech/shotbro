import type {FullConfig, FullResult, Reporter, Suite, TestCase, TestResult} from "@playwright/test/reporter";
import type {ShotBroReporterConfig} from "./shotbro-types";
import {CliLog} from "./util/log";
import {ulid} from "./util/ulid";

export const PW_TEST_INFO_ANNOTATION_KEY = 'shotbro-input-ulid';
export const PW_TEST_INFO_RUN_ULID = 'shotbro-test-run-ulid';
export const PW_TEST_INFO_OUT_DIR_KEY = 'shotbro-out-dir';
export const PW_TEST_INFO_LOG_LEVEL_KEY = 'shotbro-log-level';

function prepareReporterConfig(config: ShotBroReporterConfig): ShotBroReporterConfig {
    if (!config) config = {}
    if (!config.branchName) config.branchName = process.env.GITHUB_REF_NAME ?? undefined;
    // branchName defaulted at server to 'main' if empty
    if (!config.buildName) config.buildName = process.env.GITHUB_RUN_NUMBER ?? undefined;
    // buildName defaulted at server to a run number if empty
    if (!config.appApiKey) config.appApiKey = process.env.SHOTBRO_APP_API_KEY ?? undefined;
    if (!config.baseUrl) config.baseUrl = process.env.SHOTBRO_BASE_URL;
    if (!config.baseUrl) config.baseUrl = 'https://shotbro.io';
    if (!config.outDirectory) config.outDirectory = 'test-results/shotbro';
    if (!config.logLevel) config.logLevel = 'info';
    return config;
}

/**
 * Needed to tie together different shots if uploading is required.
 *
 * MAYBE: support sharding of tests (generated shots will be on different machines).
 */
export class ShotBroPlaywrightReporter implements Reporter {
    private readonly options: ShotBroReporterConfig;
    private readonly log: CliLog;
    private readonly testRunUlid: string;
    private inputUlids: string[] = [];
    private capturePlatformVersion?: string

    constructor(options: ShotBroReporterConfig) {
        this.options = prepareReporterConfig(options);
        this.log = new CliLog(this.options.logLevel || 'info');
        this.testRunUlid = `ug:${ulid()}`;
        console.log('ShotBroPlaywrightReporter', this.options);
    }

    onBegin(config: FullConfig, suite: Suite) {
        this.capturePlatformVersion = config.version;
        this.log.info(`ShotBro: begin`, this.testRunUlid);
        this.log.debug(`ShotBro: configured for`, {
            baseUrl: this.options.baseUrl,
            workingDirectory: this.options.outDirectory,
            logLevel: this.options.logLevel,
        });
    }

    onTestBegin(test: TestCase, result: TestResult) {
        console.log("onTestBegin adding");
        test.annotations.push({type: PW_TEST_INFO_RUN_ULID, description: this.testRunUlid});
        test.annotations.push({type: PW_TEST_INFO_OUT_DIR_KEY, description: this.options.outDirectory!});
        test.annotations.push({type: PW_TEST_INFO_LOG_LEVEL_KEY, description: this.options.logLevel!});
    }

    onTestEnd(test: TestCase, result: TestResult) {
        result.attachments;
        test.annotations.forEach((a) => {
            if (a.type === PW_TEST_INFO_ANNOTATION_KEY) {
                this.log.debug('ShotBro: add shot', a.description);
                this.inputUlids.push(a.description as string);
            }
        });
    }

    async onEnd(result: FullResult): Promise<void> {
        this.log.info(`ShotBro: Test run finished with status: ${result.status}`);
        this.log.debug(`ShotBro: ulids for upload`, this.inputUlids);
        if (result.status === 'passed') {
            // this.log.info(`ShotBro: Starting uploads`);
            // await shotBroUpload(this.options, this.inputUlids, this.log, this.capturePlatformVersion!,
            //     this.testRunUlid);
            this.log.info(`ShotBro: Completed`, this.testRunUlid);
        }
    }
}