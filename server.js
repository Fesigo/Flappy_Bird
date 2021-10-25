const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

var WebSocketServer = require('websocket').server;

app.use(express.static(__dirname));

app.get('/screenleft', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/screenright', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

const port = 3003;

server.listen(port, () => console.log(`Server started on port ${port}`));

wsServer = new WebSocketServer({
    httpServer: server
});

const clients = [];

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin)
    clients.push(connection);
    
    connection.on('message', message => {
        // console.log(message.utf8Data);
        clients.forEach(c => {
            c.send(message.utf8Data);
        })
    })

    connection.on('close', message => {
        console.log('Closed Connection');
    })
})