import authRouter from './http/authentication';

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const config = require('./config');
const { schema } = require('./graphql');
const startSimulation = require('./events/processor');

const app = express();
const server = http.createServer(app);

app.use(morgan('dev')); // log every request to the console
app.use(cors());

authRouter(app);

app.get('/', (req, res) =>
  res.send(req.user ? 'Authenticated' : 'Unauthenticated')
);
app.get('/health', (req, res) => res.send('OK'));

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

server.on('error', e => {
  console.log(e);
});

startSimulation();
server.listen(config.get('PORT'));
