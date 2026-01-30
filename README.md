# @voxpelli/tstyche-reporters

Custom [TSTyche](https://tstyche.org/) reporters with Mocha-style and dot-style output, featuring environment-controlled Markdown/CLI dual-mode formatting.

[![npm version](https://img.shields.io/npm/v/@voxpelli/tstyche-reporters.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/tstyche-reporters)
[![npm downloads](https://img.shields.io/npm/dm/@voxpelli/tstyche-reporters.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/tstyche-reporters)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

## Features

- 🎨 **Dual-mode output** – Controlled via environment variable for CLI (colors/symbols) vs Markdown (emoji)
- 🔧 **Environment control** – Set `TSTYCHE_REPORTERS_MARKDOWN=true` to enable Markdown output
- 📊 **Two reporter styles** – Mocha-style hierarchical output or compact dot notation
- 🔄 **Multi-version support** – Displays TypeScript version headers when testing against multiple compiler versions
- ⚡ **Streaming output** – Tests are printed as they execute, not buffered
- 🧩 **Extensible base class** – Create your own custom reporters

## Installation

```bash
npm install @voxpelli/tstyche-reporters
```

## Usage

### Mocha Reporter

Hierarchical, readable test output with indented describe blocks:

```bash
npx tstyche --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-mocha-reporter.js,summary
```

Or in `tstyche.config.json`:

```json
{
  "reporters": ["./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-mocha-reporter.js", "summary"]
}
```

**CLI Output:**

```
# uses TypeScript 5.8.3 with ./tsconfig.json

## MyComponent
  ✔ should accept valid props
  ✔ should reject invalid props
  ✖ should handle edge case

## AnotherComponent
  ✔ should work correctly
```

**Markdown Output:**

```markdown
# uses TypeScript 5.8.3 with ./tsconfig.json

## MyComponent
:white_check_mark: should accept valid props
:white_check_mark: should reject invalid props
:stop_sign: should handle edge case

## AnotherComponent
:white_check_mark: should work correctly
```

### Dot Reporter

Compact dot-style output, ideal for multi-version test runs:

```bash
npx tstyche --target '5.4 || 5.8 || next' --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-dot-reporter.js,summary
```

**Output:**

```
# uses TypeScript 5.4.5 with ./tsconfig.json
Error: Invalid configuration...
F.F..F.F.F.F.F.F......................
# uses TypeScript 5.8.3 with ./tsconfig.json
........................................................
# uses TypeScript 5.9.3 with ./tsconfig.json
........................................................
```

- `.` = Pass
- `F` = Fail
- Lines wrap at 80 characters

## API

### TstycheMochaReporter

Mocha-style hierarchical reporter with streaming output.

```javascript
import { TstycheMochaReporter } from '@voxpelli/tstyche-reporters';
```

#### Features

- Hierarchical output with properly indented describe blocks
- Compiler version headers when TypeScript version changes
- Automatic CLI/Markdown mode switching
- Symbol handling: ✔/✖ in CLI, :white_check_mark:/:stop_sign: in Markdown

### TstycheDotReporter

Compact dot-style reporter optimized for multi-version runs.

```javascript
import { TstycheDotReporter } from '@voxpelli/tstyche-reporters';
```

#### Features

- One character per test (`.` = pass, `F` = fail)
- Compiler version headers between different TypeScript versions
- 80-character line wrapping
- Minimal output for quick visual scanning

### TstycheBaseReporter

Abstract base class for creating custom TSTyche reporters.

```javascript
import { TstycheBaseReporter } from '@voxpelli/tstyche-reporters';

class MyCustomReporter extends TstycheBaseReporter {
  _onTestPass(payload) {
    // Custom pass handling
  }

  _onTestFail(payload) {
    // Custom fail handling
  }

  _onRunEnd(payload) {
    // Custom run end handling
  }
}

export default MyCustomReporter;
```

#### Constructor

```typescript
new TstycheBaseReporter(resolvedConfig: ResolvedConfig)
```

- `resolvedConfig` – TSTyche's resolved configuration object

#### Protected Properties

| Property | Type | Description |
|----------|------|-------------|
| `resolvedConfig` | `ResolvedConfig` | TSTyche configuration |
| `format` | `MarkdownOrChalk` | Dual-mode formatter instance |
| `currentCompilerVersion` | `string \| undefined` | Current TypeScript version being tested |
| `lastShownCompilerVersion` | `string \| undefined` | Last version header printed |

#### Abstract Methods (must override)

| Method | Parameters | Description |
|--------|------------|-------------|
| `_onTestPass` | `payload: TstycheEventPayload<'test:pass'>` | Handle passing test |
| `_onTestFail` | `payload: TstycheEventPayload<'test:fail'>` | Handle failing test |
| `_onRunEnd` | `payload: TstycheEventPayload<'run:end'>` | Handle run completion |

#### Optional Override Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `_onRunStart` | `payload` | Handle run start (resets state) |
| `_onProjectUses` | `payload` | Handle compiler version change |
| `_onFileStart` | `payload` | Handle file start |
| `_onDescribeStart` | `payload` | Handle describe block start |
| `_onDescribeEnd` | `payload` | Handle describe block end |
| `_onError` | `reporterEvent` | Handle error events |
| `_beforePrintCompilerVersion` | – | Hook before version header |
| `_onNonImplementedEvent` | `reporterEvent` | Handle unimplemented events |

#### Utility Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `_formatDiagnostic` | `diagnostic: Diagnostic` | `string` | Format TSTyche/TypeScript diagnostic |
| `_printErrors` | `payload` | `void` | Print error diagnostics |
| `_printCompilerVersion` | – | `void` | Print TypeScript version header |

### Type Exports

```typescript
import type {
  TstycheEvent,
  TstycheEventPayload,
  TstycheErrorEvents,
  TstycheNonImplementedEvents,
} from '@voxpelli/tstyche-reporters';
```

## Output Mode Control

The reporters support two output modes:

- **CLI mode** (default): Uses ANSI colors, terminal symbols (✔/✖), and chalk formatting
- **Markdown mode**: Uses plain text with emoji symbols (:white_check_mark:/:stop_sign:) and markdown formatting

To enable Markdown mode, set the environment variable:

```bash
export TSTYCHE_REPORTERS_MARKDOWN=true
npx tstyche --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-mocha-reporter.js,summary
```

Or inline:

```bash
TSTYCHE_REPORTERS_MARKDOWN=true npx tstyche --reporters ./node_modules/@voxpelli/tstyche-reporters/lib/tstyche-mocha-reporter.js,summary
```

## Related Projects

- [TSTyche](https://tstyche.org/) – Type testing tool for TypeScript
- [markdown-or-chalk](https://github.com/voxpelli/markdown-or-chalk) – Dual-mode CLI/Markdown formatting
- [node-test-pretty-reporter](https://github.com/voxpelli/node-test-pretty-reporter) – Similar reporter for Node.js test runner
