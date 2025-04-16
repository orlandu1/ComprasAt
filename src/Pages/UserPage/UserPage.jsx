import React, { useEffect, useState } from 'react'
import ModalRegister from '../../Helpers/ModalRegister';
import Alert from '../../Helpers/Alert'
import ModalSelfReset from '../../Helpers/ModalSelfReset';

const UserPage = () => {

    const [userData, setUserData] = useState({
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
    const [usersData, setUsersData] = useState([]);
    const [isAdmin, setIsAdmin] = useState();
    const [modalOpen, setIsModalOpen] = useState(false);
    const { acesso, bloqueioUsuario, emailUsuario, fotoUsuario, hierarquia, loginUsuario, matriculaUsuario, nomeUsuario } = userData;
    const [notification, setNotification] = useState();
    const [isModalPasswordOpen, setIsModalPasswordOpen] = useState(false);

    useEffect(() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('user'));
        if (usuarioLogado) {
            setUserData(usuarioLogado);
        }
    }, []);

    useEffect(() => {
        if (!userData || !userData.hierarquia) return;
        const permissao = userData.hierarquia == 9;
        setIsAdmin(permissao);

    }, [userData]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`/db/users.php`);
            const data = await response.json();

            if (data.response === "success") {
                setUsersData(data.data);
                console.log('Usuários:', data.data);
            } else {
                console.warn('Resposta inesperada:', data);
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    useEffect(() => {
        if (!modalOpen) {
            console.log('modal está fechado!');
            fetchUsers();
        }
    }, [modalOpen])


    const timeFormat = (dateTimeString) => {
        if (!dateTimeString) return '';

        const [datePart, timePart] = dateTimeString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        return `${day}/${month}/${year} às ${hour}:${minute}`;
    };

    const handleAccountAction = async (action, login) => {
        try {
            const response = await fetch('/db/accountManage.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    login: login,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao realizar a ação');
            }

            const responseData = await response.json();

            if (responseData.response) {
                setNotification(responseData.response);
            }

            const result = await response.json();
            console.log(result);

        } catch (error) {
            console.error('Erro:', error);
        }
    };

    const handleDelete = (login) => {
        handleAccountAction('delete', login);
        fetchUsers();
    }

    const handleReset = (login) => {
        handleAccountAction('reset', login);
        fetchUsers();
    }

    const handleSelfReset = () => {

        if (isModalPasswordOpen) {
            setIsModalPasswordOpen(false);

        } else {
            setIsModalPasswordOpen(true);
        }
    }

    return (


        < div >

            {modalOpen ? <ModalRegister setIsModalOpen={setIsModalOpen} /> : ''}
            {notification ? <Alert tipo={'info'} mensagem={notification} tempo={5} /> : ''}
            {isModalPasswordOpen ? <ModalSelfReset handleSelfReset={handleSelfReset}/> : ''}
            <div className="flex grid-cols-2 gap-5 w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">


                <div className="flex  items-center">
                    <div className="max-w-[720px] mx-auto">
                        <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-70">
                            <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-80">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnSA1zygA3rubv-VK0DrVcQ02Po79kJhXo_A&s"
                                    alt="card-image" className="object-cover w-full h-full" />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-900">
                                        {nomeUsuario}
                                    </p>
                                    <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-900">
                                        {hierarquia}
                                    </p>
                                </div>
                                <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75">
                                    {loginUsuario}
                                </p>
                            </div>
                            <div className="flex p-6 pt-0">
                                <button
                                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
                                    type="button" onClick={() => handleSelfReset()}>
                                    Alterar Senha
                                </button>

                                <button
                                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
                                    type="button">
                                    Alterar Foto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                {isAdmin ?

                    <div className="flex  items-center">

                        <div class="max-w-[950px] mx-auto">

                            <div class="relative flex flex-col w-full h-full text-slate-700 bg-white shadow-md rounded-xl bg-clip-border">
                                <div class="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-white rounded-none bg-clip-border">
                                    <div class="flex items-center justify-between ">
                                        <div>
                                            <h3 class="text-lg font-semibold text-slate-800">Usuários da Plataforma</h3>
                                            <p class="text-slate-500">Gerenciamento de Usuários</p>
                                        </div>
                                        <div class="flex flex-col gap-2 shrink-0 sm:flex-row">

                                            <button
                                                class="flex select-none items-center gap-2 rounded bg-slate-800 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                type="button"
                                                onClick={() => setIsModalOpen(true)}>

                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                                                    stroke-width="2" class="w-4 h-4">
                                                    <path
                                                        d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z">
                                                    </path>
                                                </svg>
                                                Criar Conta
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                <div class="p-0 overflow-scroll h-120 ">
                                    <table class="mt-4 text-left table-auto min-w-max">
                                        <thead>
                                            <tr>
                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                                                        Usuário

                                                    </p>
                                                </th>
                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                                                        Role

                                                    </p>
                                                </th>

                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                                                        Matrícula

                                                    </p>
                                                </th>

                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                                                        Acesso

                                                    </p>
                                                </th>

                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                                                        Cadastro

                                                    </p>
                                                </th>
                                                <th
                                                    class="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                                                    <p
                                                        class="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                                                    </p>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersData.map((user, index) => (
                                                <tr key={index}>
                                                    <td className="p-4 border-b border-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={user.fotoUsuario ? user.fotoUsuario : 'https://cdn-icons-png.flaticon.com/512/10542/10542486.png'}
                                                                alt={user.nomeUsuario}
                                                                className="relative inline-block h-9 w-9 !rounded-full object-cover object-center"
                                                            />

                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-semibold text-slate-700">
                                                                    {user.nomeUsuario}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {user.loginUsuario}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b border-slate-200">
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {user.hierarquia === 9 ? 'Admin' : 'Usuário Comum'}
                                                            </p>
                                                            <p className="text-sm text-slate-500">
                                                                {user.acesso}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="p-4 border-b border-slate-200">
                                                        <p className="text-sm text-slate-500">
                                                            {user.matriculaUsuario}
                                                        </p>
                                                    </td>

                                                    <td className="p-4 border-b border-slate-200">
                                                        <div className="w-max">
                                                            <div className="relative grid items-center px-2 py-1 font-sans text-xs border-slate-200 uppercase rounded-md select-none whitespace-nowrap">
                                                                <span className="">
                                                                    {user.ultimoAcesso ? timeFormat(user.ultimoAcesso) : 'nunca acessou'}
                                                                </span>                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="p-4 border-b border-slate-200">
                                                        <p className="text-sm text-slate-500">
                                                            {timeFormat(user.dataCadastro)}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 border-b border-slate-200">
                                                        <select
                                                            className="px-1 py-1 w-5 text-sm border rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            onChange={(e) => {
                                                                const action = e.target.value;
                                                                if (action === 'delete') {

                                                                    handleDelete(user.loginUsuario)

                                                                } else if (action === 'reset') {

                                                                    handleReset(user.loginUsuario)
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        >
                                                            <option value="" disabled selected hidden>Ações</option>
                                                            <option value="delete">🗑️ Excluir conta</option>
                                                            <option value="reset">🔄 Resetar senha</option>
                                                        </select>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                                <div class="flex items-center justify-between p-3">

                                </div>
                            </div>





                        </div>
                    </div>
                    : ''}
            </div>
        </div >
    )
}

export default UserPage
