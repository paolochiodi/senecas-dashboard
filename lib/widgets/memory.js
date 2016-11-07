'use strict'

const Contrib = require('blessed-contrib')
const TO_MEGABYTES = 1024 * 1024

function memory (bus, parent) {

  const memUsageBars = Contrib.bar({
    maxHeight: 100,
    barWidth: 3,
    barSpacing: 1
  })
  parent.append(memUsageBars)
  update(0, 0, 0)

  bus.on('data', gotData)

  function gotData (data) {
    const mem = data.mem
    update(mem.value.heapUsed, mem.value.heapTotal, mem.value.rss)
  }

  function update (heapUsed, heapTotal, rss) {
    memUsageBars.setData({
      titles: ['HU', 'HT', 'RSS'],
      data: [
        Math.round(heapUsed / TO_MEGABYTES),
        Math.round(heapTotal / TO_MEGABYTES),
        Math.round(rss / TO_MEGABYTES)
      ]
    })
  }

}

module.exports = memory
