import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { TstycheBaseReporter, TstycheDotReporter, TstycheMochaReporter } from '../index.js';

describe('tstyche-reporters', () => {
  describe('TstycheBaseReporter', () => {
    it('should instantiate with resolved config', () => {
      const config = {};
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheBaseReporter(config);

      assert.ok(reporter);
      assert.strictEqual(reporter.resolvedConfig, config);
    });

    it('should have a format property', () => {
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheBaseReporter({});

      assert.ok(reporter.format);
    });

    it('should use markdown mode when TSTYCHE_REPORTERS_MARKDOWN is true', () => {
      // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
      const originalValue = process.env['TSTYCHE_REPORTERS_MARKDOWN'];

      try {
        // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
        process.env['TSTYCHE_REPORTERS_MARKDOWN'] = 'true';
        // @ts-expect-error Test fixture, not a full ResolvedConfig
        const reporter = new TstycheBaseReporter({});

        assert.ok(reporter.format);
        // Verify markdown mode is enabled (chalk is undefined in markdown mode)
        assert.strictEqual(reporter.format.chalk, undefined);
      } finally {
        if (originalValue === undefined) {
          // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
          delete process.env['TSTYCHE_REPORTERS_MARKDOWN'];
        } else {
          // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
          process.env['TSTYCHE_REPORTERS_MARKDOWN'] = originalValue;
        }
      }
    });

    it('should use CLI mode when TSTYCHE_REPORTERS_MARKDOWN is not set', () => {
      // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
      const originalValue = process.env['TSTYCHE_REPORTERS_MARKDOWN'];

      try {
        // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
        delete process.env['TSTYCHE_REPORTERS_MARKDOWN'];
        // @ts-expect-error Test fixture, not a full ResolvedConfig
        const reporter = new TstycheBaseReporter({});

        assert.ok(reporter.format);
        // Verify CLI mode is enabled (chalk is defined in CLI mode)
        assert.ok(reporter.format.chalk);
      } finally {
        if (originalValue !== undefined) {
          // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
          process.env['TSTYCHE_REPORTERS_MARKDOWN'] = originalValue;
        }
      }
    });

    it('should use CLI mode when TSTYCHE_REPORTERS_MARKDOWN is false', () => {
      // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
      const originalValue = process.env['TSTYCHE_REPORTERS_MARKDOWN'];

      try {
        // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
        process.env['TSTYCHE_REPORTERS_MARKDOWN'] = 'false';
        // @ts-expect-error Test fixture, not a full ResolvedConfig
        const reporter = new TstycheBaseReporter({});

        assert.ok(reporter.format);
        // Verify CLI mode is enabled (chalk is defined in CLI mode)
        assert.ok(reporter.format.chalk);
      } finally {
        if (originalValue === undefined) {
          // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
          delete process.env['TSTYCHE_REPORTERS_MARKDOWN'];
        } else {
          // eslint-disable-next-line n/no-process-env -- Testing environment variable behavior
          process.env['TSTYCHE_REPORTERS_MARKDOWN'] = originalValue;
        }
      }
    });
  });

  describe('TstycheDotReporter', () => {
    it('should extend TstycheBaseReporter', () => {
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheDotReporter({});

      assert.ok(reporter instanceof TstycheBaseReporter);
    });

    it('should instantiate with resolved config', () => {
      const config = {};
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheDotReporter(config);

      assert.ok(reporter);
      assert.strictEqual(reporter.resolvedConfig, config);
    });
  });

  describe('TstycheMochaReporter', () => {
    it('should extend TstycheBaseReporter', () => {
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheMochaReporter({});

      assert.ok(reporter instanceof TstycheBaseReporter);
    });

    it('should instantiate with resolved config', () => {
      const config = {};
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheMochaReporter(config);

      assert.ok(reporter);
      assert.strictEqual(reporter.resolvedConfig, config);
    });
  });
});
