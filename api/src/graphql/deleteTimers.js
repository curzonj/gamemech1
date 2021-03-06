import gqlAuth from '../utils/gqlAuth';
import * as db from '../models';
import { prepareJobToRun } from '../events/utils';
import { each } from '../shared/async';

const { sequelize } = db;

exports.typeDefs = `
  extend type Mutation {
    deleteTimer(id: ID!): ID
    clearTimerQueue(assetInstanceId: ID!): [ID]
  }
`;

exports.resolvers = {
  Mutation: {
    clearTimerQueue: gqlAuth(async (req, { assetInstanceId }) =>
      sequelize.transaction(async transaction => {
        const lock = transaction.LOCK.UPDATE;

        const list = await db.timer.findAll({
          where: { gameAccountId: req.user.id, assetInstanceId },
          transaction,
          lock,
        });

        await each(list, x => x.destroy({ transaction }));

        return list.map(x => x.id);
      })
    ),
    deleteTimer: gqlAuth(async (req, { id }) => {
      await sequelize.transaction(async transaction => {
        const lock = transaction.LOCK.UPDATE;

        const job = await db.timer.findOne({
          where: { id, gameAccountId: req.user.id },
          transaction,
          lock,
        });

        if (job.listHead) {
          if (job.nextId !== null) {
            const queue = await db.timerQueue.findLocked(
              job.gameAccountId,
              job.assetInstanceId,
              transaction
            );

            if (!queue) {
              throw new Error(`Missing queue for ${JSON.stringify(job)}`);
            }

            const next = await db.timer.findById(job.nextId, {
              transaction,
              lock,
            });

            await prepareJobToRun(queue, next, transaction, job.triggerAt);
          }
        } else {
          const previous = await db.timer.findOne({
            where: {
              gameAccountId: req.user.id,
              assetInstanceId: job.assetInstanceId,
              nextId: job.id,
            },
            transaction,
            lock,
          });

          if (previous) {
            await previous.update({ nextId: job.nextId });
          }
        }

        await job.destroy({ transaction });
      });

      return id;
    }),
  },
};
