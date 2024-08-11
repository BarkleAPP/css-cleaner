// Configuration object with default values
const defaultConfig = {
    maxCssLength: 65536, // 64 KB limit
    allowedProperties: new Set([
      'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align',
      'text-decoration', 'text-transform', 'letter-spacing', 'display', 'width', 'height',
      'max-width', 'max-height', 'min-width', 'min-height', 'margin', 'padding', 'border',
      'background-color', 'opacity', 'box-shadow', 'transform', 'transition', 'background',
      'animation', 'animation-delay', 'animation-direction', 'animation-duration',
      'animation-fill-mode', 'animation-iteration-count', 'animation-name',
      'animation-play-state', 'animation-timing-function', 'cursor', 'pointer-events',
      'user-select', 'visibility', 'word-break', 'word-wrap', 'overflow', 'text-overflow',
      'clip-path', 'filter', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float',
      'clear', 'object-fit', 'object-position', 'content', 'overflow-x', 'overflow-y',
      'text-shadow', 'vertical-align', 'white-space', 'border-radius', 'justify-content',
      'align-items', 'flex-wrap', 'flex-direction', 'flex'
    ]),
    allowedAtRules: new Set(['@media', '@keyframes', '@font-face', '@import']),
    allowedPseudoClasses: new Set([
      ':hover', ':active', ':focus', ':visited', ':first-child', ':last-child',
      ':nth-child', ':nth-of-type', ':not', ':before', ':after'
    ]),
    validateUrl: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    sanitizeUrl: (url) => {
      const allowedDomains = ['fonts.googleapis.com'];
      if (url) {
        const parsedUrl = new URL(url);
        if (allowedDomains.includes(parsedUrl.hostname)) {
          return url;
        }
      }
      return '';
    }
  };
  
  class CssSanitizer {
    constructor(config = {}) {
      this.config = { ...defaultConfig, ...config };
      
      // Convert Set objects to new Sets with merged values
      this.config.allowedProperties = new Set([...defaultConfig.allowedProperties, ...(config.allowedProperties || [])]);
      this.config.allowedAtRules = new Set([...defaultConfig.allowedAtRules, ...(config.allowedAtRules || [])]);
      this.config.allowedPseudoClasses = new Set([...defaultConfig.allowedPseudoClasses, ...(config.allowedPseudoClasses || [])]);
    }
  
    sanitizeProperty(property, value) {
      if (!this.config.allowedProperties.has(property)) {
        return '';
      }
      
      if (property === 'background-image' || property === 'background') {
        const urlMatch = value.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch) {
          const url = urlMatch[1];
          if (this.config.validateUrl(url)) {
            const sanitizedUrl = this.config.sanitizeUrl(url);
            if (sanitizedUrl) {
              return `${property}: url('${sanitizedUrl}');`;
            }
          }
          return '';
        }
      }
      
      return `${property}: ${value};`;
    }
  
    sanitizeCss(css) {
      if (typeof css !== 'string') {
        return '';
      }
      
      css = css.trim();
      if (css === '') {
        return '';
      }
      
      if (css.length > this.config.maxCssLength) {
        css = css.slice(0, this.config.maxCssLength);
      }
      
      // Remove comments
      css = css.replace(/\/\*[\s\S]*?\*\//g, '');
      
      let sanitizedCss = '';
      let nestedLevel = 0;
      let inAtRule = false;
      let currentAtRule = '';
      let buffer = '';
      
      for (let i = 0; i < css.length; i++) {
        const char = css[i];
        
        if (char === '{') {
          nestedLevel++;
          const ruleName = buffer.trim().split(/\s+/)[0];
          
          if (this.config.allowedAtRules.has(ruleName)) {
            inAtRule = true;
            currentAtRule = ruleName;
            sanitizedCss += buffer + char;
          } else if (inAtRule || nestedLevel === 1) {
            sanitizedCss += buffer + char;
          }
          
          buffer = '';
        } else if (char === '}') {
          nestedLevel--;
          
          if (inAtRule) {
            if (nestedLevel === 0) {
              inAtRule = false;
              currentAtRule = '';
            }
            sanitizedCss += buffer + char;
          } else if (nestedLevel === 0) {
            const properties = buffer.split(';').filter(prop => prop.trim() !== '');
            const sanitizedProperties = properties.map(prop => {
              const [property, ...valueParts] = prop.split(':');
              const value = valueParts.join(':').trim();
              return this.sanitizeProperty(property.trim(), value);
            }).filter(prop => prop !== '');
            
            sanitizedCss += sanitizedProperties.join(' ') + char;
          } else {
            sanitizedCss += buffer + char;
          }
          
          buffer = '';
        } else {
          buffer += char;
        }
      }
      
      return sanitizedCss;
    }
  }
  
  export { CssSanitizer };