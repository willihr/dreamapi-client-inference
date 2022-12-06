const { Worker } = require('bullmq');
const Redis = require("ioredis");

require('dotenv').config();

const aiInfer = require('./workers/ai-infer');
const aiTrain = require('./workers/ai-train');

const connection = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
});

const inferWorker = new Worker('Infer', aiInfer, {
    connection,
    concurrency: process.env.INFER_JOBS_MAX_CONCURRENCY
});
const trainWorker = new Worker('Train', aiTrain, {
    connection,
    concurrency: process.env.TRAIN_JOBS_MAX_CONCURRENCY
});

inferWorker.on('failed', () => console.error('infer job failed'));
trainWorker.on('failed', () => console.error('train job failed'));
