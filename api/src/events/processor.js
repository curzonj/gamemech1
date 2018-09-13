/* eslint consistent-return: 0 */

import * as utils from './utils';

const sleep = require('sleep-promise');
const db = require('../models');

const {
  sequelize,
  Sequelize: { Op },
} = db;

async function scheduleNextTimer(job, t) {
  if (job.queueId === null || job.nextId === null) {
    return;
  }

  const queue = await db.timerQueue.findById(job.queueId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  const next = await db.timer.findById(job.nextId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  await utils.prepareJobToRun(queue, next, t, job.triggerAt);
}

function handleJobId(jobId) {
  // TODO this needs timeouts or one bad handler could block the entire
  // worker
  return sequelize.transaction(async t => {
    const job = await db.timer.findById(jobId, {
      skipLocked: true,
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (job === null) {
      return;
    }

    await utils.invokeHandler('complete', job, t);
    const duration = await utils.invokeHandler('reschedule', job, t);
    if (duration) {
      return job.update(
        {
          triggerAt: utils.nextAt(duration, job.triggerAt),
        },
        {
          transaction: t,
        }
      );
    }

    return Promise.all([
      scheduleNextTimer(job, t),
      job.destroy({
        transaction: t,
      }),
    ]);
  });
}

function runAt(date, fn) {
  const wait = date - new Date();
  return sleep(Math.max(wait, 0)).then(fn);
}

const workerIntervalSeconds = 5;
const dbQueryResultsLimit = 20;

// DO NOT return a promise from this function
function runSimulation() {
  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + workerIntervalSeconds);

  db.timer
    .findAll({
      attributes: ['id', 'triggerAt'],
      where: {
        triggerAt: {
          [Op.lte]: deadline,
        },
      },
      order: [['triggerAt', 'ASC']],
      limit: dbQueryResultsLimit,
    })
    .then(rows =>
      Promise.all(
        rows.map(job => runAt(job.triggerAt, () => handleJobId(job.id)))
      ).then(() => {
        // If we max out the result set, don't sleep
        // before the next run
        if (rows.length > 0) {
          return runSimulation();
        }
        return runAt(deadline, runSimulation);
      })
    )
    .catch(err => {
      console.log(err);
    });
}

module.exports = runSimulation;
