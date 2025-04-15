import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ErrorPage = () => {

    const { logout } = useAuth();


    const navigate = useNavigate();
    const [contador, setContador] = useState(3);

    const fazerLogin = () => {
        navigate('/');
    };

    useEffect(() => {
        const intervalo = setInterval(() => {
            setContador((prev) => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            logout();
            fazerLogin();
        }, 2000);

        return () => {
            clearInterval(intervalo);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div>
            <section className="w-341 flex items-center h-screen p-16 bg-gray-50 dark:bg-gray-700">
                <div className="container flex flex-col items-center">
                    <div className="flex flex-col gap-6 max-w-md text-center">
                        <h6 className="font-extrabold text-5xl text-gray-600 dark:text-gray-100">
                            Você foi desconectado!
                        </h6>
                        <p className="text-2xl md:text-3xl dark:text-gray-300">
                            Voltando para a página inicial em {contador}...
                        </p>
                       
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ErrorPage;
