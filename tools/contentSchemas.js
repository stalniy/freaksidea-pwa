import { defaultSchema } from 'rollup-plugin-content';

export const article = {
  $id: 'http://freaksidea.com/schemas/article.json',
  definitions: {
    page: defaultSchema
  },
  allOf: [
    { $ref: '#/definitions/page'},
    {
      required: ['categories'],
      properties: {
        categories: {
          items: {
            enum: ['backend', 'frontend', 'linux', 'important']
          }
        },
        author: {
          enum: ['sstotskyi']
        }
      }
    }
  ]
};
