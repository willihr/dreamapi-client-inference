const fs = require('fs');
const LRU = require('lru-cache');
const { Semaphore } = 'async-mutex';

const downloadFromS3 = require('../utils/download-from-s3');

const gpuSemaphore = new Semaphore(process.env.INFER_GPU_JOBS_MAX_CONCURRENCY || 1);

const modelsCache = new LRU({
    maxSize: process.env.AI_MODEL_CACHE_MAX_MB || 10 * 1024,

    sizeCalculation: (value) => {
        return parseInt(fs.statSync(value).size / (1024 * 1024));
    },
    dispose: (value) => {
        fs.unlinkSync(value);
    },
    fetchMethod: async (key) => {
        const objectKey = `models/${key}.ckpt`;
        const destinationPath = `workdir/models/${key}.ckpt`;
        await downloadFromS3('models', objectKey, destinationPath);
        modelsCache.set(key, destinationPath);
    }
});

const aiInferer = async (jobData) => {
    const ckptPath = await modelsCache.fetch(jobData.model_id);
    await gpuSemaphore.runExclusive(async () => {
        
    });
}

module.exports = aiInferer;
