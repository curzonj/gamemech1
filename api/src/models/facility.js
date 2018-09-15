import gqlAuth from '../utils/gqlAuth';

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'facility',
    {
      typeId: {
        type: DataTypes.INTEGER,
      },
      gameAccountId: {
        type: DataTypes.INTEGER,
      },
      details: {
        type: DataTypes.JSONB,
      },
    },
    {
      timestamps: false,
    }
  );

  model.typeDefs = `
      type Facility {
        type: Type
        details: JSON
      }

      extend type Query {
        facilities: [Facility]
      }
    `;

  model.resolvers = {
    Query: {
      facilities: gqlAuth(req =>
        model.findAll({
          where: { gameAccountId: req.user.id },
        })
      ),
    },
  };

  model.prototype.type = function type() {
    return model.db.type.findById(this.typeId);
  };

  model.upsertOnConflict = function upsertOnConflict(values, opts = {}) {
    opts.replacements = values;
    opts.model = model;
    opts.mapToModel = true;
    opts.plain = true;

    return sequelize.query(
      'INSERT INTO facilities (game_account_id, type_id, quantity) VALUES (:gameAccountId, :typeId, :quantity) ON CONFLICT (game_account_id, type_id) DO UPDATE SET quantity = facilities.quantity + EXCLUDED.quantity RETURNING *',
      opts
    );
  };

  model.findMatchingId = async (gameAccountId, facilityDetails) => {
    const { id: typeId } = await model.db.type.findByName(
      facilityDetails.type,
      'facility'
    );

    const match = await model.findOne({ where: { typeId, gameAccountId } });

    if (!match) {
      throw new Error(`no matching facility: ${facilityDetails.type}`);
    }

    return match.id;
  };

  return model;
};
