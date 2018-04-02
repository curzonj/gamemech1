'use strict';

const routes = require('express').Router();

routes.get('/', (req, res) => {
    console.log(req.user)
    console.log(req.session)

    res.send(`Hello ${req.user.id}`)
})

routes.use('/graphql', require('./graphql'))

module.exports = routes