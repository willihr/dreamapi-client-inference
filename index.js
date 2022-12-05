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

const inferWorker = new Worker('Infer', aiInfer, { connection });
const trainWorker = new Worker('Train', aiTrain, { connection });
