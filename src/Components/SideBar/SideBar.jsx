import React, { useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { AiOutlineHome, AiOutlineCloudUpload, AiOutlineUser, AiTwotoneContainer } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';

const SideBar = () => {
    const { logged } = useAuth();
    const [hover, setIsHover] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { icon: <AiOutlineHome size={22} />, label: 'Início', route: '/home' },
        { icon: <AiTwotoneContainer size={22} />, label: 'Relatório', route: '/relatorio' },
        { icon: <AiOutlineCloudUpload size={22} />, label: 'Upload', route: '/upload' },
        { icon: <AiOutlineUser size={22} />, label: 'Usuário', route: '/usuario' },
    ];

    if (!logged) return null;

    return (
        <div
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className='bg-white w-16 hover:w-48 h-screen p-3 rounded-xl shadow-lg transition-all duration-300 border border-gray-200'
        >
            <div className='flex flex-col space-y-4 mt-4'>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(item.route)}
                        className='flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group'
                    >
                        <div className='text-gray-600 group-hover:text-blue-600'>
                            {item.icon}
                        </div>
                        {hover && <span className='text-sm font-medium text-gray-800 transition-opacity'>{item.label}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SideBar;
