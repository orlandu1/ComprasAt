import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState({ usuario: '', senha: '' });

    const [dataSession, setDataSession] = useState({
        acesso: "",
        bloqueioUsuario: "",
        emailUsuario: "",
        fotoUsuario: "",
        hierarquia: "",
        loginUsuario: "",
        matriculaUsuario: "",
        nomeUsuario: "",
        ultimoAcesso: "",
        dataCadastro: "",
    });

    const [logged, setIsLogged] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setDataSession(storedUser);
            setIsLogged(true);
            navigate('/Home');
        } else {
            setUser({});
            setIsLogged(false);
            navigate('/');
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('/db/valida.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: username, senha: password }),
            });

            const data = await response.json();


            if (data.response === 'success') {
                const newUser = { usuario: username, senha: password };

                const dataSession = {
                    "acesso": data.session.acesso,
                    "bloqueioUsuario": data.session.bloqueioUsuario,
                    "emailUsuario": data.session.emailUsuario,
                    "fotoUsuario": data.session.fotoUsuario,
                    "hierarquia": data.session.hierarquia,
                    "loginUsuario": data.session.loginUsuario,
                    "matriculaUsuario": data.session.matriculaUsuario,
                    "nomeUsuario": data.session.nomeUsuario,
                    "ultimoAcesso": data.session.ultimoAcesso,
                    "dataCadastro": data.session.dataCadastro,
                }

                setDataSession(dataSession)


                setUser(newUser);
                setIsLogged(true);
                localStorage.setItem('user', JSON.stringify(dataSession));
                navigate('/Home');
                setError(null);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser({});
        setIsLogged(false);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, error, logged, dataSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
