import { Worker } from 'bullmq';

import aiInferer from './workers/ai-inferer';
import aiTrainer from './workers/train-worker';

require('dotenv').config();

const inferWorker = new Worker('Infer', aiInferer);
const trainWorker = new Worker('Train', aiTrainer);
