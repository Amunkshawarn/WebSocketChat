import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 3000;
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

const users = {};
io.on("connection", (socket) => {
  console.log(`A user ${socket.id} connected`);

  socket.on("register-user", (username) => {
    users[socket.id] = username;
    console.log(`User ${username} registered with ID: ${socket.id}`);
    io.emit("update-users", users);
  });

  socket.on("join-room", (Room) => {
    if (Room) {
      socket.join(Room);
      console.log(`User ${socket.id} joined room: ${Room}`);

      io.to(Room).emit(
        "receive-message",
        `🔔 ${users[socket.id] || socket.id} has joined the room.`
      );
    }
  });

  socket.on("message", ({ messages, Room }) => {
    if (Room) {
      console.log(`Message from ${socket.id} in room ${Room}: ${messages}`);
      io.to(Room).emit(
        "receive-message",
        `${users[socket.id] || socket.id}: ${messages}`
      );
    }
  });

  socket.on("private-message", ({ recipientId, message }) => {
    if (users[recipientId]) {
      io.to(recipientId).emit(
        "receive-message",
        `🔒 Private from ${users[socket.id] || socket.id}: ${message}`
      );
      console.log(
        `Private message from ${socket.id} to ${recipientId}: ${message}`
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    delete users[socket.id];
    io.emit("update-users", users);
  });
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
