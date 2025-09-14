
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase/v1';

const plugins = [];
if (process.env.GENKIT_ENV === 'dev') {
  plugins.push(firebase());
}

export const ai = genkit({
  plugins: [
    googleAI(),
    ...plugins,
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
