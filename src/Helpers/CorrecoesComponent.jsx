import React, { useState, useEffect } from "react";


export default function CorrecoesComponent({ praca, token, annotations }) {
    const [totalItens, setTotalItens] = useState(0);
    const [envios, setEnvios] = useState(["Correção 1", "Correção 2", "Correção 3"]);
    const [correcoes, setCorrecoes] = useState(0);
    const [salvo, setSalvo] = useState(false);

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

        const interval = setInterval(fetchPdf, 1000);

        return () => clearInterval(interval);

    }, [annotations, praca]);

    const progresso = Math.round((correcoes / totalItens) * 100);

    const handleNovaCorrecao = () => {
        const novaCorrecao = `Correção ${envios.length + 1}`;
        setEnvios([...envios, novaCorrecao]);
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





    return (
        <div className="w-100 h-full mx-auto p-4 border rounded-xl shadow bg-white space-y-6">
            {/* Barra de Progresso */}
            <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
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
                {envios.map((correcao, index) => (
                    <div
                        key={index}
                        className="w-10 h-10 mx-auto flex items-center justify-center rounded-full border text-sm font-medium bg-gray-100"
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

            {/* Botão para subir correção */}
            <button
                onClick={handleNovaCorrecao}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
                Subir Correção
            </button>
        </div>
    );
}
