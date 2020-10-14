import { getOrCreateMdParser } from 'xyaml-webpack-loader/parser';
import slugify from '@sindresorhus/slugify';
import { basename } from 'path';

export const createParser = ({ publicPath, modulePath } = {}) => {
  const parser = getOrCreateMdParser({
    use: {
      'markdown-it-highlightjs': {},
      'markdown-it-headinganchor': {
        anchorClass: 'h-link',
        slugify,
      },
      [`${modulePath}/link`]: {
        external: {
          target: '_blank',
          rel: 'noopener nofollow'
        },
        local: {
          tagName: 'app-link',
          normalizeId: id => basename(id).slice(11)
        },
        asset: {
          srcRoot: `${publicPath}/media/assets`
        }
      },
      [`${modulePath}/image`]: {
        size: 'auto',
        srcRoot: `${publicPath}/media/assets`,
        responsive: [
          [/.+/, ['xs', 'sm', 'md']]
        ]
      },
      [`${modulePath}/tableContainer`]: {}
    }
  });

  const postParsingTasks = [];
  return Object.assign(parser, {
    addPostParsingTask(task) {
      postParsingTasks.push(task);
    },

    processPostParsingTasks(handlers, options) {
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
    }
  });
};
