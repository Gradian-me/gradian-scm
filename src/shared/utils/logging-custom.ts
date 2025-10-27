import { LogType, LOG_CONFIG } from '../constants/application-variables';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const getLogFlag = (logType: LogType): boolean => {
  return LOG_CONFIG[logType] ?? false;
};

/**
 * Custom logging function that checks if logging is enabled for the given log type
 * @param logType - The type of logging from LogType enum
 * @param level - The log level (log, info, warn, error, debug)
 * @param message - The message to log
 */
export const loggingCustom = (logType: LogType, level: LogLevel, message: string) => {
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

