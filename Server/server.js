import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // your frontend origin
  credentials: true,
}));
app.use(express.json()); // ✅ parses JSON body
app.use(express.urlencoded({ extended: true })); // ✅ handles form data
app.use(cookieParser());


// ✅ API Endpoints
app.get('/', (req, res) => res.send('API is working'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);
// app.use((req, res, next) => {
//   if (!req.body) req.body = {};
//   next();
// });

// ✅ Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
