const fs = require('fs');
const LRU = require('lru-cache');
const { Semaphore } = require('async-mutex');

const downloadFromS3 = require('../utils/download-from-s3');

const gpuSemaphore = new Semaphore(process.env.INFER_GPU_JOBS_MAX_CONCURRENCY || 1);

const modelsCache = new LRU({
    maxSize: parseInt(process.env.AI_MODEL_CACHE_MAX_MB) || 10 * 1024,

    sizeCalculation: (value) => {
        return Math.max(parseInt(fs.statSync(value).size / (1024 * 1024)), 1);
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

const aiInfer = async (job) => {
    console.log('infer job', JSON.stringify(job.data));

    try {
        const ckptPath = await modelsCache.fetch(job.data.model_id);
        await gpuSemaphore.runExclusive(async () => {
            await runPythonScript('python/infer.py', [
                `--prompt=${'a dog'}`,
                `--model_path=${ckptPath}`,
            ]);
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = aiInfer;
