module.exports = function(sequelize, DataTypes) {
    const model = sequelize.define("timer_queues", {
        blocked_type: {
            type: DataTypes.STRING,
        },
        blocked_container: {
            type: DataTypes.INTEGER,
        },
        blocked_quantity: {
            type: DataTypes.INTEGER,
        },
    }, {
        timestamps: false,
    })


    model.findOrCreateAny = async function() {
        let first = await model.findOne({})
        if (!first) {
            first = await model.create({})
        }

        return first
    }

    return model
}