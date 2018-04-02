const db = require('../models')
const uuidv4 = require('uuid/v4')

module.exports = {
  hello: (a, r) => {
    return `Hello ${r.user.google_name}`
  },
  user: (a, r) => {
      console.log(a)
      if (a.id == 'self') {
        return r.user
      } else {
          return db.users.findById(a.id)
      }
  },
  users: (a, r) => {
    return db.users.findAll()
  },
  solar_systems: (a, r) => {
    return db.solar_systems.findAll()
  },
  createSolarSystem: (a, r) => {
    a.input.id = uuidv4()
    return db.solar_systems.create(a.input)
  },
}