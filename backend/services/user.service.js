import userModel from '../models/user.model.js';

export const createUser = async ({ email, password, res }) => {

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({ email: email, password: hashedPassword });

    return user;
}

export const getAllUsers = async ({ userId }) => {
    // $ne (Not Equal) means "Find all users where _id is NOT equal to userId"
    // { email: 1 } → This returns only the email field (excluding other details)
    // const users = await userModel.find({ _id: { $ne: userId } }, { email: 1 });
    const users = await userModel.find({ _id: { $ne: userId } });
    return users;
}