/* eslint-disable no-console */

import { MarkdownOrChalk } from 'markdown-or-chalk';
import { assertTypeIsNever } from './utils.js';

/** @import { Diagnostic, ReporterEvent, ResolvedConfig } from 'tstyche/tstyche' */

/**
 * @template {ReporterEvent[0]} T
 * @typedef {Extract<ReporterEvent, [T, any]>} TstycheEvent
 */

/**
 * @template {ReporterEvent[0]} T
 * @typedef {TstycheEvent<T>[1]} TstycheEventPayload
 */

/** @typedef {TstycheEvent<"store:error" | "project:error" | "file:error" | "directive:error" | "collect:error" | "test:error" | "expect:error" | "suppressed:error" | "watch:error">} TstycheErrorEvents */

/** @typedef {TstycheEvent<"store:adds" | "target:start" | "target:end" | "file:end" | "collect:start" | "collect:node" | "collect:end" | "test:start" | "test:skip" | "test:fixme" | "test:todo" | "expect:start" | "expect:fail" | "expect:pass" | "expect:skip" | "expect:fixme" | "suppressed:match" | "suppressed:ignore">} TstycheNonImplementedEvents */

/**
 * Base class for TSTyche reporters.
 *
 * Provides shared functionality for error handling, diagnostics formatting,
 * and output mode detection. Subclasses handle specific reporting formats.
 *
 * ## Features
 *
 * - **Error handling**: Comprehensive error event handling across all phases
 * - **Diagnostic formatting**: Extracts and formats error messages from TSTyche/TypeScript
 * - **Environment-based mode**: Use TSTYCHE_REPORTERS_MARKDOWN env var to control output mode
 * - **Dual-mode output**: CLI (colors/symbols) or Markdown (emoji/plain text)
 *
 * @see {@link https://github.com/voxpelli/markdown-or-chalk} - Dual-mode formatting
 * @abstract
 */
export class TstycheBaseReporter {
  /**
   * Initialize the base reporter with resolved TSTyche configuration.
   *
   * @param {ResolvedConfig} resolvedConfig - TSTyche configuration
   */
  constructor (resolvedConfig) {
    /** @type {ResolvedConfig} */
    this.resolvedConfig = resolvedConfig;

    const useMarkdown = this._shouldUseMarkdownMode();
    /** @type {MarkdownOrChalk} */
    this.format = new MarkdownOrChalk(useMarkdown);

    /** @type {string | undefined} */
    this.currentCompilerVersion = undefined;
    /** @type {string | undefined} */
    this.lastShownCompilerVersion = undefined;
  }

  /**
   * Determine if markdown mode should be enabled.
   *
   * Checks the TSTYCHE_REPORTERS_MARKDOWN environment variable.
   * Set to 'true' to enable markdown output, 'false' to disable.
   *
   * Subclasses can override this method to customize the logic for determining
   * when to use markdown mode.
   *
   * @protected
   * @returns {boolean} True if markdown mode should be enabled
   */
  _shouldUseMarkdownMode () {
    // eslint-disable-next-line n/no-process-env -- Environment-based markdown mode detection
    return process.env['TSTYCHE_REPORTERS_MARKDOWN'] === 'true';
  }

  /**
   * Format a diagnostic message from TSTyche or TypeScript.
   *
   * @protected
   * @param {Diagnostic} diagnostic - The diagnostic object
   * @returns {string} Formatted message
   */
  _formatDiagnostic (diagnostic) {
    const text = Array.isArray(diagnostic.text) ? diagnostic.text : [diagnostic.text];
    const code = diagnostic.code ? ` (${diagnostic.code})` : '';
    const category = diagnostic.category ? ` [${diagnostic.category}]` : '';

    const lines = text.map((line, index) => {
      const codeInline = index === 0 ? code : '';
      return line + codeInline;
    });

    let output = lines.join('\n') + category;

    if (diagnostic.related && diagnostic.related.length > 0) {
      output += '\n' + diagnostic.related
        .map((related) => '  ' + this._formatDiagnostic(related))
        .join('\n');
    }

    return output;
  }

  /**
   * Print error diagnostics from an event payload.
   *
   * @protected
   * @param {TstycheErrorEvents[1]} payload - Event payload containing diagnostics
   * @returns {void}
   */
  _printErrors (payload) {
    for (const diagnostic of payload.diagnostics) {
      const message = this._formatDiagnostic(diagnostic);
      const errorLine = `Error: ${message}`;
      console.error(this.format.chalk ? this.format.chalk.red(errorLine) : errorLine);
    }
  }

  /**
   * Print the compiler version header.
   *
   * @protected
   * @returns {void}
   */
  _printCompilerVersion () {
    const header = this.format.header(`uses TypeScript ${this.currentCompilerVersion} with ./tsconfig.json`, 1);
    console.log(header);
  }

  /**
   * Hook called before printing compiler version header.
   *
   * Subclasses can override to flush output or perform cleanup before the header.
   * Default implementation does nothing.
   *
   * @protected
   * @returns {void}
   */
  _beforePrintCompilerVersion () {
    // Default: no action (override in subclasses if needed)
  }

