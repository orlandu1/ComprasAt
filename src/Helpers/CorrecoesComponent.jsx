import React, { useState, useEffect } from "react";


export default function CorrecoesComponent({ praca, token, annotations, onPdfChanged }) {
    const [totalItens, setTotalItens] = useState(0);
    const [correcoes, setCorrecoes] = useState(0);
    const [salvo, setSalvo] = useState(false);
    const [isPercentValid, setisPercentValid] = useState(true);
    const [isOpenModalUpload, setIsOpenModalUpload] = useState(false);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');



    useEffect(() => {
        const fetchPdf = async () => {
            try {

                const response = await fetch('/db/getPdf.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ praca: praca, token: token }),
                });

                const data = await response.json();

                setCorrecoes(data.correcoes);
                setTotalItens(prev => prev === 0 ? data.itens : prev);


            } catch (error) {
                console.error('Erro:', error);

            }
        };

        fetchPdf();

    }, [annotations, praca]);

    const progresso = Math.round((correcoes / totalItens) * 100);


    useEffect(() => {
        if (!Number.isFinite(progresso)) {
            setisPercentValid(false);
        } else {
            setisPercentValid(true);
        }

    }, [annotations, praca, salvo])



    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setUploadStatus('');
        }
    };



    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('files[]', file);
        formData.append('pracaIds[]', praca);
        formData.append('tokenCampanha', token);
        formData.append('login', JSON.parse(localStorage.getItem('user')).loginUsuario);

        try {
            const response = await fetch('/db/uploadEncartes.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {

                alert("arquivo enviado com sucesso!");
                setUploadStatus('success');
                console.log("Resposta do servidor:", data);
                setIsUploading(false);
                onPdfChanged();
                setIsOpenModalUpload(false);
                setFile('');


            }

        } catch (error) {
            setUploadStatus('fail');
            console.error("Erro ao enviar:", error);
        } finally {
            setIsUploading(false);
        }
    };



    const handleItensChange = async (e) => {
        const valor = Number(e.target.value);
        setTotalItens(valor);
        setSalvo(false);

        try {
            await fetch('/db/updateItens.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    praca: praca,
                    token: token,
                    itens: valor,
                }),
            });
            setSalvo(true);
        } catch (error) {
            console.error('Erro ao atualizar total de itens:', error);
        }
    };


    const handleModalUpload = (is) => {
        setIsOpenModalUpload(is);
    }



    return (
        <div className="w-100 h-full mx-auto p-4 border rounded-xl shadow bg-white space-y-6">

            {isOpenModalUpload ? (

                <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full transform transition-all duration-300 scale-[0.98] hover:scale-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Upload de Arquivo</h2>
                                <p className="text-gray-600 mt-1">Envie o arquivo correspondente à campanha</p>
                            </div>
                            <button
                                onClick={() => handleModalUpload(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Praça</p>
                                <p className="font-medium text-gray-800">{praca}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg break-words">
                                <p className="text-sm text-gray-500">Campanha</p>
                                <p className="font-medium text-gray-800 overflow-auto max-h-20">{token}</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center hover:border-blue-400 transition-colors">
                            <div className="flex flex-col items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>

                                {file && (
                                    <div>
                                        <p>Arquivo selecionado: {file.name}</p>
                                        <button onClick={handleUpload} disabled={isUploading}>
                                            {isUploading ? 'Enviando...' : 'Enviar'}
                                        </button>
                                    </div>
                                )}

                                <p className="text-gray-600">Arraste e solte o arquivo aqui</p>
                                <p className="text-sm text-gray-400 mt-1">ou</p>
                                <label className="cursor-pointer mt-2">


                                    {!file && (
                                        <span className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded inline-block transition-colors">
                                            Selecione o arquivo
                                        </span>
                                    )}

                                    <input type="file" className="hidden" onChange={handleFileChange} />

                                </label>
                            </div>
                        </div>

                        {uploadStatus === 'success' && <p>✅ Arquivo enviado com sucesso!</p>}
                        {uploadStatus === 'fail' && <p>❌ Falha no envio do arquivo.</p>}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsOpenModalUpload(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleUpload()}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>

            ) : null}

            <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden text-center">

                {!isPercentValid ? 'Estabeleça uma meta de correções!' : null}

                <div
                    className="bg-blue-500 h-full text-white text-sm flex items-center justify-center transition-all duration-300"
                    style={{ width: `${progresso}%` }}
                >
                    {progresso}%
                </div>
            </div>

            {/* Campo para definir total de itens */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Correções Esperadas
                    <b className="text-green-500"> .: {totalItens} {salvo && <b className="text-green-500"> Salvo!</b>}</b></label>
                <input
                    type="number"
                    min="1"
                    value={totalItens}
                    onChange={handleItensChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-center"
                />
            </div>

            {/* Correções */}
            <div className="border rounded-lg p-4 space-y-3">
                <h2 className="text-lg font-semibold text-center">Correções</h2>
                {/* {envios.map((correcao, index) => (
                    <div
                        key={index}
                        className="w-10 h-10 mx-auto flex items-center justify-center rounded-full border text-sm font-medium bg-gray-100"
                    >
                        {index + 1}
                    </div>
                ))} */}
            </div>

            {/* Botão para subir correção */}
            <button
                onClick={() => handleModalUpload(true)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
                Subir Próxima Correção
            </button>
        </div>
    );
}
