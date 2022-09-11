import {ShotBroLogLevel} from "../shotbro-types";


/**
 * Ideally we would rely on another library for this, but we want to have as few dependencies as possible.
 */
export class CliLog {
  logLevel: string

  constructor(logLevel: ShotBroLogLevel) {
    this.logLevel = logLevel;
  }

  debug(msg: string) {
    if (['debug'].includes(this.logLevel)) console.debug(msg)
  }

  info(msg: string) {
    if (['info', 'debug'].includes(this.logLevel)) console.info(msg)
  }

  warn(msg: string) {
    if (['warn', 'info', 'debug'].includes(this.logLevel)) console.warn(msg);
  }

  // not sure if we need error.  We don't want to fail ever as it could block a users test pipeline.

}
