import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';

export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Get the first error message only
        const firstError = errors.array()[0].msg;
        return res.status(400).json({ message: firstError });
    }

    try {
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        // don't send password on frontend for better security
        delete user._doc.password;

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return res.status(400).json({ message: firstError });
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = await user.generateJWT();

        delete user._doc.password;

        return res.status(200).json({ user, token });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const profileController = async (req, res) => {
    res.status(200).json({ user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        // Best Practice: Combine Both for Maximum Security
        res.cookie('token', '', { maxAge: 0, httpOnly: true }); // Clear cookie
        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24); // Blacklist token

        res.status(200).json({ message: 'Logged out successfully' });

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        res.status(200).json(allUsers);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}