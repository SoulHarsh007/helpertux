import {writeFileSync} from 'fs';
import {inspect} from 'util';
/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Logger
 * @classdesc prettifies information and logs it via console.log
 */
export class Logger {
  /**
   * @class
   */
  constructor() {
    this.logs = [];
  }
  /**
   * @function storelog
   */
  storeLog() {
    const date = new Date();
    writeFileSync(
      `./logs/${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
        })
        .replace(',', '')}.log`,
      `${this.logs.join('\n')}\n`,
      'utf8'
    );
  }
  /**
   * @function log
   * @param {any} data - log format param [date time `${result}`] [`${type}`] - `${data}`
   * @param {any} type - log format param [date time `${result}`] [`${type}`] - `${data}`
   * @param {any} result - log format param [date time `${result}`] [`${type}`] - `${data}`
   */
  log(data, type, result) {
    const date = new Date();
    if (typeof data !== 'string') data = inspect(data);
    this.logs.push(
      `[${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
        })
        .replace(',', '')} ${date.toLocaleTimeString('en-us', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
      })} ${result}] [${type}] - ${data}`
    );
    console.log(
      `[${date
        .toLocaleDateString('en-us', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
        })
        .replace(',', '')} ${date.toLocaleTimeString('en-us', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
      })} ${result}] [${type}] - ${data}`
    );
  }
  /**
   * @function clearLogs
   * @returns {string} returns a string to represent successful cleanup
   */
  clearLogs() {
    delete this.logs;
    this.logs = [];
    return 'Logs cleared successfully';
  }
}
