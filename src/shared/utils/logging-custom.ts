import { LOG_FORM_DATA, LOG_REQUEST_BODY, LOG_REQUEST_RESPONSE } from '../constants/application-variables';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';
type LogType = 'LOG_FORM_DATA' | 'LOG_REQUEST_BODY' | 'LOG_REQUEST_RESPONSE';

const getLogFlag = (logType: LogType): boolean => {
  switch (logType) {
    case 'LOG_FORM_DATA':
      return LOG_FORM_DATA;
    case 'LOG_REQUEST_BODY':
      return LOG_REQUEST_BODY;
    case 'LOG_REQUEST_RESPONSE':
      return LOG_REQUEST_RESPONSE;
    default:
      return false;
  }
};

/**
 * Custom logging function that checks if logging is enabled for the given log type
 * @param logType - The type of logging (LOG_FORM_DATA, LOG_REQUEST_BODY, LOG_REQUEST_RESPONSE)
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

