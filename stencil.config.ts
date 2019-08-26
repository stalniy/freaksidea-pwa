import { Config } from '@stencil/core';
import cms from './tools/cms';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: 'https://myapp.local/'
    }
  ],
  plugins: [
    cms()
  ]
};
