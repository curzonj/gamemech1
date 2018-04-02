'use strict';

const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: (a, r) => {
    return `Hello ${r.user.id}`;
  },
};

module.exports = graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
})