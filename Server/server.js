import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import googleAuth from './middleware/googleauth.js';
import userAuth from './middleware/userAuth.js';

const app = express();
const port = process.env.PORT || 5000;

// ✅ Connect MongoDB
connectDB();

// ✅ Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // your frontend
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Express-Session MUST come BEFORE passport
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true if using HTTPS
  })
);

// ✅ Passport initialization AFTER session
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("✅ Google User Profile:", profile); // 👈 Add this line
      return done(null, profile);
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// ✅ Routes
app.get('/', (req, res) => res.send('API is working'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);

// ✅ Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account' })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuth,
  (req, res, next) => {
    res.redirect('http://localhost:5173/');
  }
);

// ✅ Start Server
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
