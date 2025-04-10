"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const setupListeners_1 = require("./lib/setupListeners");
const PORT = process.env.PORT || 8080;
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
(0, setupListeners_1.setupListeners)(io);
httpServer.listen(PORT);
