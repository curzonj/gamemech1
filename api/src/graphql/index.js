import fs from 'fs';
import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import GraphQLJSON from 'graphql-type-json';
import * as db from '../models';
import reportError from '../utils/reportError';

const basename = path.basename(__filename);

const rootDefs = `
  scalar DateTime
  scalar JSON

  type Query {
    nothing: ID
  }

  type Mutation {
    nothing: ID
  }
`;

const typeDefs = [rootDefs];
const resolvers = [
  {
    JSON: GraphQLJSON,
  },
];

fs.readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach(file => {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const result = require(`./${file}`);

      typeDefs.push(result.typeDefs);
      resolvers.push(result.resolvers);
    } catch (e) {
      console.log('was loading', file);
      throw e;
    }
  });

db.forEachModel(m => {
  if (m.typeDefs && m.resolvers) {
    typeDefs.push(m.typeDefs);
    resolvers.push(m.resolvers);
  }
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: {
    log: reportError,
  },
});

export default schema;
