import {ShotBroLogLevel} from "../shotbro-types";


/**
 * Ideally we would rely on another library for this, but we want to have as few dependencies as possible.
 */
export class CliLog {
  logLevel: string

  constructor(logLevel: ShotBroLogLevel) {
    this.logLevel = logLevel;
  }

  debug(...args: any[]) {
    if (['debug'].includes(this.logLevel)) console.debug(...args)
  }

  info(...args: any[]) {
    if (['info', 'debug'].includes(this.logLevel)) console.info(...args)
  }

  warn(...args: any[]) {
    if (['warn', 'info', 'debug'].includes(this.logLevel)) console.warn(...args);
  }

  // not sure if we need error.  We don't want to fail ever as it could block a users test pipeline.

}
