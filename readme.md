# CSS Sanitizer

A lightweight, configurable CSS sanitizer to prevent XSS attacks by filtering out potentially harmful CSS properties and values.

## Installation

```bash
npm install @barkleapp/css-sanitizer
```

## Usage

### Basic Usage

```javascript
import { CssSanitizer } from 'css-sanitizer';

const sanitizer = new CssSanitizer();

const unsanitizedCss = `
  body {
    background: url('https://example.com/image.jpg');
    color: red;
  }
`;

const sanitizedCss = sanitizer.sanitizeCss(unsanitizedCss);
console.log(sanitizedCss);
```

### Custom Configuration

You can customize the sanitizer's behavior by passing a configuration object:

```javascript
const customSanitizer = new CssSanitizer({
  maxCssLength: 100000,
  allowedProperties: ['custom-property'],
  allowedAtRules: ['@custom-media'],
  allowedPseudoClasses: [':has'],
  validateUrl: (url) => {
    // Custom URL validation logic
    return url.startsWith('https://');
  },
  sanitizeUrl: (url) => {
    // Custom URL sanitization logic
    const allowedDomains = ['example.com', 'trusteddomain.com'];
    const parsedUrl = new URL(url);
    if (allowedDomains.includes(parsedUrl.hostname)) {
      return url;
    }
    return '';
  }
});
```

## API

### `CssSanitizer`

The main class for sanitizing CSS.

#### Constructor

```javascript
new CssSanitizer(config)
```

- `config` (optional): An object with the following properties:
  - `maxCssLength` (number): Maximum allowed length of CSS string.
  - `allowedProperties` (Array<string>): Additional CSS properties to allow.
  - `allowedAtRules` (Array<string>): Additional at-rules to allow.
  - `allowedPseudoClasses` (Array<string>): Additional pseudo-classes to allow.
  - `validateUrl` (function): Custom function to validate URLs.
  - `sanitizeUrl` (function): Custom function to sanitize URLs.

#### Methods

##### `sanitizeCss(css: string): string`

Sanitizes the input CSS string by removing potentially harmful properties and values.

- `css`: The CSS string to sanitize.
- Returns: The sanitized CSS string.

## Configuration Options

### `maxCssLength` (default: 65536)

Maximum allowed length of the CSS string. If the input CSS exceeds this length, it will be truncated.

### `allowedProperties` (default: see code)

A set of allowed CSS properties. You can add to this list by providing an array of additional properties in the constructor.

### `allowedAtRules` (default: ['@media', '@keyframes', '@font-face', '@import'])

A set of allowed at-rules. You can add to this list by providing an array of additional at-rules in the constructor.

### `allowedPseudoClasses` (default: [':hover', ':active', ':focus', ':visited', ':first-child', ':last-child', ':nth-child', ':nth-of-type', ':not', ':before', ':after'])

A set of allowed pseudo-classes. You can add to this list by providing an array of additional pseudo-classes in the constructor.

### `validateUrl` (function)

A function that takes a URL string and returns a boolean indicating whether the URL is valid. By default, it checks if the string can be parsed as a valid URL.

### `sanitizeUrl` (function)

A function that takes a URL string and returns either the sanitized URL string or an empty string if the URL is not allowed. By default, it allows URL from 'fonts.googleapis.com'.

## License

MIT