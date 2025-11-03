import { LogType, LOG_CONFIG } from '../constants/application-variables';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const getLogFlag = (logType: LogType): boolean => {
  return LOG_CONFIG[logType] ?? false;
};

/**
 * Custom logging function that checks if logging is enabled for the given log type
 * Only logs in development mode (npm run dev), not in production (npm start)
 * @param logType - The type of logging from LogType enum
 * @param level - The log level (log, info, warn, error, debug)
 * @param message - The message to log
 */
export const loggingCustom = (logType: LogType, level: LogLevel, message: string) => {
  // Only log in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment) {
    return;
  }

  // Check if logging is enabled for this log type
  if (!getLogFlag(logType)) {
    return;
  }

  const prefix = `[${logType}]`;
  const formattedMessage = `${prefix} ${message}`;

  switch (level) {
    case 'log':
      console.log(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
    case 'debug':
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
};

