
const Blessed = require('blessed')
const Contrib = require('blessed-contrib')

const Bus = require('./lib/bus')
const Collector = require('./lib/collector')
const SenecaListener = require('./lib/seneca')

const Memory = require('./lib/widgets/memory')
const MsgGraph = require('./lib/widgets/msg-graph')
const MsgTop = require('./lib/widgets/msg-top')
const Trace = require('./lib/widgets/trace')
const TraceList = require('./lib/widgets/trace-list')
const MeshNetwork = require('./lib/widgets/mesh-network')
const Help = require('./lib/widgets/help')

const bus = new Bus()
const collector = new Collector(bus)
const seneca = new SenecaListener()
const screen = Blessed.screen()

setupScreen()
collector.start()

setTimeout(update, 200)
setTimeout(updateNetwork, 500)


function setupScreen () {
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  screen.render()

  bus.on('msg.select', showTraceList)
  bus.on('trace.select', showTrace)

  const grid = new Contrib.grid({rows: 12, cols: 12, screen: screen})
  const msgGraphParent = grid.set(4, 2, 4, 5, Blessed.box, {label: 'Message Flow'})
  const msgTopParent = grid.set(0, 2, 4, 5, Blessed.box, {label: 'Messages'})
  const memParent = grid.set(4, 0, 4, 2, Blessed.box, {label: 'Memory Utilization (%)'})
  const traceParent = grid.set(8, 0, 4, 12, Blessed.box, {label: 'Trace'})
  const traceListParent = grid.set(8, 0, 4, 12, Blessed.box, {label: 'Traces'})
  const helpParent = grid.set(0, 0, 4, 2, Blessed.box, {label: 'Help'})
  const meshParent = grid.set(0, 7, 8, 5, Blessed.box, {label: 'Mesh Network'})

  new Memory(bus, memParent)
  new MsgGraph(bus, msgGraphParent)
  new MsgTop(bus, msgTopParent)
  new Trace(bus, traceParent)
  new TraceList(bus, traceListParent)
  new Help(bus, helpParent)
  new MeshNetwork(bus, meshParent)

  traceListParent.detach()

  msgTopParent.focus()

  function showTraceList (msg) {
    if (msg) {
      traceParent.detach()
      screen.append(traceListParent)
      traceListParent.focus()
    }
    else {
      traceListParent.detach()
      screen.append(traceParent)
      msgTopParent.focus()
    }
  }

  function showTrace (trace) {
    if (trace) {
      traceListParent.detach()
      screen.append(traceParent)
      traceParent.focus()
    }
    else {
      traceParent.detach()
      screen.append(traceListParent)
      traceListParent.focus()
    }
  }

}

function advertiseNetwork (err, data) {
  bus.emit('mesh', data)
}

function updateNetwork () {
  seneca.getNetwork(advertiseNetwork)
  setTimeout(updateNetwork, 1000)
}

function update () {
  const data = collector.getData()
  bus.emit('data', data)

  screen.render()
  setTimeout(update, 200)
}