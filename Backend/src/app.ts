import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToDb, getDb } from './config/db';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import reviewSupportRoutes from './routes/reviewSupport.routes';
import userRoutes from './routes/user.routes';
import statRoutes from './routes/stats.routes';
import chartRoutes from './routes/chart.routes';
import taskRoutes from './routes/Task.routes';
import offerRoutes from './routes/offer.routes';
import { app, server } from './config/socket';

dotenv.config();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', reviewSupportRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/charts', chartRoutes);

app.get('/', (req, res) => {
  const db = getDb();
  if (db) {
    console.log('The Database is connected.');
    res.send('The Database is connected.');
  } else {
    res.send('The Database is not connected.');
  }
});

connectToDb()
  .then(() => {
    server.listen(port, () => {
      console.log(
        `Server and Socket.IO are running on http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
