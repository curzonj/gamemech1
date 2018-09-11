exports.typeDefs = `
  extend type Query {
    hello: String
  }
`

exports.resolvers = {
    Query: { hello }
}

function hello(parentValue, req, query) {
    let name = "Anonymous Stranger"
    if (req.user) {
        name = req.user.username
    }
    return `Hello ${name}!`;
}