const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(__filename);
const { makeExecutableSchema } = require('graphql-tools');
const db = require('../models')

const rootDefs = `
  scalar DateTime

  type Query {
    nothing: ID
  }

  type Mutation {
    nothing: ID
  }
`

const typeDefs = [ rootDefs ]
const resolvers = [ ]

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    try {
      const result = require(`./${file}`)

      typeDefs.push(result.typeDefs)
      resolvers.push(result.resolvers)
    } catch(e) {
      console.log('was loading', file)
      throw e
    }
  })


db.models.forEach(m => {
  if (m.typeDefs && m.resolvers) {
    typeDefs.push(m.typeDefs)
    resolvers.push(m.resolvers)
  }
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: { log: e => console.log(e) },
})

module.exports = {
  schema: schema,
}