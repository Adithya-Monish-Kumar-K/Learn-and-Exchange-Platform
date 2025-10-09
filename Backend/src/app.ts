import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDb, getDb } from './config/db';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import { app, server } from './config/socket';

dotenv.config();

const port = process.env.PORT || 3002;

app.use(
  cors({
    origin: process.env.STATIC_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  const db = getDb();
  if (db) {
    console.log('The Database is connected.');
    res.send('The Database is connected.');
  } else {
    res.send('The Database is not connected.');
  }
});

server.listen(port, () => {
  connectToDb()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
    });
  console.log(`Socket server is running on http://localhost:${port}`);
});
