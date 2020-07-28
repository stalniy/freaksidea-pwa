import { parse, getOrCreateMdParser } from 'xyaml-webpack-loader/parser';
import matter from 'gray-matter';
import slugify from '@sindresorhus/slugify';

export const markdownOptions = {
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
    [`${__dirname}/tools/mdLink`]: {
      external: {
        target: '_blank',
        rel: 'noopener nofollow'
      },
      local: {
        tagName: 'app-link'
      }
    },
    [`${__dirname}/tools/mdImage`]: {
      size: 'auto',
      srcRoot: `${process.env.LIT_APP_PUBLIC_PATH || ''}/media/assets`
    },
    [`${__dirname}/tools/mdTableContainer`]: {}
  }
};

const xyamlOptions = { markdown: markdownOptions };

export const parsexYaml = content => parse(content, xyamlOptions);

const grayMatterOptions = {
  language: 'xyaml',
  engines: { xyaml: parsexYaml }
};

export function parseFrontMatter(source, context) {
  const file = matter(source, grayMatterOptions);
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
