const db = require('../models')
const { schedule } = require('../event/utils')

exports.typeDefs = `
    extend type Mutation {
        buildThing: Timer
    }
`

exports.resolvers = {
    Mutation: { buildThing }
}

function buildThing() {
    return db.timer_queues.findOrCreateAny()
    .then(queue => {
        return schedule({
            handler: 'doneBuilding',
            queue_id: queue.id,
            details: {}
        })
    })
}
