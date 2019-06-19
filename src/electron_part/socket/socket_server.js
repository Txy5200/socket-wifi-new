const net = require('net')
// Keep track of the chat clients
let clients = []

// Start a TCP Server

let server = net.createServer(function (socket) {
  // Identify this client
  socket.name = socket.remoteAddress + ':' + socket.remotePort

  // Put this new client in the list
  clients.push(socket)

  // Send a nice welcome message and announce
  socket.write('Welcome ' + socket.name + '\n')

  // Handle incoming messages from clients.
  // 收到数据
  socket.on('data', function (data) {
    formatData(socket.name, data)
    // 数据量太大直接递归会导致堆栈溢出,采用下面的方式调用
    // trampoline(formatData, socket.name)
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

  socket.on('error', function (err) {
    console.log(socket.name + ' 客户端错误❌----', err)
    clients.splice(clients.indexOf(socket), 1)
  })

  socket.on('timeout', function () {
    console.log(socket.name + ' 客户端连接超时----')
    clients.splice(clients.indexOf(socket), 1)
    socket.end()
  })

  socket.setTimeout(30000)
})

process.on('message', msg => {
  if (msg.type === 'resume') {
    console.log('开始检测')
    server.listen(8899)
  }
  if (msg.type === 'pause') {
    console.log('结束检测')
    server.close()
    clients.forEach((socketTemp) => {
      socketTemp.end()
    })
  }
})

server.on('close', function () {
  console.log('server关闭----')
})

server.on('error', function (err) {
  console.log('server错误----', err)
})

function formatData(name, data) {
  for(let i=0; i<data.length; i++){
    if(((data[i]&0xe0)==0x00)&&((data[i+1]&0xe0)==0x60)){
      let wifiData = getAD(data[i], data[i+1])
      let clientName = name.split(':')[3]
      clientName = clientName.split('.').join('-')
      process.send({ type: 'saveWifiData', clientName: clientName, wifiData: wifiData })
    }
  }
}

// function formatData(name) {
//   while (clientDataMap[name] && clientDataMap[name].length > 8) {
//     const data = clientDataMap[name].splice(0, 8)

//     let wifiData = getAD(data[2], data[3])
//     let clientName = name.split(':')[3]
//     clientName = clientName.split('.').join('-')
//     process.send({ type: 'saveWifiData', clientName: clientName, wifiData: wifiData })

//     // 调用业务方法
//     // formatData(name)
//     // 数据量太大时直接递归会导致堆栈溢出,采用下面的方式调用
//     // return function() {
//     //   return formatData(name)
//     // }
//   }
//   // return null
// }

function trampoline(func, arg) {
  var value = func(arg)
  while (typeof value === "function") {
    value = value()
  }
  return value
}

function getAD(data1, data2) {
  let a = ((((data2 & 0x1F) * 32 + data1) * 3.3) / 1024).toFixed(3)
  return a
}

// Put a friendly message on the terminal of the server.
console.log('Chat server running at port 8899\n')
