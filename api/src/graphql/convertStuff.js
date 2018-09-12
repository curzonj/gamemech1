const db = require('../models')
const sequelize = db.sequelize
const {
    unblock
} = require('../event/utils')

exports.typeDefs = `
  extend type Mutation {
    convertStuff: Asset
  }
`

exports.resolvers = {
    Mutation: {
        convertStuff
    }
}

function convertStuff() {
    return sequelize.transaction(function(t) {
            return db.assets.findById("iron", {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                })
                .then(a => {
                    if (a.amount < 10) {
                        throw new Error("Not enough inputs")
                    }

                    return Promise.all([
                            a.update({
                                amount: a.amount - 10
                            }, {
                                transaction: t,
                            }),
                            db.assets.upsertOnConflict({
                                id: "tools",
                                amount: 1
                            }, {
                                transaction: t,
                            })
                        ])
                        .then(([iron, [tools]]) => {
                            return tools
                        })
                })
        })
        .then(tools => {
            return unblock('tools', null, tools.amount)
                .then(() => tools)
        })
}