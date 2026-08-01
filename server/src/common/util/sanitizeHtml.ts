import sanitizeHtml from 'sanitize-html';

export const sanitizeBoardContent = (dirty: string): string =>
  sanitizeHtml(dirty, {
    allowedTags: [
      'p',
      'br',
      'h1',
      'h2',
      'h3',
      'strong',
      'em',
      'u',
      's',
      'span',
      'ol',
      'ul',
      'li',
      'a',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      span: ['style'],
    },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
