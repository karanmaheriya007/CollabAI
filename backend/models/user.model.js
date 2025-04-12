import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please Enter a valid email address'],
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must not be longer than 50 characters'],
    },
    password: {
        type: String,
        // This helps in keeping sensitive data secure by default.
        select: false
    }
});

// ✅ Use regular functions (function) when accessing this
// Use statics when the function works at the model level (e.g., hashing passwords, querying all users).
// e.g., userModel.hashPassword()
// Use methods when the function works on an instance (document) level (e.g., verifying a password, checking roles).
// e.g., user.isValidPassword()

userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function () {
    return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

const User = mongoose.model('user', userSchema);

export default User;