'use strict'

const Seneca = require('seneca')

function senecaListener () {

  const tag = 'listener'
  const server = Seneca({
    isbase: true,
    log:'silent',
    tag: tag
  })

  server.use('mesh')

  this.getNetwork = function getNetwork (done) {
    server.act('role:mesh,get:members', function gotMembers (err, data) {
      if (err) {
        return done(null, null)
      }

      done(null, data.list)
    })
  }
}

module.exports = senecaListener
