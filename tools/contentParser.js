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
    [`${__dirname}/markdown/link`]: {
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
    [`${__dirname}/markdown/image`]: {
      size: 'auto',
      srcRoot: `${process.env.LIT_APP_PUBLIC_PATH || '/'}media/assets`,
      responsive: [
        [/.+/, ['xs', 'sm', 'md']]
      ]
    },
    [`${__dirname}/markdown/tableContainer`]: {}
  }
};

const xyamlOptions = { markdown: markdownOptions };
const parsexYaml = content => parse(content, xyamlOptions);

const grayMatterOptions = {
  language: 'xyaml',
  engines: { xyaml: parsexYaml }
};
const parseMeta = source => matter(source, grayMatterOptions);
const markdownParser = getOrCreateMdParser(markdownOptions);

const postParsingTasks = [];
markdownParser.addPostParsingTask = (task) => postParsingTasks.push(task);
markdownParser.processPostParsingTasks = (handlers, options) => {
  const iterator = postParsingTasks.slice(0).values();
  postParsingTasks.length = 0;
  const jobs = Array.from({ length: 20 }).map(async () => {
    for (const task of iterator) {
      if (!handlers[task.type]) {
        throw new Error(`No handler for "${task.type}"`);
      }

      await handlers[task.type](task, options);
    }
  });

  return Promise.all(jobs);
};

function parseFrontMatter(source, context) {
  const file = parseMeta(source);
  const content = markdownParser.render(file.content, context).trim();
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
  markdown: markdownParser,
  markdownOptions,
  parsexYaml,
  parseMeta,
  parseFrontMatter,
};
