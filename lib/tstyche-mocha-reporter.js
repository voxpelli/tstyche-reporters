/* eslint-disable no-console */

import { TstycheBaseReporter } from './tstyche-base-reporter.js';

/** @import { TstycheEventPayload, TstycheErrorEvents } from './tstyche-base-reporter.js' */

/**
 * @typedef Describe
 * @property {string} name
 */

/**
 * TSTyche reporter that outputs Mocha-style test results in both CLI and Markdown formats.
 *
 * This reporter consumes TSTyche test events and produces hierarchical, formatted output
 * that works in both terminal environments (with colors and symbols via chalk) and
 * Markdown/CI environments (with Unicode symbols and Markdown syntax).
 *
 * ## Features
 *
 * - **Hierarchical output**: Properly indented nested describe blocks
 * - **Compiler version header**: Prints TypeScript version when it changes (useful for multi-version runs)
 * - **Symbol handling**: Uses `format.logSymbols` for automatic CLI/Markdown conversion
 *   - CLI: ✔ (checkmark), ✖ (cross) with colors
 *   - Markdown: :white_check_mark:, :stop_sign: emoji
 * - **Intelligent coloring**: Only applies colors when `format.chalk` is available
 * - **GitHub CI support**: Detects CI environment and outputs Markdown automatically
 * - **Streaming output**: Tests are printed as they execute, not buffered
 *
 * ## Summary
 *
 * This reporter focuses on test output formatting and delegates summary reporting
 * to the built-in `summary` reporter. Pair with the `summary` reporter in configuration.
 *
 * @see {@link https://github.com/voxpelli/node-test-pretty-reporter} - Reference implementation
 * @see {@link https://github.com/voxpelli/markdown-or-chalk} - Dual-mode output formatting
 * @see {@link https://tstyche.org/guides/reporters} - TSTyche reporter spec
 *
 * ## Example Usage
 *
 * ```js
 * // In tstyche.config.json
 * {
 *   "reporters": ["./tstyche-mocha-reporter.js", "summary"]
 * }
 * ```
 *
 * The reporter auto-detects GitHub Actions/CI environments and outputs Markdown.
 * For local development, it uses colored CLI output.
 */
export default class TstycheMochaReporter extends TstycheBaseReporter {
  /**
   * Initialize the reporter with resolved TSTyche configuration.
   *
   * Creates a `MarkdownOrChalk` formatter that intelligently chooses between:
   * - **CLI mode** (default): Colors, Unicode symbols, terminal formatting
   * - **Markdown mode** (CI detected): Emoji symbols, Markdown syntax, plain text
   *
   * @param {import("tstyche/tstyche").ResolvedConfig} resolvedConfig - TSTyche configuration
   * @see {@link https://github.com/voxpelli/markdown-or-chalk#constructor} - MarkdownOrChalk constructor
   */
  constructor (resolvedConfig) {
    super(resolvedConfig);

    /** @type {Describe[]} */
    this.currentDescribeStack = [];
  }

  /**
   * Handle run:start event - reset file/describe tracking.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'run:start'>} payload - Event payload
   */
  _onRunStart (payload) {
    super._onRunStart(payload);
    this.currentDescribeStack = [];
  }

  /**
   * Handle file:start event - reset describe stack.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'file:start'>} _payload - Event payload
   */
  _onFileStart (_payload) {
    this.currentDescribeStack = [];
  }

  /**
   * Handle describe:start event - create describe block and stream output.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'describe:start'>} payload - Event payload
   */
  _onDescribeStart (payload) {
    const result = payload.result || {};
    const describeObj = (result.describe ?? {});
    /** @type {Describe} */
    const describe = {
      name: (describeObj.name ?? 'describe'),
    };

    this.currentDescribeStack.push(describe);
    // Stream: Print describe block as it starts
    const indent = this.currentDescribeStack.length - 1;
    this.#printDescribeStart(describe, indent);
  }

  /**
   * Handle describe:end event - pop describe from stack.
   *
   * @protected
   * @override
   * @param {unknown} _payload - Event payload
   */
  _onDescribeEnd (_payload) {
    this.currentDescribeStack.pop();
  }

  /**
   * Handle test:pass event - record and stream test result.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'test:pass'>} payload - Event payload
   */
  _onTestPass (payload) {
    this.#recordTest(payload, true);
  }

  /**
   * Handle test:fail event - record and stream test result.
   *
   * @protected
   * @override
   * @param {TstycheEventPayload<'test:fail'>} payload - Event payload
   */
  _onTestFail (payload) {
    this.#recordTest(payload, false);
  }

  /**
   * Handle run:end event - flush with blank line.
   *
   * @protected
   * @override
   * @param {unknown} _payload - Event payload
   */
  _onRunEnd (_payload) {
    console.log('');
  }

  /**
   * Handle error event - ensure clean line before error output.
   *
   * @protected
   * @override
   * @param {TstycheErrorEvents} reporterEvent
   */
  _onError (reporterEvent) {
    // Ensure we're on a fresh line before printing errors
    console.log('');
    super._onError(reporterEvent);
  }

  /**
   * Record a test result and stream output.
   *
   * @param {TstycheEventPayload<'test:pass'> | TstycheEventPayload<'test:fail'>} payload - Event payload with result
   * @param {boolean} passed - Whether test passed
   */
  #recordTest (payload, passed) {
    const result = payload.result || {};
    const testObj = (result.test ?? {});
    const description = (testObj.name ?? 'test');

    // Stream: Print test result immediately
    const indent = this.currentDescribeStack.length;
    this.#printTest(description, passed, indent);
  }

  /**
   * Stream-print a describe block header.
   *
   * @param {Describe} describe - The describe block
   * @param {number} level - Nesting level (0 = top-level)
   */
  #printDescribeStart (describe, level) {
    const header = this.format.header(describe.name, level === 0 ? 2 : 3);
    console.log(header);
  }

  /**
   * Stream-print a single test result.
   *
   * @param {string} description - Test description
   * @param {boolean} passed - Whether test passed
   * @param {number} indent - Indentation level (nesting depth)
   */
  #printTest (description, passed, indent) {
    const mark = passed ? this.format.logSymbols.success : this.format.logSymbols.error;
    let testLine = `${mark} ${description}`;

    if (this.format.chalk) {
      testLine = passed
        ? this.format.chalk.gray(testLine)
        : this.format.chalk.red(testLine);
    }

    // Only apply indentation in CLI mode (chalk available) to avoid Markdown interpretation
    const output = this.format.chalk && indent > 0
      ? this.format.indent(testLine, indent)
      : testLine;
    console.log(output);
  }
}
