var cluster = require('cluster');
var os = require('os');

const CPUS = os.cpus();

if(cluster.isMaster) {
    console.log('thread master');

    CPUS.forEach(function() {
        cluster.fork();
    });

    cluster.on('listening', worker => {
        console.log('cluster %d connected', worker.process.pid);
    });

    cluster.on('disconnected', worker => {
        console.log('cluster %d disconnected', worker.process.pid);
    });

    cluster.on('exit', function(worker) {
        console.log('cluster %d lost', worker.process.pid);
        cluster.fork();
    });

} else {
    console.log('thread slave');
    require('./server.js');
}
