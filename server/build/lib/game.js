"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const generateParagraph_1 = require("./generateParagraph");
const setupListeners_1 = require("./setupListeners");
class Game {
    constructor(id, io, host) {
        this.gameId = id;
        this.gameStatus = "not-started";
        this.gameHost = host;
        this.io = io;
        this.players = [];
        this.paragraph = "";
    }
    setupListeners(socket) {
        socket.on("start-game", () => __awaiter(this, void 0, void 0, function* () {
            if (this.gameStatus === "in-progress")
                return socket.emit("error", "Game has already started");
            if (this.gameHost !== socket.id)
                return socket.emit("error", "Only host can start the game");
            for (const player of this.players) {
                player.score = 0;
            }
            this.io.to(this.gameId).emit("players", this.players);
            this.gameStatus = "in-progress";
            const paragraph = yield (0, generateParagraph_1.generateParagraph)();
            this.paragraph = paragraph;
            this.io.to(this.gameId).emit("game-started", paragraph);
            setTimeout(() => {
                this.gameStatus = "finished";
                this.io.to(this.gameId).emit("game-finished");
                this.io.to(this.gameId).emit("players", this.players);
            }, 60000);
        }));
        socket.on("player-typed", (typed) => {
            if (this.gameStatus !== "in-progress")
                return socket.emit("error", "The game has not started yet");
            const splittedParagraph = this.paragraph.split(" ");
            const splittedTyped = typed.split(" ");
            let score = 0;
            for (let i = 0; i < splittedTyped.length; i++) {
                if (splittedTyped[i] === splittedParagraph[i]) {
                    score++;
                }
                else {
                    break;
                }
            }
            const player = this.players.find((player) => player.id === socket.id);
            if (player) {
                player.score = score;
            }
            this.io.to(this.gameId).emit("player-score", { id: socket.id, score });
        });
        socket.on("leave", () => {
            if (socket.id === this.gameHost) {
                this.players = this.players.filter((player) => player.id !== socket.id);
                if (this.players.length !== 0) {
                    this.gameHost = this.players[0].id;
                    this.io.to(this.gameId).emit("new-host", this.gameHost);
                    this.io.to(this.gameId).emit("player-left", socket.id);
                }
                else {
                    // Delete the game if the host leaves and there are no players
                    setupListeners_1.rooms.delete(this.gameId);
                }
            }
            socket.leave(this.gameId);
            this.players = this.players.filter((player) => player.id !== socket.id);
            this.io.to(this.gameId).emit("player-left", socket.id);
        });
        socket.on("disconnect", () => {
            if (socket.id === this.gameHost) {
                this.players = this.players.filter((player) => player.id !== socket.id);
                if (this.players.length !== 0) {
                    this.gameHost = this.players[0].id;
                }
                else {
                    // Delete the game if the host leaves and there are no players
                    setupListeners_1.rooms.delete(this.gameId);
                }
            }
            socket.leave(this.gameId);
            this.players = this.players.filter((player) => player.id !== socket.id);
        });
    }
    ;
    joinPlayer(id, name, socket) {
        if (this.gameStatus === "in-progress") {
            socket.emit("error", "Game has already started");
        }
        this.players.push({ id, name, score: 0 });
        this.io.to(this.gameId).emit("player-joined", {
            id,
            name,
            score: 0,
        });
        socket.emit("players", this.players);
        socket.emit("new-host", this.gameHost);
        this.setupListeners(socket);
    }
}
exports.Game = Game;
