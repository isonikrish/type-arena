"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
exports.setupListeners = setupListeners;
const game_1 = require("./game");
exports.rooms = new Map();
function setupListeners(io) {
    io.on("connection", (socket) => {
        console.log(`new connection: ${socket.id}`);
        socket.on("join-game", (roomId, name) => {
            if (!roomId) {
                return socket.emit("error", "Invalid room id");
            }
            if (!name) {
                return socket.emit("error", "Please provide name");
            }
            socket.join(roomId);
            if (exports.rooms.has(roomId)) {
                const game = exports.rooms.get(roomId);
                if (!game)
                    return socket.emit("error", "Game not found");
                game.joinPlayer(socket.id, name, socket);
            }
            else {
                const game = new game_1.Game(roomId, io, socket.id);
                exports.rooms.set(roomId, game);
                game.joinPlayer(socket.id, name, socket);
            }
        });
    });
}
