import {inspect} from 'util';
import {HelperTux} from './structures/core/tux.js';
import {load} from './utils/TuxProcessHelper.js';
import cluster from 'cluster';
import fastify from 'fastify';
import {get} from 'https';
if (cluster.isMaster) {
  let x = 0;
  console.log(`Tux Process Manager Online, PID: ${process.pid}`);
  let node = cluster.fork();
  cluster.on('exit', (worker, code, signal) => {
    x++;
    console.log(`Termination count: ${x}`);
    console.log(
      `Tux Node Handler (PID: ${worker.process.pid}) exited with code: ${code} and signal: ${signal} `
    );
    node = cluster.fork();
  });
  get(process.env.HOST_URL);
  node.send('status');
  setInterval(() => get(process.env.HOST_URL), 1500000);
  setInterval(() => node.send('status'), 15000);
  let lastStatus = false;
  node.on('message', message => {
    if (message.msg === 'status') lastStatus = message.status;
  });
  const server = fastify();
  server.get('/', async (request, reply) => {
    reply
      .type('application/json')
      .code(lastStatus ? 200 : 500)
      .send({server: 'online', bot: lastStatus ? 'online' : 'offline'});
  });
  (async () => {
    try {
      await server.listen(process.env.PORT, '0.0.0.0');
      console.log(`Server is listening on ${server.server.address().port}`);
    } catch (err) {
      console.log('Failed creating server');
      console.log(err);
    }
  })();
} else {
  const tux = new HelperTux();
  load(tux);
  tux
    .login(process.env.TOKEN)
    .then(tux.logger.log(`Login Requested`, 'LOGIN', 'Login Method Called'));
  tux.logger.log(
    `Tux Node Handler Online, PID: ${process.pid}`,
    'INFO',
    'Tux Node Handler Online'
  );
  process
    .on('unhandledRejection', (reason, promise) =>
      tux.logger.log(
        `Unhandled Rejection at: ${inspect(promise)} reason: ${inspect(
          reason
        )}`,
        'unhandledRejection',
        'Error'
      )
    )
    .on('uncaughtException', (err, origin) =>
      tux.logger.log(
        `Error: ${inspect(err)} at ${inspect(origin)}`,
        'uncaughtException',
        'Error'
      )
    )
    .on('SIGINT', () => process.exit(0))
    .on('SIGTERM', () => process.exit(0))
    .on('beforeExit', () => process.exit(0))
    .on('message', msg => {
      if (msg === 'status') process.send({msg, status: tux.ws.ping});
    });
}
