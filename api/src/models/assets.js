module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("assets", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        amount: {
            type: DataTypes.INTEGER,
        },
    }, {
        timestamps: false,
    })

    model.typeDefs = `
        type Asset {
            id: ID!
            amount: Int
        }

        extend type Query {
            assets: [Asset]
        }
    `
    model.resolvers = {
        Query: {
            assets: () => model.findAll(),
        },
    }

    model.upsertOnConflict = function(values, opts={}) {
        opts.replacements = values
        opts.model = model

        return sequelize.query('INSERT INTO assets (id, amount) VALUES (:id, :amount) ON CONFLICT (id) DO UPDATE SET amount = assets.amount + EXCLUDED.amount RETURNING *', opts)
    }


    return model
}