const db = require('../../models')

module.exports = {
    doneBuilding: {
        complete(event, t, now) {
            let trigger = new Date(now)
            trigger.setSeconds(trigger.getSeconds() + 120)

            return Promise.all([
                db.assets.upsertOnConflict({
                    id: "factory",
                    amount: 1
                }, {
                    transaction: t,
                }),
                db.timers.create({
                    handler: 'factoryProduceIron',
                    trigger_at: trigger,
                    interval_seconds: 120,
                    details: { }
                }, {
                    transaction: t,
                })
            ])
        },

        async prepare(details, t) {
            let a = await db.assets.findById("tools", {
                transaction: t,
                lock: t.LOCK.UPDATE,
            })

            if (a === null || a.amount < 10) {
                return { reqs: { type: 'tools', container: null, quantity: 10 } }
            }

            await a.update({amount: a.amount - 10 }, {
                transaction: t,
            })

            return { duration: 120 }
        }
    }
}