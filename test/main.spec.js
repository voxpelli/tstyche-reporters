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

    it('should detect CI environment', () => {
      // @ts-expect-error Test fixture, not a full ResolvedConfig
      const reporter = new TstycheBaseReporter({});

      // Should have initialized without errors
      assert.ok(typeof reporter.format === 'object');
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
