const fs = require('fs');
const LRU = require('lru-cache');
const { Semaphore } = require('async-mutex');

const downloadFromS3 = require('../utils/download-from-s3');
const runPythonScript = require('../utils/run-python-script');

const gpuSemaphore = new Semaphore(process.env.INFER_JOBS_MAX_GPU_CONCURRENCY || 1);

const modelsCache = new LRU({
    maxSize: parseInt(process.env.AI_MODEL_CACHE_MAX_MB) || 10 * 1024,

    sizeCalculation: (value) => {
        return Math.max(parseInt(fs.statSync(value).size / (1024 * 1024)), 1);
    },
    dispose: (value) => {
        fs.unlinkSync(value);
    },
    fetchMethod: async (key) => {
        console.log('Downloading pruned model', key);
        const objectKey = `models/${key}.ckpt`;
        const destinationPath = `workdir/ckpts/${key}.ckpt`;
        await downloadFromS3('models', objectKey, destinationPath);
        return destinationPath;
    }
});

const aiInfer = async (job) => {
    console.log('Infer job', JSON.stringify(job.data));

    const modelId = job.data.model_id;
    const ckptPath = await modelsCache.fetch(modelId);
    await gpuSemaphore.runExclusive(async () => {
        console.log('Extracting model', modelId);
        await runPythonScript('python/convert_original_stable_diffusion_to_diffusers.py', [
            `--checkpoint_path=${ckptPath}`,
            `--dump_path=workdir/models/${modelId}`,
        ]);
        console.log('Run inference for model', modelId);
        await runPythonScript('python/infer.py', [
            `--prompt=${'a dog'}`,
            `--model_path=workdir/models/${modelId}`,
        ]);
    });

    console.log('Infer job done');
}

module.exports = aiInfer;
