import fs from 'fs'

import { greenBright, yellowBright, cyanBright, redBright } from 'chalk'

/**
 * @method info - log successful message to console
 * @method error - log critical error to consoel and exit process with 1
 */
const log = {
  /**
   * log successful message to console
   * @param message Message to show
   */
  info(info: string): void {
    console.log(
      new Date().toISOString() +
        ' ' +
        `[${greenBright('INFO')}]` +
        ': ' +
        cyanBright(info)
    )
  },
  /**
   * log critical error to console and exit process
   * @param invoker Prefix to log file
   * @param error Error message
   */
  error(invoker: string, error: string): void {
    console.log(
      new Date().toISOString() +
        ' ' +
        `[${yellowBright('ERROR')}] ${yellowBright(invoker)}` +
        ': ' +
        redBright(error)
    )
  }
}
export default log
