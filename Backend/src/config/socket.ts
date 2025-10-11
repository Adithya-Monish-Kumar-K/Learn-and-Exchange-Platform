import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.STATIC_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
});

const userSocketMap: Record<string, string[]> = {};

export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = [];
    userSocketMap[userId].push(socket.id);
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    const userId = socket.handshake.query.userId as string;
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(
        (s) => s !== socket.id
      );
      if (userSocketMap[userId].length === 0) delete userSocketMap[userId];
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
