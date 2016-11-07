
const Blessed = require('blessed')
const Contrib = require('blessed-contrib')

const Bus = require('./lib/bus')
const Collector = require('./lib/collector')

const Memory = require('./lib/widgets/memory')
const MsgGraph = require('./lib/widgets/msg-graph')
const MsgTop = require('./lib/widgets/msg-top')

const bus = new Bus()
const collector = new Collector(bus)
const screen = Blessed.screen()

setupScreen()
collector.start()

setTimeout(update, 200)


function setupScreen () {
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  screen.render()

  const grid = new Contrib.grid({rows: 12, cols: 12, screen: screen})
  const msgGraphParent = grid.set(4, 2, 4, 5, Blessed.box, {label: 'Message Flow'})
  const msgTopParent = grid.set(0, 2, 4, 5, Blessed.box, {label: 'Messages'})
  const memParent = grid.set(0, 0, 4, 2, Blessed.box, {label: 'Memory Utilization (%)'})

  new Memory(bus, memParent)
  new MsgGraph(bus, msgGraphParent)
  new MsgTop(bus, msgTopParent)

  msgTopParent.focus()
}

function update () {
  const data = collector.getData()
  bus.emit('data', data)

  screen.render()
  setTimeout(update, 200)
}