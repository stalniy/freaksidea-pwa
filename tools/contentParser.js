const { parse, getOrCreateMdParser } = require('xyaml-webpack-loader/parser');
const matter = require('gray-matter');
const slugify = require('@sindresorhus/slugify');
const { basename } = require('path');

const markdownOptions = {
  use: {
    'markdown-it-highlightjs': {},
    'markdown-it-headinganchor': {
      anchorClass: 'h-link',
      slugify,
    },
    'markdown-it-include': {
      root: `${__dirname}/..`,
      includeRe: /@include:\s*([\w._/-]+)/
    },
    [`${__dirname}/mdLink`]: {
      external: {
        target: '_blank',
        rel: 'noopener nofollow'
      },
      local: {
        tagName: 'app-link',
        normalizeId: id => basename(id).slice(11)
      },
      asset: {
        srcRoot: `${process.env.LIT_APP_PUBLIC_PATH || '/'}media/assets`
      }
    },
    [`${__dirname}/mdImage`]: {
      size: 'auto',
      srcRoot: `${process.env.LIT_APP_PUBLIC_PATH || '/'}media/assets`
    },
    [`${__dirname}/mdTableContainer`]: {}
  }
};

const xyamlOptions = { markdown: markdownOptions };
const parsexYaml = content => parse(content, xyamlOptions);

const grayMatterOptions = {
  language: 'xyaml',
  engines: { xyaml: parsexYaml }
};
const parseMeta = source => matter(source, grayMatterOptions);

function parseFrontMatter(source, context) {
  const file = parseMeta(source);
  const parser = getOrCreateMdParser(markdownOptions);
  const content = parser.render(file.content, context).trim();
  const headings = content.match(/<h(\d)[^>]*>(?:.+?)<\/h\1>/g) || [];
  const summaryIndex = content.indexOf('<summary-cut/>');

  return {
    ...file.data,
    summary: summaryIndex === -1 ? file.data.summary : content.slice(0, summaryIndex),
    content,
    headings: headings.map((h) => {
      const idIndex = h.indexOf(' id="');
      const id = idIndex === -1 ? null : h.slice(idIndex + 5, h.indexOf('"', idIndex + 6));

      return [id, h.replace(/<[^>]+>/g, ' ').trim()];
    }),
  };
}

module.exports = {
  markdownOptions,
  parsexYaml,
  parseMeta,
  parseFrontMatter,
};
