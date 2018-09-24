/* eslint consistent-return: 0 */

import sleep from 'sleep-promise';
import { Op } from 'sequelize';
import config from '../config';
import * as db from '../models';
import * as utils from './utils';
import reportErr from '../utils/reportError';

const maxFailedJobRetries = 5;
const workerIntervalSeconds = 5;
const dbQueryResultsLimit = parseInt(config.get('TIMER_CONCURRENCY'), 10);

async function startNextJob(queue, nextId, t, now) {
  if (nextId === null) {
    return;
  }

  const next = await db.timer.findById(nextId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  const ok = await utils.prepareJobToRun(queue, next, t, now);
  if (!ok) {
    const { nextId: nextNextId } = next;
    await next.destroy({ transaction: t });
    await startNextJob(queue, nextNextId, t, now);
  }
}

function handleJobId(jobId) {
  // TODO this needs timeouts or one bad handler could block the entire
  // worker
  return db.sequelize
    .transaction(async t => {
      const job = await db.timer.findById(jobId, {
        skipLocked: true,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (job === null) {
        return;
      }

      const jobResult = await utils.invokeHandler('complete', job, t);

      if (jobResult && jobResult.continueIn) {
        return job.update({
          triggerAt: utils.nextAt(jobResult.continueIn, job.triggerAt),
        });
      }

      if (!job.repeat) {
        await job.destroy({ transaction: t });
      }

      if (job.nextId !== null || job.repeat) {
        // TODO eventually I want to support containerIds different than the location
        // of the asset. Like having timers on ships and them being a container for
        // tangible or intangible assets.
        const facility = await db.assetInstance.findById(job.assetInstanceId);

        const queue = await db.timerQueue.findOrCreateLocked(
          job.gameAccountId,
          job.assetInstanceId,
          facility.locationId,
          t
        );

        await startNextJob(queue, job.nextId, t, job.triggerAt);

        if (job.repeat) {
          await job.update(
            { listHead: false, nextId: null },
            { transaction: t }
          );
          await utils.scheduleTimer(queue, job, false, t);
        }
      }
    })
    .catch(err => {
      reportErr(err);
      db.timer.retryById(jobId);
    });
}

function runAt(date, fn) {
  const wait = date - new Date();
  return sleep(Math.max(wait, 0)).then(fn);
}

// DO NOT return a promise from this function
export default function runSimulation() {
  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + workerIntervalSeconds);

  db.timer
    .findAll({
      attributes: ['id', 'triggerAt'],
      where: {
        triggerAt: {
          [Op.lte]: deadline,
        },
        retries: {
          [Op.lte]: maxFailedJobRetries,
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
      reportErr(err);
      return runAt(deadline, runSimulation);
    });
}
