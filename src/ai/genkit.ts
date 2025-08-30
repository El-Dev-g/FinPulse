'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {GENKIT_ENV} from 'genkit/environment';

const plugins = [];
if (GENKIT_ENV === 'dev') {
  const {firebase} = require('genkitx-firebase');
  plugins.push(firebase());
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
    ...plugins,
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
