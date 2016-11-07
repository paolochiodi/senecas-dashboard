'use strict';

const EventEmitter = require('events')

class Bus extends EventEmitter {
  constructor(options) {
    super(options);
  }
}


module.exports = Bus