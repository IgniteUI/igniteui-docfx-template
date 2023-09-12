// highlight-custom.tsx
import hljs from 'highlight.js';
const hljsRazor = require('highlightjs-cshtml-razor');
hljs.registerLanguage("cshtml-razor", hljsRazor);

hljs.registerLanguage('tsx', function (hljs) {
  const TSX_KEYWORDS = {
    keyword:
      // TypeScript Keywords
      'render abstract any as async await boolean break case catch class continue const ' +
      'constructor declare default delete do else enum export extends false ' +
      'finally for from function get if implements import in infer instanceof ' +
      'interface keyof let module namespace never new null number object ' +
      'package private protected public readonly require global return set ' +
      'static string super switch this throw true try typeof undefined ' +
      'unique var void while with yield' +
      // JSX Keywords
      'JSX JSX.Element JSXElement JSXFragment JSXText JSXOpeningElement JSXClosingElement ' +
      'JSXAttribute JSXSpreadAttribute JSXExpressionContainer JSXSpreadChild ' +
      'JSXMemberExpression JSXNamespacedName JSXEmptyExpression JSXIdentifier ' +
      'JSXSpreadAttribute JSXSpreadChild ' +
      // React Keywords
      'React.Component React ReactDOM createRoot ' +
      // Additional TSX-related keywords
      'Props State',
  };

  // TypeScript and JSX-related syntax definitions
  const TSX_CONTAINS = [
    hljs!.COMMENT(
      // Single-line and multi-line comments
      '/\\*\\*',
      '\\*/',
      {
        relevance: 0,
        contains: [
          {
            className: 'doctag',
            begin: '@\\w+',
            relevance: 0,
          },
        ],
      }
    ),
    hljs!.C_LINE_COMMENT_MODE,
    hljs!.C_BLOCK_COMMENT_MODE,
    hljs!.APOS_STRING_MODE,
    hljs!.QUOTE_STRING_MODE,
    {
      // Numbers
      className: 'number',
      variants: [
        { begin: '\\b(0[bB][01]+)' },
        { begin: '\\b(0[oO][0-7]+)' },
        { begin: hljs!.C_NUMBER_RE },
      ],
      relevance: 0,
    },
    {
      // TypeScript variable declarations
      beginKeywords: 'let const',
      end: '\\=',
      endScope: 'keyword',
      keywords: 'let const',
      relevance: 10,
      contains: [
        {
          className: 'variable',
          begin: '[A-Za-z$_][0-9A-Za-z$_]*',
          relevance: 0,
        },
      ],
    },
    {
      // JSX Elements
      begin: '<',
      end: '>',
      subLanguage: 'xml',
      contains: [
        {
          // JSX Self-Closing Tags
          begin: '<',
          end: '/>',
          subLanguage: 'xml',
          contains: [],
        },
        {
          // JSX Opening Tags
          begin: '<',
          end: '>',
          subLanguage: 'xml',
          contains: [],
          relevance: 0,
        },
      ],
    },
    {
      // Recognize ReactDOM.createRoot
      className: 'built_in',
      begin: 'ReactDOM\\.createRoot',
    },
    {
      // Recognize React.Component
      className: 'built_in',
      begin: 'React\\.Component',
    },
    {
      // Recognize JSX
      className: 'type',
      begin: 'JSX',
    },
  ];

  return {
    aliases: ['tsx'],
    keywords: TSX_KEYWORDS,
    contains: TSX_CONTAINS,
  };
});

export default hljs;