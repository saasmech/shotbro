// my-awesome-reporter.ts
import {FullConfig, FullResult, Reporter, Suite} from '@playwright/test/reporter';
import {shotBroUpload} from "shotbro";

class ShotBroPlaywrightReporter implements Reporter {
  private playwrightVersion = null;

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
    this.playwrightVersion = config.version
  }

  async onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);
    if (result.status === 'passed') {
      // SHOTBRO_APP_API_KEY;
      await shotBroUpload({
        capturePlatformType: 'playwright',
        capturePlatformVersion: this.playwrightVersion,
      });
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default ShotBroPlaywrightReporter;

