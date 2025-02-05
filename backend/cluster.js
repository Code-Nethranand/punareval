const cluster = require('cluster');
const os = require('os');
const logger = require('./utils/logger');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    
    // Log master process start
    logger.info(`Master process ${process.pid} is running`);
    logger.info(`Setting up ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Log worker events
    cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
        logger.info('Starting a new worker...');
        cluster.fork();
    });
} else {
    require('./server.js');
}
