/**
 * Utility functions for TSTyche reporters.
 */

/**
 * Asserts that a value is of type `never`, used for exhaustive switch checks.
 *
 * This function is used to ensure all cases in a discriminated union are handled.
 * If this function is called at runtime, it means an unhandled case was encountered.
 *
 * @param {never} _value - The value that should be `never` (all cases handled)
 * @param {string} [message] - Error message if assertion fails (defaults to 'Expected value to not exist')
 * @throws {Error} Always throws, as this should never be reached
 * @example
 * ```javascript
 * switch (event[0]) {
 *   case 'test:pass': handlePass(); break;
 *   case 'test:fail': handleFail(); break;
 *   default: assertTypeIsNever(event); // TypeScript error if cases missing
 * }
 * ```
 */
export function assertTypeIsNever (_value, message = 'Expected value to not exist') {
  throw new Error(message);
}