  /**
   * Handle error event - called when an error event is detected.
   *
   * Subclasses can override to add custom behavior before errors are printed.
   *
   * @protected
   * @param {TstycheErrorEvents} reporterEvent
   * @returns {void}
   */
  _onError (reporterEvent) {
    this._printErrors(reporterEvent[1]);
  }

  /**
   * Handle non-implemented event - called when an event is not yet handled.
   *
   * Subclasses can override to add custom behavior for unhandled events.
   *
   * @protected
   * @param {TstycheNonImplementedEvents} _reporterEvent - The event name
   * @returns {void}
   */
  _onNonImplementedEvent (_reporterEvent) {
    // Default: no action
  }

  /**
   * Handle run:start event - reset reporter state.
   *
   * @protected
   * @param {TstycheEventPayload<'run:start'>} _payload - Event payload
   * @returns {void}
   */
  _onRunStart (_payload) {
    this.currentCompilerVersion = undefined;
    this.lastShownCompilerVersion = undefined;
  }

  /**
   * Handle project:uses event - update compiler version.
   *
   * @protected
   * @param {TstycheEventPayload<'project:uses'>} payload - Event payload
   * @returns {void}
   */
  _onProjectUses (payload) {
    this.currentCompilerVersion = payload.compilerVersion;
    if (this.currentCompilerVersion !== this.lastShownCompilerVersion) {
      this._beforePrintCompilerVersion();
      this._printCompilerVersion();
      this.lastShownCompilerVersion = this.currentCompilerVersion;
    }
  }

  /**
   * Handle test:pass event - subclasses override as needed.
   *
   * @abstract
   * @protected
   * @param {TstycheEventPayload<'test:pass'>} _payload - Event payload
   * @returns {void}
   */
  _onTestPass (_payload) {
    throw new Error('_onTestPass() must be implemented by subclass');
  }

  /**
   * Handle test:fail event - subclasses override as needed.
   *
   * @abstract
   * @protected
   * @param {TstycheEventPayload<'test:fail'>} _payload - Event payload
   * @returns {void}
   */
  _onTestFail (_payload) {
    throw new Error('_onTestFail() must be implemented by subclass');
  }

  /**
   * Handle file:start event - subclasses override as needed.
   *
   * @protected
   * @param {TstycheEventPayload<'file:start'>} _payload - Event payload
   * @returns {void}
   */
  _onFileStart (_payload) {
    // Default: no action (optional for reporters)
  }

  /**
   * Handle describe:start event - subclasses override as needed.
   *
   * @protected
   * @param {TstycheEventPayload<'describe:start'>} _payload - Event payload
   * @returns {void}
   */
  _onDescribeStart (_payload) {
    // Default: no action (optional for reporters)
  }

  /**
   * Handle describe:end event - subclasses override as needed.
   *
   * @protected
   * @param {TstycheEventPayload<'describe:end'>} _payload - Event payload
   * @returns {void}
   */
  _onDescribeEnd (_payload) {
    // Default: no action (optional for reporters)
  }

  /**
   * Handle run:end event - subclasses override as needed.
   *
   * @abstract
   * @protected
   * @param {TstycheEventPayload<'run:end'>} _payload - Event payload
   * @returns {void}
   */
  _onRunEnd (_payload) {
    throw new Error('_onRunEnd() must be implemented by subclass');
  }

  /**
   * Handle a TSTyche reporter event.
   *
   * Main event dispatcher that routes events to appropriate handlers.
   * Subclasses can override individual handler methods to customize behavior.
   *
   * @param {ReporterEvent} reporterEvent - TSTyche event tuple
   * @returns {void}
   */
  on (reporterEvent) {
    // Route other events to appropriate handlers
    switch (reporterEvent[0]) {
      case 'store:error':
      case 'project:error':
      case 'file:error':
      case 'directive:error':
      case 'collect:error':
      case 'test:error':
      case 'expect:error':
      case 'suppressed:error':
      case 'watch:error':
        this._onError(reporterEvent);
        break;

      case 'run:start':
        this._onRunStart(reporterEvent[1]);
        break;

      case 'project:uses':
        this._onProjectUses(reporterEvent[1]);
        break;

      case 'file:start':
        this._onFileStart(reporterEvent[1]);
        break;

      case 'describe:start':
        this._onDescribeStart(reporterEvent[1]);
        break;

      case 'describe:end':
        this._onDescribeEnd(reporterEvent[1]);
        break;

      case 'test:pass':
        this._onTestPass(reporterEvent[1]);
        break;

      case 'test:fail':
        this._onTestFail(reporterEvent[1]);
        break;

      case 'run:end':
        this._onRunEnd(reporterEvent[1]);
        break;

      case 'store:adds':
      case 'target:start':
      case 'target:end':
      case 'file:end':
      case 'collect:start':
      case 'collect:node':
      case 'collect:end':
      case 'test:start':
      case 'test:skip':
      case 'test:fixme':
      case 'test:todo':
      case 'expect:start':
      case 'expect:fail':
      case 'expect:pass':
      case 'expect:skip':
      case 'expect:fixme':
      case 'suppressed:match':
      case 'suppressed:ignore':
        this._onNonImplementedEvent(reporterEvent);
        break;

      default:
        assertTypeIsNever(reporterEvent);
    }
  }
}
