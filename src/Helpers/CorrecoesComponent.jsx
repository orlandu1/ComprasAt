import React, { useState, useEffect, useRef } from "react";


export default function CorrecoesComponent({ praca, token, annotations, onPdfChanged, setpdfHash, fetchAnnotations, totalItens, setTotalItens }) {
    const [correcoes, setCorrecoes] = useState(0);
    const [salvo, setSalvo] = useState(false);
    const [isPercentValid, setisPercentValid] = useState(true);
    const [isOpenModalUpload, setIsOpenModalUpload] = useState(false);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [pdfExiste, setPdfExiste] = useState(true);
    const [fileCorrections, setFileCorrections] = useState([]);
    const [menuVisivel, setMenuVisivel] = useState(false);
    const [posicao, setPosicao] = useState({ x: 0, y: 0 });
    const [menuFile, setMenuFile] = useState();
    const [selectedHash, setSelectedHash] = useState(null);
    const [progresso, setProgresso] = useState(0);



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

                if (data.hash) {
                    setPdfExiste(true);
                } else {
                    setPdfExiste(false);
                }

                setTotalItens(data.itens);
                setCorrecoes(data.correcoes);


            } catch (error) {
                console.error('Erro:', error);
            }
        };
        fetchPdf();
    }, [annotations, praca]);

    useEffect(() => {
        getFileCorrections();
    }, [file, annotations, praca, salvo])

    useEffect(() => {
        // Só calcula se os dois estados já foram carregados com valores válidos
        if (
            typeof correcoes === 'number' &&
            typeof totalItens === 'number' &&
            totalItens > 0
        ) {
            // Calcula o progresso, garantindo que não passe de 100%
            const progressoCalculado = Math.min(
                Math.round((correcoes / totalItens) * 100),
                100 // Limite máximo de 100%
            );

            if (Number.isFinite(progressoCalculado)) {
                setisPercentValid(true);
                setProgresso(progressoCalculado);
            } else {
                setisPercentValid(false);
                setProgresso(0);
            }
        }
    }, [correcoes, totalItens]);



    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setUploadStatus('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(false);

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
                setIsUploading(true);
                onPdfChanged();
                setIsOpenModalUpload(false);
                getFileCorrections();
                setFile('');

                useEffect(() => {
                    if (fileCorrections.length > 0 && !selectedHash) {
                        setSelectedHash(fileCorrections[fileCorrections.length - 1].hash);
                    }
                }, [fileCorrections]);


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
        getFileCorrections();
    }

    const getFileCorrections = async () => {
        try {
            const response = await fetch("/db/getPdfList.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ praca: praca, token: token }),
            });

            const data = await response.json();
            const arquivos = data.map(item => item.arquivo);
            setFileCorrections(arquivos);

        } catch (err) {
            console.error("Erro ao buscar status do arquivo", err);
        }
    };


    const contextDownload = (event, file) => {
        event.preventDefault();
        setMenuFile(file);
        setPosicao({ x: event.pageX, y: event.pageY });
        setMenuVisivel(true);
    };

    const handleCliqueFora = () => {
        setMenuVisivel(false);
    };

    const handleBaixar = () => {
        const href = '/uploads/encartes/' + menuFile;
        const a = document.createElement('a');
        a.href = href;
        a.download = menuFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setMenuVisivel(false);
    };

    useEffect(() => {
        document.addEventListener('click', handleCliqueFora);
        return () => document.removeEventListener('click', handleCliqueFora);
    }, []);


    const renderPdf = async (pdf, correcoes, itens) => {
        setCorrecoes(correcoes);
        await setpdfHash(pdf);
        await fetchAnnotations(pdf);
        setSelectedHash(pdf);
        setTotalItens(itens)
    }

    useEffect(() => {
        if (fileCorrections.length > 0 && !selectedHash) {
            setSelectedHash(fileCorrections[fileCorrections.length - 1].hash);
        }
    }, [fileCorrections]);


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

            {pdfExiste ? (
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden text-center">

                    {!isPercentValid ? 'Estabeleça uma meta de correções!' : null}

                    <div
                        className="bg-blue-500 h-full text-white text-sm flex items-center justify-center transition-all duration-300"
                        style={{ width: `${progresso}%` }}
                    >
                        {progresso}%
                    </div>
                </div>
            ) : ('')}

            {/* Campo para definir total de itens */}
            {pdfExiste ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correções Esperadas

                        <b className={totalItens === 0 ? "text-red-500 text-sm" : "text-green-500 text-sm"}>
                            {totalItens === 0 ? " Preencha a quantidade de itens!" : `.: ${correcoes}/${totalItens}`}
                            {salvo && totalItens !== 0 && <b className="text-green-500"> Salvo!</b>}
                        </b>

                    </label>

                    <input
                        type="text"
                        min="1"
                        value={totalItens}
                        onChange={handleItensChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-center"
                    />

                </div>) : (<div className="text-center">PDF não encontrado!</div>)}

            {/* Correções */}
            {pdfExiste ? (
                <div className="border rounded-lg p-4 space-y-3">
                    <h2 className="text-lg font-semibold text-center">Correções Enviadas</h2>
                    <div className="flex gap-2">
                        {fileCorrections.map((item, index) => (
                            <a
                                key={item.id}
                                // href={'/uploads/encartes/' + item.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-10 h-15 border rounded-full shadow transition-shadow duration-300 flex flex-col justify-center items-center text-center cursor-pointer
                                ${selectedHash === item.hash
                                        ? 'bg-green-900 border-gray-500 text-white shadow-inner'  // Ativo: escuro
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-yellow-900 transition-all' // Inativo: claro
                                    }`}

                                onContextMenu={(e) => contextDownload(e, item.filename)}
                                onClick={() => renderPdf(item.hash, item.correcoes, item.itens)}
                                style={{ userSelect: 'none' }}
                                title={'Clique direito: inicia o download do arquivo PDF; clique esquerdo: exibe o PDF no visualizador'}
                            >
                                <div className="text-3xl">📝</div>
                                <div className="mt-1 text-xs text-gray-300 font-medium">
                                    {index + 1}°
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            ) : ('')}

            {menuVisivel && (
                <ul
                    style={{
                        position: 'absolute',
                        top: posicao.y,
                        left: posicao.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        padding: '8px',
                        listStyle: 'none',
                        zIndex: 1000,
                    }}
                >
                    <li
                        style={{ padding: '4px 8px', cursor: 'pointer' }}
                        onClick={handleBaixar}
                    >
                        Baixar
                    </li>
                </ul>
            )}

            {/* Botão para subir correção */}


            <button
                onClick={() => handleModalUpload(true)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
                Subir um Arquivo
            </button>

        </div>
    );
}
