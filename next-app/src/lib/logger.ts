// logger.ts

import pino, { LoggerOptions } from "pino";
import pinoPretty, { PrettyOptions } from "pino-pretty";

let logger: pino.Logger;

interface MyLoggerOptions extends LoggerOptions {
  prettyPrint?: PrettyOptions;
  prettifier?: (options?: PrettyOptions) => pinoPretty.PrettyStream;
}

if (process.env.NODE_ENV === "production") {
  // For production, logs will be written to a file
  logger = pino(pino.destination("./logs/logfile.log"));
} else {
  // For development, logs will be pretty-printed to the console
  const options: MyLoggerOptions = {
    prettyPrint: { colorize: true },
    prettifier: pinoPretty as (
      options?: PrettyOptions,
    ) => pinoPretty.PrettyStream,
  };
  logger = pino(options);
}

export default logger;
