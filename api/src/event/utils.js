const gameHandlers = require('./handlers')
const db = require('../models')
const Op = db.Sequelize.Op
const sequelize = db.sequelize

const self = module.exports = {
    async unblock(type, container, quantity, now = new Date()) {
        let blocked = await db.timer_queues.findAll({
            attributes: ['id'],
            where: {
                blocked_type: type,
                blocked_container: container,
                blocked_quantity: {
                    [Op.lte]: quantity
                }
            }
        })

        for (const {
                id
            } of blocked) {
            await sequelize.transaction(async function(t) {
                let queue = await db.timer_queues.findById(id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                })

                let next = await db.timers.findOne({
                    where: {
                        queue_id: queue.id,
                        list_head: true,
                    }
                }, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                })

                if (next === null) {
                    return
                }

                const handler = gameHandlers[next.handler]

                let {
                    duration
                } = await handler.prepare(next.details, t)
                if (duration) {
                    await next.update({
                        trigger_at: self.nextAt(duration, now)
                    }, {
                        transaction: t
                    })

                    await queue.update({
                        blocked_type: null,
                        blocked_container: null,
                        blocked_quantity: null,
                    }, {
                        transaction: t,
                    })
                }
            })
        }
    },

    async prepareJobToRun(queue, details, handler, values, t, now = new Date()) {
        values.list_head = true

        let {
            duration,
            reqs
        } = await handler.prepare(details, t)

        if (duration) {
            values.trigger_at = self.nextAt(duration, now)
        } else {
            await queue.update({
                blocked_type: reqs.type,
                blocked_container: reqs.container,
                blocked_quantity: reqs.quantity,
            }, {
                transaction: t,
            })
        }
    },


    schedule({
        handler,
        queue_id,
        details
    }) {
        return sequelize.transaction(async function(t) {
            const handlerFns = gameHandlers[handler]
            let values = {
                handler,
                queue_id,
                details
            }

            let queue = await db.timer_queues.findById(queue_id, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            })

            let last = await db.timers.findOne({
                where: {
                    queue_id: queue_id,
                    next_id: null,
                }
            }, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            })

            if (last === null) {
                await self.prepareJobToRun(queue, details, handlerFns, values, t)
            }

            let job = await db.timers.create(values, {
                transaction: t,
            })

            if (last) {
                await last.update({
                    next_id: job.id,
                }, {
                    transaction: t,
                })
            }

            return job
        })
    },

    nextAt(duration, from = new Date()) {
        let next = new Date(from)
        next.setSeconds(next.getSeconds() + duration)

        return next
    }
}