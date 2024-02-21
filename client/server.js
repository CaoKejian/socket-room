const websocket = require('websocket').server;
const http = require('http');
const { insertMany, getLatestData } = require('./mongodb');

const httpServer = http.createServer().listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});

const websocketServer = new websocket({
  httpServer: httpServer,
  autoAcceptConnections: false
});

const connections = []; // 用于存储所有连接

websocketServer.on('request', function (request) {
  const connection = request.accept();
  connections.push(connection); // 将新连接添加到数组中

  connection.on('message', function (message) {
    console.log('\x1b[35m%s\x1b[0m', '新信息来了：', message.utf8Data);
    insertMany(JSON.parse(message.utf8Data))
    // 将接收到的消息发送给所有连接
    connections.forEach(con => {
      if (con !== connection && con.connected) {
        con.send(message.utf8Data);
      }
    });
  });

  connection.on('close', function () {
    console.log('Connection closed');
    // 当连接关闭时，从数组中移除该连接
    const index = connections.indexOf(connection);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});

// 处理 GET 请求 /api/info
httpServer.on('request', async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/info') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      // 调用暴露的方法，获取最新数据
      const latestData = await getLatestData();

      // 发送 JSON 响应
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(latestData));
    } catch (error) {
      console.error('Error:', error);
      // 发送 500 错误响应
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  } else {
    // 发送 404 Not Found 响应
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
