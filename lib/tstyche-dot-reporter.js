/* eslint-disable no-console */

import { TstycheBaseReporter } from './tstyche-base-reporter.js';

/** @import { TstycheEventPayload, TstycheErrorEvents } from './tstyche-base-reporter.js' */

/**
 * TSTyche dot reporter with compiler version headers.
 *
 * Outputs compact dot-style test results (one dot per test) with TypeScript version
 * headers when testing multiple compiler versions. Optimized for `test:tstyche` script.
 *
 * ## Features
 *
 * - **Dot notation**: Pass = `.`, Fail = `F`, Pending = `*`
 * - **Compiler version header**: Prints TypeScript version when it changes
 * - **Compact output**: Minimal verbosity, ideal for multi-version runs
 * - **GitHub CI support**: Detects CI environment and outputs Markdown
 * - **Streaming output**: Tests rendered in real-time
 * - **Error handling**: Surfaces all error events with formatted diagnostics
 *
 * @see {@link https://github.com/mochajs/mocha/blob/main/lib/reporters/dot.js} - Mocha dot reporter
 * @see {@link https://github.com/voxpelli/markdown-or-chalk} - Dual-mode formatting
 *
 * ## Example Usage
 *
 * ```bash
 * npx tstyche --target '5.4 || 5.8 || next' --reporters summary,./tstyche-dot-reporter.js
 * ```
 *
 * Output:
 * ```
 * # TypeScript 5.4.5
 * Error: Invalid configuration...
 * F.F..F.F.F.F.F.F......................
 * # TypeScript 5.8.3
 * ........................................................
 * # TypeScript 5.9.3
 * ........................................................
 * ```
 */
export default class TstycheDotReporter extends TstycheBaseReporter {
  /**
   * Initialize the reporter with resolved TSTyche configuration.
   *
   * @param {import("tstyche/tstyche").ResolvedConfig} resolvedConfig - TSTyche configuration
   */
  constructor (resolvedConfig) {
    super(resolvedConfig);
    /** @type {number} */
    this.dotsOnCurrentLine = 0;
  }

  /**
   * Handle run:start event - reset dot tracking.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'run:start'>} payload - Event payload
   */
  _onRunStart (payload) {
    super._onRunStart(payload);
    this.dotsOnCurrentLine = 0;
  }

  /**
   * Hook to flush dots before printing compiler version header.
   *
   * @protected
   * @override
   */
  _beforePrintCompilerVersion () {
    this.#flushDots();
  }

  /**
   * Write a single character to the dot line with wrapping.
   *
   * @param {string} char - Character to write ('.' for pass, 'F' for fail)
   */
  #writeDotChar (char) {
    process.stdout.write(char);
    this.dotsOnCurrentLine++;
    // Wrap at 80 characters
    if (this.dotsOnCurrentLine >= 80) {
      console.log('');
      this.dotsOnCurrentLine = 0;
    }
  }

  /**
   * Flush any pending dots with a newline.
   */
  #flushDots () {
    if (this.dotsOnCurrentLine > 0) {
      console.log('');
      this.dotsOnCurrentLine = 0;
    }
  }

  /**
   * Handle test:pass event - print dot.
   *
   * @protected
   * @override
   * @param {unknown} _payload - Event payload
   */
  _onTestPass (_payload) {
    this.#writeDotChar('.');
  }

  /**
   * Handle test:fail event - print F.
   *
   * @protected
   * @override
   * @param {unknown} _payload - Event payload
   */
  _onTestFail (_payload) {
    this.#writeDotChar('F');
  }

  /**
   * Handle run:end event - flush dots and blank lines.
   *
   * @protected
   * @override
   * @param {unknown} _payload - Event payload
   */
  _onRunEnd (_payload) {
    this.#flushDots();
    console.log('');
    console.log('');
  }

  /**
   * Handle error event - flush dots before printing errors.
   *
   * @protected
   * @override
   * @param {TstycheErrorEvents} reporterEvent
   */
  _onError (reporterEvent) {
    this.#flushDots();
    super._onError(reporterEvent);
  }
}
