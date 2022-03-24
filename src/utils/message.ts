import chalk from 'chalk'

/**
 * Функция для оторажения сообщения
 *
 * @param message сообщение
 * @param level тип сообщения
 */
export const logMessage = (message: string, level = 'log'): void => {
  const colors = {
    log: 'white',
    info: 'blue',
    true: 'green',
    error: 'red',
    warning: 'yellow',
  }
  const color = colors?.[level] || colors.log
  console.log(`[${new Date().toISOString()}]`, chalk[color](message))
}
