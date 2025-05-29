import * as fs from 'fs';
import * as path from 'path';

// Create a log file path
const logFile = path.join(__dirname, 'log.txt');

// Function to write a log message
export function writeLog(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFile, logMessage, err => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
}
