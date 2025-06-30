import express from 'express'
import { login, signup, logout, updateProfile, checkAuth } from '../controller/authController.js'
import { protectRoute } from '../middleware/auth.middlware.js'



const authRouter = express.Router()

authRouter.post('/login', login)
authRouter.post('/signUp', signup)

authRouter.post('/logout', logout);

authRouter.put('/update-profile', updateProfile);

authRouter.get('/check', protectRoute, checkAuth);


export default authRouter





