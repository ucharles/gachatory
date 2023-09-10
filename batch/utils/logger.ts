import fs from "fs";

export function logInfo(message: string): void {
  writeToLog("INFO", message);
}

export function logError(message: string): void {
  writeToLog("ERROR", message);
}

function writeToLog(logLevel: string, message: string): void {
  const logEntry = `[${new Date().toISOString()}] [${logLevel}] ${message}\n`;

  fs.appendFile("app.log", logEntry, (err) => {
    if (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  });
}
