const fs = require('fs');
const path = require('path');

// Create a log file path
const logFile = path.join(__dirname, 'log.txt');

// Function to write a log message
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
}

module.exports = {writeLog};