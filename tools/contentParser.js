import { parse } from 'xyaml-webpack-loader/parser';
import matter from 'gray-matter';
import { createParser } from './markdown/parser';

export default (projectPath, options) => {
  const parser = createParser({
    publicPath: options.LIT_APP_PUBLIC_PATH,
    modulePath: `${projectPath}/tools/markdown`
  });
  const parsexYaml = content => parse(content, { parser });
  const parseMeta = source => matter(source, {
    language: 'xyaml',
    engines: { xyaml: parsexYaml }
  });

  function parseFrontMatter(source, context) {
    const file = parseMeta(source);
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

  return {
    parser,
    parsexYaml,
    parseMeta,
    parseFrontMatter,
  };
};
