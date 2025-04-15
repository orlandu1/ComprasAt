import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

import Login from '../Login/Login';
import Home from '../Pages/Home/Home';
import Upload from '../Pages/Upload/Upload';
import ErrorPage from '../Pages/ErrorPage/ErrorPage';
import UserPage from '../Pages/UserPage/UserPage';

const AppRoutes = () => {
    const { logged } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={!logged ? <Login /> : <Navigate to="/home" />}
            />

            <Route
                path="/home"
                element={logged ? <Home /> : <Navigate to="/erro" />}
            />

            <Route
                path="/upload"
                element={logged ? <Upload /> : <Navigate to="/erro" />}
            />

            <Route
                path="/userPage"
                element={logged ? <UserPage /> : <Navigate to="/erro" />}
            />

            <Route path="/erro" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    );
};

export default AppRoutes;
