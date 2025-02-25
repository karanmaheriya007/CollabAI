import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setUser } = useContext(UserContext);

    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        axios.post('/users/login', { email, password })
            .then((res) => {
                //console.log(res.data);
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                navigate('/');
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-white text-center">Login</h2>

                <form className="mt-6" onSubmit={submitHandler}>
                    {/* Email Field */}
                    <div>
                        <label className="text-gray-300 block mb-2">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mt-4">
                        <label className="text-gray-300 block mb-2">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
                    >
                        Login
                    </button>
                </form>

                {/* Signup Navigation */}
                <p className="text-gray-400 text-center mt-4">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
