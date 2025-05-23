import React, { useEffect, useState } from "react";
import { AiOutlineCaretRight, AiOutlineDelete, AiOutlineCloudUpload, AiOutlineArrowLeft } from "react-icons/ai";
import Praca from '../Praca/Praca'

const Home = () => {
  const [titulo, setNome] = useState("");
  const [periodo1, setPeriodo1] = useState("");
  const [periodo2, setPeriodo2] = useState("");
  const [entrarNaCampanha, setEntrarNaCampanha] = useState(false);
  const [cadastrarCampanhaTela, setCadastrarCampanhaTela] = useState(true);
  const [uploadArquivos, setUploadArquivos] = useState(false);
  const [campanhas, setCampanhas] = useState([{ titulo: "", campanha_id: "", periodo1: "", periodo2: "", progresso: 0 }]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [tokenCampanha, setTokenCampanha] = useState('');
  const [campanhaAtiva, setCampanhaAtiva] = useState([]);
  const [activePraca, setActivePraca] = useState();
  const [ispdfExiste, setIsPdfExiste] = useState(false);


  const handleFileChange = (pracaId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [pracaId]: file,
    }));
  };


  const removeFile = (pracaId) => {
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      delete updated[pracaId];
      return updated;
    });
  };



  const handleSubmit = () => {
    const formData = new FormData();

    Object.entries(selectedFiles).forEach(([pracaId, file]) => {
      formData.append('files[]', file);               // Envia como files[]
      formData.append('pracaIds[]', pracaId);         // Envia a relação
    });

    formData.append('tokenCampanha', tokenCampanha);
    formData.append("login", JSON.parse(localStorage.getItem("user")).loginUsuario);

    fetch('/db/uploadEncartes.php', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json()) // PHP retorna JSON
      .then(data => {

        if (data.success) {

          alert("arquivo enviado com sucesso!");

          setEntrarNaCampanha(false);
          setCadastrarCampanhaTela(true);
          setUploadArquivos(false);
        } else {

          alert("Algo deu errado!" + " " + data);

        }

      })
      .catch(error => {
        console.error("Erro ao enviar:", error);
      });
  };



  const handleCadastrarCampanha = async () => {

    if (!titulo || !periodo1 || !periodo2 === 0) {
      alert("Algum dado obrigatório está vazio.");
      return null;
    }

    const dado = {
      titulo: titulo,
      periodo1: periodo1,
      periodo2: periodo2
    };

    try {
      const response = await fetch("/db/setCampanha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dado),
      });
      const data = await response.json();
      await getCampanhas();
      setNome("");
      setPeriodo1("");
      setPeriodo2("");


    } catch (err) {
      console.error("Erro ao cadastrar dados do catálogo", err);
    }
  }

  useEffect(() => {
    getCampanhas();
  }, []);

  const getCampanhas = async () => {
    try {
      const response = await fetch("/db/getCampanhas.php", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        setCampanhas(data.response);
      }
    } catch (err) {
      console.error("Erro ao buscar status do arquivo", err);
    }
  };

  const removerCampanha = async (campanha) => {
    if (window.confirm("Deseja realmente remover a campanha?")) {
      try {
        const response = await fetch("/db/removeCampanha.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campanha),
        });
        const data = await response.json();
        await getCampanhas();
      } catch (err) {
        console.error("Erro ao remover campanha", err);
      }
    }
  }

  const entrarCampanha = (campanha) => {
    setTokenCampanha(campanha.campanha_id);
    setEntrarNaCampanha(true);
    setCadastrarCampanhaTela(false);
    setUploadArquivos(false);

  }

  const UploadArquivosCampanha = (campanha) => {
    setCampanhaAtiva(campanha.titulo);
    setTokenCampanha(campanha.campanha_id);
    setUploadArquivos(true);
    setCadastrarCampanhaTela(false);
    setCadastrarCampanhaTela(false);


  }


  const pdfExiste = (estado) => {

    setIsPdfExiste(estado);
  }

  const mudarPraca = (id) => {

    if (pdfExiste) {
      setActivePraca(id);
    } else {
      setEntrarNaCampanha(true);
    }
  }

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



  const TelaDeCadastro = () => {
    setCadastrarCampanhaTela(true);
    setUploadArquivos(false);
    setEntrarNaCampanha(false);
    setSelectedFiles({});
  };


  return (



    <div className="p-4 w-400">

      {entrarNaCampanha && (
        <>

          <div className="p-4">
            <div className="flex flex-col w-full h-165 bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <div className="w-full bg-gray-50 border-b border-gray-200 px-2 py-1">
                <div className="flex items-center overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <button
                    onClick={TelaDeCadastro}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg mx-1 min-w-[80px] transition-colors ${!activePraca
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                  >

                    <div className="flex items-center gap-1">
                      <AiOutlineArrowLeft /> Voltar
                    </div>

                  </button>
                  {pracas.map((praca) => (
                    <button
                      key={praca.id}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg mx-1 min-w-[80px] transition-colors ${activePraca === praca.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      onClick={() => mudarPraca(praca.id)}
                    >
                      {praca.label}
                    </button>
                  ))}

                </div>
              </div>

              {/* Área de conteúdo */}
              <div className="flex p-4 bg-gray-50 overflow-auto">

                <Praca
                  key={activePraca || 'resumo'}
                  praca={activePraca}
                  token={tokenCampanha}
                  pdfExiste={pdfExiste}
                />

                {!activePraca && (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
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
                      Nenhuma filial selecionada
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Selecione uma das filiais acima para visualizar o encarte correspondente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </>
      )}

      {cadastrarCampanhaTela && (
        <>
          <div className="flex flex-col w-full h-[calc(100vh-2rem)] bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <div className="w-full bg-gray-50 border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-bold mb-4">Cadastro de Campanha</h2>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Nome:</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setNome(e.target.value)}
                    className="border px-2 py-1 rounded w-40"
                  />
                </div>

                <span className="font-semibold">|</span>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Período:</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={periodo1}
                      onChange={(e) => setPeriodo1(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="date"
                      value={periodo2}
                      onChange={(e) => setPeriodo2(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                </div>

                <span className="font-semibold">|</span>

                <button className="bg-green-500 text-white px-1 py-1 rounded hover:bg-green-600" onClick={handleCadastrarCampanha}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" />
                  </svg>
                  Cadastrar
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 bg-gray-50 overflow-auto">
              <div className="space-y-4">
                {campanhas.map((campanha, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border p-4 rounded shadow-sm bg-white hover:shadow-md"
                  >
                    <div>
                      <p className="font-medium">{campanha.titulo}</p>
                      <p className="text-sm text-gray-500">{`${campanha.periodo1} - ${campanha.periodo2}`}</p>
                    </div>
                    <div className="flex items-center gap-2">

                      <div className="flex-1/3 space-x-2 mt-2">
                        <div className="px-3 mb-0.5 py-1 rounded-lg bg-green-100 text-green-800 text-sm font-medium">
                          ✅ Certos: {campanha.acertos}
                        </div>
                        <div className="px-3 mb-0.5 py-1 rounded-lg bg-red-100 text-red-800 text-sm font-medium">
                          ❌ Errados: {campanha.erros}
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium">
                          💬 Comentários: {campanha.comentarios}
                        </div>
                      </div>

                      <div
                        className={`w-20 text-center border rounded py-1 font-semibold
                            ${campanha.progresso < 50 ? 'bg-red-100 text-red-700' :
                            campanha.progresso < 100 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-700'}`}
                      >
                        {campanha.progresso}%
                      </div>

                      {/* Nuvem de Upload */}
                      <span
                        className="cursor-pointer text-4xl"
                        title="Upload Arquivos Nesta Campanha"
                        onClick={() => UploadArquivosCampanha(campanha)}
                      >
                        <AiOutlineCloudUpload />
                      </span>

                      <span
                        className="cursor-pointer text-red-600 text-4xl"
                        title="Remover"
                        onClick={() => removerCampanha(campanha)}
                      >
                        <AiOutlineDelete />
                      </span>

                      <span
                        className="cursor-pointer text-green-600 text-4xl"
                        title="Entrar"
                        onClick={() => entrarCampanha(campanha)}
                      >
                        <AiOutlineCaretRight />
                      </span>



                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {uploadArquivos && (
        <>

          <div className="p-6 max-w-4xl mx-auto">
            <i>Token: <small className="text-sm">{tokenCampanha}</small></i>


            <h1 className="text-3xl font-bold mb-8 text-gray-800">Upload *Incial* de Arquivos na Campanha: {campanhaAtiva} </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pracas.map((praca) => (
                <div key={praca.id} className="border border-gray-200 p-5 rounded-xl shadow-md transition hover:shadow-lg bg-white">
                  <label className="block font-semibold text-gray-700 mb-3">{praca.label}</label>

                  {!selectedFiles[praca.id] ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(praca.id, e.target.files[0])}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                    />
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-1">
                      <span className="text-sm text-blue-900 truncate max-w-[140px]">{selectedFiles[praca.id].name}</span>
                      <button
                        onClick={() => removeFile(praca.id)}
                        className="ml-3 text-red-500 hover:text-red-700 transition"
                        title="Remover arquivo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center mt-8 gap-4">
              <button
                onClick={TelaDeCadastro}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
              >
                <AiOutlineArrowLeft /> Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedFiles).length === 0}
                className={`px-5 py-2 rounded-lg text-white transition 
        ${Object.keys(selectedFiles).length === 0
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"}`}
              >
                Enviar Arquivos
              </button>
            </div>
          </div>


        </>
      )}


    </div>
  );
};

export default Home;
