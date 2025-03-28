const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const port = 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://your-frontend-url.onrender.com"], // Allow both local and hosted frontend
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: "*" })); // Allows requests from anywhere

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendMessage", (message) => {
        io.emit("receiveMessage", message); // Broadcast to all users
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});
