
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins = [];
if (process.env.GENKIT_ENV === 'dev') {
  const {firebase} = require('@genkit-ai/firebase');
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
