
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '../Login/Login';
import Home from '../Pages/Home/Home';

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
    </Routes>
);

export default AppRoutes;
