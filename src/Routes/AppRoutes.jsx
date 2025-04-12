
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '../Login/Login';
import Home from '../Pages/Home/Home';
import Upload from '../Pages/Upload/Upload';

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<Upload />} />

    </Routes>
);

export default AppRoutes;
