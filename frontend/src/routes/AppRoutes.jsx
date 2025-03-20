import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Project from '../screens/Project';
import UserAuth from '../auth/UserAuth';
import CodeReviewer from '../screens/CodeReviewer';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserAuth><Home /></UserAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/project/:id" element={<UserAuth><Project /></UserAuth>} />
                <Route path="/code-reviewer" element={<CodeReviewer />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
