/* eslint-disable no-console */

export class Logger {
  static info(info: unknown) {
    console.log(info);
  }

  static error(error: unknown) {
    if (error instanceof Error) {
      console.error(`${error.message}\n${error.stack}`);
    } else {
      console.error(error);
    }
  }

  static warn(warn: unknown) {
    if (warn instanceof Error) {
      console.warn(`${warn.message}\n${warn.stack}`);
    } else {
      console.warn(warn);
    }
  }
}
