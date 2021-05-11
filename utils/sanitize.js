/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @function sanitize
 * @param {string} input - Input to check
 * @param {string} output - Output to check
 * @returns {string | void} - Returns sanitized output
 */
export function sanitize(input, output) {
  if (!input || !output) {
    return;
  }
  const zws = String.fromCharCode(8203);
  return output
    .replace(
      new RegExp(input.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&'), 'giu'),
      '「ｒｅｄａｃｔｅｄ」'
    )
    .replace(/`/gu, `\`${zws}`)
    .replace(/@/gu, `@${zws}`);
}
