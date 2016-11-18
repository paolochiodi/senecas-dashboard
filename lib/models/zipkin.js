'use strict'

const Wreck = require('wreck')
const Qs = require('qs')

function hoursAgo (hours) {
  return 3600000 * hours
}

function now () {
  return new Date().getTime()
}

function findAllByMessage (message, done) {
  const url = "http://localhost:8080/api/v1/traces?"
  const options = {
    limit: 10,
    endTs: now(),
    lookback: hoursAgo(3),
    spanName: message
  }

  Wreck.get(url + Qs.stringify(options), {json: 'force'}, function got(err, res, data) {
    done(null, data || [])
  })
}


module.exports = {
  findAllByMessage: findAllByMessage
}