import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserProfile } from '../controllers/userController.js';

const userRoutes = express.Router();
userRoutes.get('/data', userAuth, getUserProfile);
export default userRoutes;