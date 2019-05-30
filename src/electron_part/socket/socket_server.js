const net = require('net')
const moment = require('moment')
// Keep track of the chat clients
let clients = []
let clientDataMap = {}
let dataArray = {}

// Start a TCP Server
net.createServer({pauseOnConnect: true},function (socket) {
  // Identify this client
  socket.name = socket.remoteAddress + ':' + socket.remotePort

  // Put this new client in the list
  clients.push(socket)
  clientDataMap[socket.name] = []
  
  // Send a nice welcome message and announce
  socket.write('Welcome ' + socket.name + '\n')
  console.log(socket.name + ' 客户端已经连接')

  // Handle incoming messages from clients.
  // 收到数据
  socket.on('data', function (data) {
    clientDataMap[socket.name].push(...data)
    formatData(socket.name)
  })

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    console.log(socket.name + ' 客户端断开连接----')
    clients.splice(clients.indexOf(socket), 1)
  })

  socket.on('close', function () {
    console.log(socket.name + ' 客户端已关闭----')
    clients.splice(clients.indexOf(socket), 1)
  })
  socket.on('error', function () {
    console.log(socket.name + ' 客户端错误❌----')
    clients.splice(clients.indexOf(socket), 1)
  })
  socket.on('timeout', function () {
    console.log(socket.name + ' 客户端连接超时----')
    clients.splice(clients.indexOf(socket), 1)
  })

  process.on('message', msg => {
    if (msg.type === 'resume') {
      socket.resume()
    }
    if (msg.type === 'pause') {
      socket.pause()
    }
  })
}).listen(8899)

function formatData(name) {
  if (clientDataMap[name] && clientDataMap[name].length > 8) {
    const data = clientDataMap[name].splice(0, 8)
    // TODO
    if (!dataArray[name]) {
      dataArray[name] = []
    }

    dataArray[name].push(getAD(data[2], data[3]))
    if (dataArray[name].length >= 1000) {
      let wifiData = [...dataArray[name]]
      let clientName = name.split(':')[3]
      clientName = clientName.split('.').join('-')
      process.send({type: 'saveWifiData', clientName: clientName, wifiData: wifiData, recordTime: moment().format('YYYY-MM-DD HH:mm:ss') })

      dataArray[name] = []
    }

    // 调用业务方法
    formatData(name)
  }
}

function getAD(data1, data2) {
  let a = ((((data2 & 0x1F) * 32 + data1) * 3.3) / 1024).toFixed(3)
  return a
}

// Put a friendly message on the terminal of the server.
console.log('Chat server running at port 8899\n')
