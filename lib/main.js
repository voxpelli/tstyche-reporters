/**
 * @module @voxpelli/tstyche-reporters
 * Custom TSTyche reporters with Mocha-style and dot-style output.
 *
 * Features:
 * - Dual-mode output (CLI colors/symbols or Markdown emoji)
 * - Environment variable control for output mode
 * - TypeScript version headers for multi-version testing
 * - Extensible base class for custom reporters
 * @example
 * ```bash
 * # Mocha-style reporter
 * npx tstyche --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-mocha-reporter.js,summary
 *
 * # Dot-style reporter
 * npx tstyche --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-dot-reporter.js,summary
 * ```
 * @example
 * ```javascript
 * // Creating a custom reporter
 * import { TstycheBaseReporter } from '@voxpelli/tstyche-reporters';
 *
 * class MyReporter extends TstycheBaseReporter {
 *   _onTestPass(payload) { console.log('✓', payload.result.test.name); }
 *   _onTestFail(payload) { console.log('✗', payload.result.test.name); }
 *   _onRunEnd() { console.log('Done!'); }
 * }
 *
 * export default MyReporter;
 * ```
 */
export * from './tstyche-base-reporter.js';
export { default as TstycheDotReporter } from './tstyche-dot-reporter.js';
export { default as TstycheMochaReporter } from './tstyche-mocha-reporter.js';
