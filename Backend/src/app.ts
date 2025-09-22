import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDb, getDb } from "./config/db";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const port = process.env.PORT || 3002;

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    const db = getDb();
    if (db) {
        console.log('The Database is connected.');
        res.send('The Database is connected.');
    } else {
        res.send('The Database is not connected.');
    }
});

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});