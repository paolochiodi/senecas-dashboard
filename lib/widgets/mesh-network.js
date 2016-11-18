'use strict'

const Blessed = require('blessed')
const zipkin = require('../models/zipkin')

function meshNetwork (bus, parent) {

  const main = new Blessed.box({
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    style: {
      fg: 'green'
    }
  })
  parent.append(main)

  bus.on('mesh', update)

  function buildNode (client) {
    return `
${client.host} : ${client.port}
\tInstance: ${client.instance}
\tPin: ${client.pin}
\tType: ${client.type} Model: ${client.model}
`
  }

  function update (network) {
    if (!network || network.length === 0) {
      clear()
      return
    }

    main.setText(network.map(buildNode).join(''))
  }

  function clear () {
    main.setText('No data')
  }

}

module.exports = meshNetwork
