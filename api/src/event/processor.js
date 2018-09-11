const sleep = require('sleep-promise')
const db = require('../models')
const Op = db.Sequelize.Op
const sequelize = db.sequelize
const gameHandlers = require('./handlers')
const utils = require('./utils')

async function scheduleNextTimer(job, t) {
    if (job.queue_id === null || job.next_id === null) {
        return
    }

    let queue = await db.timer_queues.findById(job.queue_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
    })

    let next = await db.timers.findById(job.next_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
    })

    let values = {}
    const handler = gameHandlers[next.handler]
    await utils.prepareJobToRun(queue, next.details, handler, values, t, job.trigger_at)

    return next.update(values, {
        transaction: t
    })
}

function handleJobId(job_id) {
    // TODO this needs timeouts or one bad handler could block the entire
    // worker
    return sequelize.transaction(function (t) {
        return db.timers.findById(job_id, {
            skipLocked: true,
            transaction: t,
            lock: t.LOCK.UPDATE,
        })
        .then(job => {
            if (job === null) {
                return
            }

            const handler = gameHandlers[job.handler]

            return Promise.resolve()
            .then(() => {
                return handler.complete(job.details, t, job.trigger_at)
            })
            .then(async () => {
                if (handler.reschedule) {
                    let duration = await handler.reschedule(job.details, t)
                    if (duration) {
                        return job.update({
                            trigger_at: utils.nextAt(duration, job.trigger_at)
                        }, {
                            transaction: t
                        })
                    }
                }

                return Promise.all([
                    scheduleNextTimer(job, t),
                    job.destroy({ transaction: t })
                ])
            })
        })
    })
}

function runAt(date, fn) {
    let wait = date - (new Date())
    return sleep(Math.max(wait, 0)).then(fn)
}

const workerIntervalSeconds = 5
const dbQueryResultsLimit = 20

// DO NOT return a promise from this function
function runSimulation() {
    let deadline = new Date()
    deadline.setSeconds(deadline.getSeconds() + workerIntervalSeconds)

    db.timers.findAll({
        attributes: ['id', 'trigger_at'],
        where: {
            trigger_at: {
                [Op.lte]: deadline
            },
        },
        order: [ ['trigger_at', 'ASC'] ],
        limit: dbQueryResultsLimit,
    })
    .then(rows => {
        return Promise.all(rows.map(job => {
            return runAt(job.trigger_at, () => {
                return handleJobId(job.id)
            })
        }))
        .then(() => {
            // If we max out the result set, don't sleep
            // before the next run
            if (rows.length > 0) {
                return runSimulation()
            } else {
                return runAt(deadline, runSimulation)
            }
        })
    })
    .catch(err => {
        console.log(err)
    })
}

module.exports = runSimulation