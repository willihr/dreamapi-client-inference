import { Worker } from 'bullmq';

import aiInfer from './workers/ai-infer';
import aiTrain from './workers/ai-train';

require('dotenv').config();

const inferWorker = new Worker('Infer', aiInfer);
const trainWorker = new Worker('Train', aiTrain);
