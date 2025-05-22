import React, { useState } from 'react';
import PdfRender from './pracas/PdfRender';

const Home = () => {
    const [activePraca, setActivePraca] = useState(null);

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

    const handleResumo = () => {
        setActivePraca(null);
    };

    return (
        <div className="p-4">
            <div className="flex flex-col w-full h-[calc(100vh-2rem)] bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
                {/* Barra de navegação das praças */}
                <div className="w-full bg-gray-50 border-b border-gray-200 px-2 py-1">
                    <div className="flex items-center overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {pracas.map((praca) => (
                            <button
                                key={praca.id}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg mx-1 min-w-[80px] transition-colors ${
                                    activePraca === praca.id
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                                onClick={() => setActivePraca(praca.id)}
                            >
                                {praca.label}
                            </button>
                        ))}
                        <button 
                            onClick={handleResumo}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg mx-1 min-w-[80px] transition-colors ${
                                !activePraca 
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                        >
                            Resumo
                        </button>
                    </div>
                </div>

                {/* Área de conteúdo */}
                <div className="flex-1 p-4 bg-gray-50 overflow-auto">
                    <PdfRender key={activePraca || 'resumo'} praca={activePraca} />
                    {!activePraca && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <svg 
                                className="w-16 h-16 text-gray-400 mb-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16" 
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Nenhuma praça selecionada
                            </h3>
                            <p className="text-gray-500 max-w-md">
                                Selecione uma das praças acima para visualizar o relatório correspondente
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;