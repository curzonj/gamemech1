'use strict'

const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

var fs        = require('fs');
var path      = require('path');

// Construct a schema, using GraphQL schema language
const schemaText = fs.readFileSync(path.join(__dirname, 'schema.graphql')).toString()
const schema = buildSchema(schemaText)
const root = require('./resolvers')

module.exports = {
  schema: schema,
  resolver: root,
  router: graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
  })
}