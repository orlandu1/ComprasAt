import React, { useState } from 'react';


const Upload = () => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('Clique aqui para enviar');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleFileSubmit = async () => {
        setMessage(`Enviando arquivo... Aguarde`);

        if (selectedFile) {
            await handleServerUpload(selectedFile);
            setMessage(`Arquivo Enviado! ${selectedFile.name}`);

            setTimeout(() => {
                setMessage(`Clique aqui para enviar`);
            }, 3000);


            setSelectedFile(null);
        } else {
            setMessage("Nenhum arquivo selecionado.");

            setTimeout(() => {
                setMessage(`Clique aqui para enviar`);
            }, 3000);
        }
    };

    const handleFileCancel = () => {
        setSelectedFile(null);
        setMessage("Envio cancelado!");

        setTimeout(() => {
            setMessage(`Clique aqui para enviar`);
        }, 3000);
    };


    const handleServerUpload = async (file) => {

        if (!file) return;

        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('tipo', 'encarte');
        formData.append('login', ((localStorage.getItem('user')).loginUsuario));

        try {
            const response = await fetch('/db/upload.php', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();



        } catch (err) {
            setMessage('Erro ao enviar imagem:', err);

            setTimeout(() => {
                setMessage(`Clique aqui para enviar`);
            }, 3000);
        }

    };


    return (
        <div>
            <div className="flex w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">

                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
                <div className="py-20 px-2">

                    <div className="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                        <div className="md:flex">
                            <div className="w-full p-3">

                                <div className="relative border-dotted h-48 rounded-lg border-2 border-blue-700 bg-gray-100 flex justify-center items-center">
                                    <div className="absolute">

                                        <div className="flex flex-col items-center">
                                            <i className="fa fa-folder-open fa-4x text-blue-700"></i>

                                            {selectedFile && (
                                                <span className="block text-center text-gray-400 font-normal">
                                                    {selectedFile.name} - {selectedFile.size}
                                                </span>
                                            )}
                                            <span className="block text-center text-gray-400 font-normal">
                                                {message}
                                            </span>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="h-full w-full opacity-0"
                                        onChange={handleFileChange}
                                        key={selectedFile ? selectedFile.name : 'no-file'}

                                    />

                                </div>

                                <div className='flex justify-center'>
                                    <div className='flex justify-center mt-2'>
                                        <button
                                            className="border border-green-500 bg-green-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-green-600 focus:outline-none focus:shadow-outline"
                                            onClick={handleFileSubmit}
                                        >
                                            Enviar
                                        </button>
                                    </div>

                                    <div className='flex justify-center mt-2'>
                                        <button
                                            className="border border-red-500 bg-red-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-red-600 focus:outline-none focus:shadow-outline"
                                            onClick={handleFileCancel}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br />

                    </div>
                </div>
            </div>
        </div>

    )
}

export default Upload
