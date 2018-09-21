import express from 'express';
import http from 'http';
import morgan from 'morgan';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import schema from './graphql';
import config from './config';
import authRouter from './http/authentication';
import startSimulation from './events/processor';

const app = express();
const server = http.createServer(app);

app.use(express.static('../client/build'));

app.use(morgan('dev')); // log every request to the console
app.use(cors());

authRouter(app);

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
    formatError: error => ({
      message: error.message,
      path: error.path,
    }),
  })
);

app.get('/health', (req, res) => res.send('OK'));

app.get('/*', (req, res) => {
  res.sendFile('../client/build/index.html');
});

server.on('error', e => {
  console.log(e);
});

startSimulation();
server.listen(config.get('PORT'));
