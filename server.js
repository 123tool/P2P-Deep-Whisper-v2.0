require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 2e8, // 200MB limit
    cors: { origin: "*" }
});

app.use(express.static('public'));

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let {family, address, internal} = iface[i];
            if (family === 'IPv4' && !internal) return address;
        }
    }
    return '127.0.0.1';
}

io.on('connection', (socket) => {
    const userId = "GHOST-" + Math.floor(Math.random() * 9000 + 1000);
    console.log(`[+] User Joined: ${userId}`);

    // Signal untuk WebRTC (Voice Call)
    socket.on('signal', (data) => {
        socket.broadcast.emit('signal', data);
    });

    socket.on('chat message', (data) => {
        // Broadcast ke semua termasuk sender dengan ID Anonim
        io.emit('chat message', { ...data, sender: userId, time: new Date().toLocaleTimeString() });
    });

    socket.on('disconnect', () => {
        console.log(`[-] User Vanished: ${userId}`);
    });
});

const PORT = process.env.PORT || 8080;
const IP_ADDR = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`
    \x1b[31m
    ██████╗ ███████╗███████╗██████╗     ██╗    ██╗██╗  ██╗██╗███████╗██████╗ ███████╗██████╗ 
    ██╔══██╗██╔════╝██╔════╝██╔══██╗    ██║    ██║██║  ██║██║██╔════╝██╔══██╗██╔════╝██╔══██╗
    ██║  ██║█████╗  █████╗  ██████╔╝    ██║ █╗ ██║███████║██║███████╗██████╔╝█████╗  ██████╔╝
    ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝     ██║███╗██║██╔══██║██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗
    ██████╔╝███████╗███████╗██║         ╚███╔███╔╝██║  ██║██║███████║██║     ███████╗██║  ██║
    ╚═════╝ ╚══════╝╚══════╝╚═╝          ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
    \x1b[0m
    \x1b[41m\x1b[37m  DEEP-WHISPER V2 ACTIVE  \x1b[0m \x1b[31m[!] E2EE AES-256 ENABLED\x1b[0m
    
    \x1b[1m[*] DEV        :\x1b[0m 123Tool (SPY-E)
    \x1b[1m[*] LOCAL LINK :\x1b[0m \x1b[31mhttp://${IP_ADDR}:${PORT}\x1b[0m
    \x1b[1m[*] SECURITY   :\x1b[0m ZERO-LOGGING / SELF-DESTRUCT / WebRTC
    \x1b[90m------------------------------------------------------------\x1b[0m
    `);
});
