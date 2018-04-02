const db = require('../models')
const uuidv4 = require('uuid/v4')

module.exports = {
  hello: (a, r, g) => {
    return `Hello ${r.user.google_name}`
  },
  user: (a, r, g) => {
      if (a.id == 'self') {
        return r.user
      } else {
          return db.users.findById(a.id)
      }
  },
  users: (a, r, g) => {
    return db.users.findAll()
  },
  solar_systems: (a, r, g) => {
    return db.solar_systems.findAll()
  },
  structures: (a, r, g) => {
    return db.structures.findAll()
  },
  createFreeFactory: (a, r, g) => {
    // TODO only create the free factory if they don't have any factories
    // TODO link to the account instead of to the user

    return db.structures.create({
      id: uuidv4(),
      asset_type_id: "3fae2147-2edf-4528-ad97-fddac0911b7a",
      site_id: a.site_id,
      owner_id: r.user.id,
      owner_type: 'account',
    })
  },
}
