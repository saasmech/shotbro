
type CliLogLevel = 'debug'|'info'|'warn'|'error';

/**
 * Ideally we would rely on another library for this, but we want to have as few dependencies as possible.
 */
export class CliLog {
  logLevel: string

  constructor(logLevel: CliLogLevel) {
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

}
