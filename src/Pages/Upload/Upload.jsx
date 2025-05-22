import React, { useState, useEffect } from "react";
import { ArrowUpIcon } from "lucide-react";
import { AiOutlineCloudUpload } from "react-icons/ai";

const pracas = [
    { id: "df", label: "DF" },
    { id: "gocapital", label: "Go capital" },
    { id: "valparaiso", label: "Valparaiso" },
    { id: "formosa", label: "Formosa" },
    { id: "anapolis", label: "Anápolis" },
    { id: "itumbiara", label: "Itumbiara" },
    { id: "rioverde", label: "Rio Verde" },
    { id: "palmas", label: "Palmas" },
    { id: "araguaina", label: "Araguaina" },
    { id: "gurupi", label: "Gurupi" },
];

export default function UploadComponent() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("Clique na seta para enviar");
    const [fileStatus, setFileStatus] = useState({});

    useEffect(() => {
        pracas.forEach((praca) => {
            fetchStatus(praca.id);
        });
    }, []);

    const fetchStatus = async (id) => {
        try {
            const response = await fetch("/db/getPdfList.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ praca: id }),
            });
            const data = await response.json();
            setFileStatus((prev) => ({
                ...prev,
                [id]: data,
            }));
        } catch (err) {
            console.error("Erro ao buscar status do arquivo", err);
        }
    };

    const handleFileChange = (event, id) => {
        const file = event.target.files[0];
        setSelectedFile({ file, id });
    };

    const handleUpload = async (id) => {
        if (!selectedFile || selectedFile.id !== id) {
            setMessage("Selecione um arquivo antes de enviar.");
            return;
        }

        setMessage("Enviando arquivo...");
        await handleServerUpload(selectedFile.file, id);
        setMessage(`Arquivo enviado: ${selectedFile.file.name}`);


        fetchStatus(id);

        setTimeout(() => {
            setMessage("Clique na seta para enviar");
        }, 3000);

        setSelectedFile(null);
    };

    const handleServerUpload = async (file, id) => {
        const formData = new FormData();
        formData.append("arquivo", file);
        formData.append("tipo", "encarte");
        formData.append("praca", id);
        formData.append("login", JSON.parse(localStorage.getItem("user")).loginUsuario);

        try {
            const response = await fetch("/db/upload.php", {
                method: "POST",
                body: formData,
            });
            await response.json();
        } catch (err) {
            setMessage("Erro ao enviar arquivo.");
        }
    };

    return (
        <div className="p-4 w-400">
            <div className="flex bg-gray-50 flex-col w-full h-[calc(100vh-2rem)] shadow-lg border border-gray-200 rounded-xl overflow-hidden">
                <div className="w-full border-gray-200 px-4 py-3 ">
                    <h1 className="text-xl font-semibold mb-4 text-center">Upload de Arquivos por Praça</h1>
                    <div className="grid grid-cols-1 gap-3 max-w-3xl">
                        {pracas.map((praca) => (
                            <div
                                key={praca.id}
                                className="flex items-center justify-between px-3 bg-white shadow rounded border"
                            >
                                <span className="text-sm font-medium w-28">{praca.label}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        id={`file-input-${praca.id}`}
                                        onChange={(e) => handleFileChange(e, praca.id)}
                                    />
                                    <label htmlFor={`file-input-${praca.id}`}>
                                        <AiOutlineCloudUpload className="h-5 w-5 text-green-600 hover:text-green-700 cursor-pointer" />
                                    </label>
                                    {selectedFile && selectedFile.id === praca.id && (
                                        <button
                                            onClick={() => handleUpload(praca.id)}
                                            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Enviar
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 w-60 bg-gray-50 p-1.5 rounded border border-gray-200">
                                    {fileStatus[praca.id] && (
                                        <div className="space-y-0.5">
                                            {/* Linha 1: Status + Nome do arquivo */}
                                            <div className="flex items-center gap-1">
                                                {fileStatus[praca.id].arquivo?.exists ? (
                                                    <>
                                                        <span className="text-green-500 text-[0.65rem]">✓</span>
                                                        <span className="truncate font-medium" title={fileStatus[praca.id].arquivo.filename}>
                                                            {fileStatus[praca.id].arquivo.filename}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-red-500 text-[0.65rem]">✗ Arquivo não encontrado</span>
                                                )}
                                            </div>

                                            {/* Linha 2: Data/hora + usuário */}
                                            {fileStatus[praca.id].arquivo?.exists && (
                                                <div className="flex justify-between text-[0.65rem]">
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <span>🕒</span>
                                                        <span>
                                                            {new Date(fileStatus[praca.id].arquivo.lastModified).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="truncate ml-2" title={fileStatus[praca.id].arquivo.user}>
                                                        <span className="text-gray-500">👤</span> {fileStatus[praca.id].arquivo.user}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Linha 3: Hash */}
                                            {fileStatus[praca.id].hash && (
                                                <div className="flex items-center gap-1 text-[0.6rem] font-mono">
                                                    <span className="text-gray-400">#</span>
                                                    <span className="truncate" title={fileStatus[praca.id].hash}>
                                                        {fileStatus[praca.id].hash.substring(0, 6)}...{fileStatus[praca.id].hash.slice(-4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-4">{message}</p>
                </div>
            </div>
        </div>
    );
}
