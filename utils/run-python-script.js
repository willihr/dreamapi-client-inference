const { PythonShell } = require('python-shell');

const runPythonScript = (pythonFile, args) => {
    const options = {
        args: args
    };

    return new Promise((resolve, reject) => {
        PythonShell.run(pythonFile, options, function (err, output) {
            if (err) return reject(err);
            return resolve(output);
        });
    });
}

module.exports = runPythonScript;
