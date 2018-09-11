exports.typeDefs = `
  extend type Query {
    hello: String
  }
`

exports.resolvers = {
    Query: { hello }
}

function hello(root, args, req, info) {
    let name = "Anonymous Stranger"
    if (req.user) {
        name = req.user.discord_details.username
    }
    return `Hello ${name}!`;
}