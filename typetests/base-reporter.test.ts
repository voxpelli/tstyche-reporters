import { describe, test } from 'tstyche';
import { TstycheBaseReporter } from '../lib/tstyche-base-reporter.js';

describe('TstycheBaseReporter', () => {
  test('can be instantiated with resolved config', () => {
    const config = { /* resolved config object */ } as any;
    const reporter = new TstycheBaseReporter(config);

    // Type checks will verify the API is correct
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _r = reporter;
  });
});
