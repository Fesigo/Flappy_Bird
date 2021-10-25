const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app); // creating server

var WebSocketServer = require('websocket').server; // creating websocket server

app.use(express.static(__dirname));

// route for the left screen
app.get('/screenleft', (req, res) => { 
    res.sendFile(path.join(__dirname, '/index.html'));
})

// route for the right screen
app.get('/screenright', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

const port = 3003;

server.listen(port, () => console.log(`Server started on port ${port}`));


wsServer = new WebSocketServer({
    httpServer: server
});

const clients = []; // array of clients connected

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin) // accepting new connection
    clients.push(connection);
    
    // sending messages from the server to all clients connected
    connection.on('message', message => {
        // console.log(message.utf8Data);
        clients.forEach(c => {
            c.send(message.utf8Data);
        })
    })

    // log message when connections end
    connection.on('close', message => {
        console.log('Closed Connection');
    })
})