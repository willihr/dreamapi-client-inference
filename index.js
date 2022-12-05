import { Worker } from 'bullmq';

import inferWorker from './workers/infer-worker';
import trainWorker from './workers/train-worker';

const trainWorker = new Worker('Train', trainWorker);
const inferWorker = new Worker('Infer', inferWorker);
