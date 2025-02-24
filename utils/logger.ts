export class Logger {
  static info(info: unknown) {
    // eslint-disable-next-line no-console
    console.log(info);
  }
  static error(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
  }
  static warn(warn: unknown) {
    // eslint-disable-next-line no-console
    console.warn(warn instanceof Error ? warn.message : warn);
  }
}
