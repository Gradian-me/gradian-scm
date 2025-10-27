// Application logging enums and variables
export enum LogType {
  FORM_DATA = 'FORM_DATA',
  REQUEST_BODY = 'REQUEST_BODY',
  REQUEST_RESPONSE = 'REQUEST_RESPONSE'
}

// Log flags configuration
export const LOG_CONFIG = {
  [LogType.FORM_DATA]: true,
  [LogType.REQUEST_BODY]: true,
  [LogType.REQUEST_RESPONSE]: true
};
