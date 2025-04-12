import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { useUser } from "../context/user.context";
import AlertMessage from './AlertMessage';

const Register = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ severity: '', message: '' });

    const { setUser } = useUser();

    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        axiosInstance.post('/users/register', { email, password })
            .then((res) => {
                console.log(res.data);
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                navigate('/');

            })
            .catch((err) => {
                const errorMessage = err?.response?.data?.message;

                // Clear alert first
                setAlert({ severity: '', message: '' });

                // Delay to trigger rerender
                setTimeout(() => {
                    setAlert({ severity: 'error', message: errorMessage });
                }, 50);
            })
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-white text-center">Sign Up</h2>

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

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Signup Navigation */}
                <p className="text-gray-400 text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
            {/* Alert Message */}
            <AlertMessage severity={alert.severity} message={alert.message} />
        </div>
    );
};

export default Register;
