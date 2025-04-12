import React, { useState } from 'react'

import { useAuth } from '../../Context/AuthContext';

import { AiOutlineHome } from "react-icons/ai";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { AiTwotoneContainer } from "react-icons/ai";

const SideBar = () => {

    const { logged } = useAuth();
    const [hover, setIsHover] = useState();
    const navigate = useNavigate();
    const mouseEntrou = () => setIsHover(true);
    const mouseSaiu = () => setIsHover(false);

    const navegar = (screen) => {
        navigate(screen);
    }

    return (

        logged ? (
            <div onMouseEnter={() => mouseEntrou()} onMouseLeave={() => mouseSaiu()} className='bg-gray-700 w-15 m-1 h-135 rounded-xl shadow-xl/30 hover:w-30 transition-all'>
                <div className='mt-2 mx-3'>

                    <div className='bg-amber-50 border-1 text-sm border-indigo-500 text-indigo-500 rounded-lg text-start mt-3 hover:bg-indigo-500
                     hover:text-amber-50 active:bg-indigo-700 shadow-xl cursor-pointer transition-all' onClick={() => navegar('/home')}>
                        <button type="button">
                            <div className='flex cursor-pointer'>
                                <AiOutlineHome size={23} className='px-1 py-1' />
                                {hover && 'Início'}

                            </div>
                        </button>
                    </div>

                    <div className='bg-amber-50 border-1 text-sm border-indigo-500 text-indigo-500 rounded-lg text-start mt-3 hover:bg-indigo-500
                     hover:text-amber-50 active:bg-indigo-700 shadow-xl cursor-pointer transition-all'>
                        <button type="button">
                            <div className='flex cursor-pointer'>
                                <AiTwotoneContainer size={23} className='px-1 py-1' />
                                {hover && 'Relatório'}

                            </div>
                        </button>
                    </div>

                    <div className='bg-amber-50 border-1 text-sm border-indigo-500 text-indigo-500 rounded-lg text-start mt-3 hover:bg-indigo-500
                     hover:text-amber-50 active:bg-indigo-700 shadow-xl cursor-pointer transition-all' onClick={() => navegar('/upload')}
                    >
                        <button type="button">
                            <div className='flex cursor-pointer'>
                                <AiOutlineCloudUpload size={23} className='px-1 py-1' />
                                {hover && 'Upload'}

                            </div>
                        </button>
                    </div>

                    <div className='bg-amber-50 border-1 text-sm border-indigo-500 text-indigo-500 rounded-lg text-start mt-3 hover:bg-indigo-500
                     hover:text-amber-50 active:bg-indigo-700 shadow-xl cursor-pointer transition-all'>
                        <button type="button">
                            <div className='flex cursor-pointer'>
                                <AiOutlineUser size={23} className='px-1 py-1' />
                                {hover && 'Usuário'}

                            </div>
                        </button>
                    </div>

                </div>
            </div>) : null
    )
}

export default SideBar
