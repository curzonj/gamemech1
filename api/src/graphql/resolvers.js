const db = require('../models')

module.exports = {
  hello: (a, r) => {
    return `Hello ${r.user.google_name}`
  },
  user: (a, r) => {
      console.log(a)
      if (a.id == 'self') {
        return r.user
      } else {
          return db.user.findById(a.id)
      }
  },
  users: (a, r) => {
    return db.user.findAll()
  }
}