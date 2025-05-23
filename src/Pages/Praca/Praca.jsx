import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import CorrecoesComponent from '../../Helpers/CorrecoesComponent';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const Praca = ({ praca, token, pdfExiste }) => {

    if (!praca) return null;

    const usuarioLogado = JSON.parse(localStorage.getItem('user'))?.loginUsuario;
    const [numPages, setNumPages] = useState(null);
    const documentRef = useRef(null);
    const [pdfHash, setpdfHash] = useState('');
    const [annotations, setAnnotations] = useState([]);
    const [pdfAtualizado, setPdfAtualizado] = useState(false);
    const [pdfexiste, setPdfExiste] = useState(true);

    const handlePdfChanged = () => {
        setPdfAtualizado(true);
    }

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

                setpdfHash(data.hash);

                if (data.hash) {
                    pdfExiste(true);
                    setPdfExiste(true);
                } else {
                    pdfExiste(false);
                    setPdfExiste(false);
                }

                await fetchAnnotations(data.hash);

            } catch (error) {
                console.error('Erro:', error);

            }
        };

        fetchPdf();
        setPdfAtualizado(false);
        setIsLoading(false);

    }, [praca, pdfAtualizado]);

    const [isLoading, setIsLoading] = useState(true);
    const [commentInput, setCommentInput] = useState({
        visible: false,
        x: 0,
        y: 0,
        value: ''
    });

    // get_annotations.php
    // handle_annotation.php



    const fetchAnnotations = async (pdfHash) => {
        try {
            const response = await fetch(`/db/get_annotations.php?pdf_id=${pdfHash}`);
            const data = await response.json();


            if (data.success)
                setAnnotations(data.annotations);


        } catch (error) {
            console.error('Erro ao buscar anotações:', error);
        }
    };







    const syncAnnotation = async (action, annotation) => {

        if (pdfHash == null || pdfHash == '') {
            alert('Não há PDF a ser marcado! faça o upload e volte novamente!');
            // await fetchAnnotations();
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pdf_id', pdfHash);
            formData.append('action', action);
            formData.append('TokenCamp', token);
            formData.append('data', JSON.stringify(annotation));

            await fetch(`/db/handle_annotation.php`, {
                method: 'POST',
                body: formData,
            });

        } catch (error) {
            console.error('Erro ao sincronizar:', error);
        }
    };



    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);

    };

    const handleMouseClick = (event) => {
        event.preventDefault();

        const pdfContainer = event.currentTarget.getBoundingClientRect();
        const scrollTop = event.currentTarget.scrollTop;
        const scrollLeft = event.currentTarget.scrollLeft;

        const relativeX = event.clientX - pdfContainer.left + scrollLeft;
        const relativeY = event.clientY - pdfContainer.top + scrollTop;


        const existingAnnotation = annotations.find(
            (annotation) =>
            (annotation.type === 'CERTO'
                ? Math.abs(annotation.position.x - relativeX) < 50 && Math.abs(annotation.position.y - relativeY) < 50
                : Math.abs(annotation.position.x - relativeX) < 20 && Math.abs(annotation.position.y - relativeY) < 20
            )
        );

        if (event.button === 1) {
            if (existingAnnotation) {
                setAnnotations(annotations.filter((annotation) => annotation.id !== existingAnnotation.id));
                syncAnnotation('delete', existingAnnotation);
            } else {

                setCommentInput({
                    visible: true,
                    x: relativeX - 100,
                    y: relativeY - 40,
                    value: ''
                });
            }
            return;
        }

        if (existingAnnotation) {
            if (
                (event.button === 0 && existingAnnotation.type === 'CERTO') ||
                (event.button === 2 && existingAnnotation.type === 'ERRADO') ||
                (event.button === 1 && existingAnnotation.type === 'COMENTAR')
            ) {
                setAnnotations(annotations.filter((annotation) => annotation.id !== existingAnnotation.id));
                syncAnnotation('delete', existingAnnotation);

            }
        } else {
            let newAnnotation;
            if (event.button === 0) {
                newAnnotation = {
                    id: Date.now(),
                    type: 'CERTO',
                    position: { x: relativeX, y: relativeY },
                    user_name: usuarioLogado
                };
            } else if (event.button === 2) {
                newAnnotation = {
                    id: Date.now(),
                    type: 'ERRADO',
                    position: { x: relativeX, y: relativeY },
                    user_name: usuarioLogado
                };
            }

            if (newAnnotation) {
                setAnnotations([...annotations, newAnnotation]);
                syncAnnotation('add', newAnnotation); // Sincroniza com o banco ao adicionar
            }


        }
    };

    const handleCommentSubmit = (event) => {
        if (event.key === 'Enter') {
            const newAnnotation = {
                id: Date.now(),
                type: 'COMENTAR',
                position: {
                    x: commentInput.x + 100,
                    y: commentInput.y + 40
                },
                comment: commentInput.value,
                user_name: usuarioLogado
            };
            setAnnotations([...annotations, newAnnotation]);
            syncAnnotation('add', newAnnotation);
            setCommentInput({ ...commentInput, visible: false, value: '' });
        }
    };

    return (
        <div className="flex gap-2 space-x-5 w-318 h-149 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">

            <div>
                <CorrecoesComponent
                    praca={praca}
                    token={token}
                    annotations={annotations}
                    pdfHash={pdfHash}
                    onPdfChanged={handlePdfChanged}
                    setpdfHash={setpdfHash}
                    fetchAnnotations={fetchAnnotations} />
            </div>

            <div
                className="relative overflow-auto h-full cursor-pointer rounded-lg bg-white"

                onMouseDown={e => {
                    // Detecta se o click foi no scroll vertical ou horizontal
                    const target = e.currentTarget;
                    const { clientX, clientY } = e;
                    const { left, top, width, height } = target.getBoundingClientRect();

                    // Largura/altura visível (sem scroll)
                    const scrollBarSize = 18; // valor comum de scrollbar, ajuste se necessário

                    const clickedOnVerticalScroll = target.scrollHeight > target.clientHeight &&
                        clientX > left + target.clientWidth - scrollBarSize;

                    const clickedOnHorizontalScroll = target.scrollWidth > target.clientWidth &&
                        clientY > top + target.clientHeight - scrollBarSize;

                    if (clickedOnVerticalScroll || clickedOnHorizontalScroll) {
                        return; // Não faz nada se clicar no scroll
                    }

                    handleMouseClick(e);
                }}

                onContextMenu={(e) => e.preventDefault()}
            >


                {isLoading ? (
                    <div className="inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mb-4"></div>
                            <h3 className="text-yellow-400 text-3xl font-bold mb-2">Carregando PDF</h3>
                            <p className="text-gray-300 text-xl">Por favor, aguarde enquanto preparamos seu documento...</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-6">
                                <div className="bg-yellow-400 h-2.5 rounded-full animate-pulse w-3/4"></div>
                            </div>
                        </div>
                    </div>
                ) : (

                    <div>

                        {pdfexiste ?

                            (<Document
                                ref={documentRef}
                                file={`https://comprasat.rf.gd/uploads/encartes/${pdfHash}.pdf`}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="hidden" />}
                                onLoadError={(error) => console.error("Erro ao carregar PDF:", error)}
                            >
                                {Array.from(new Array(numPages), (_, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        width={800}
                                    />
                                ))}
                            </Document>) : (

                                <div className="w-[794px] h-[1123px] border border-dashed border-gray-400 bg-gray-50 flex items-start justify-center text-center p-4 rounded shadow">
                                    <div>
                                        <h2 className="text-xl font-semibold text-red-600 mb-4">PDF não encontrado</h2>
                                        <p className="text-gray-700">
                                            Vá até a <strong>tela de cadastro de campanhas</strong> e faça o upload do PDF desta praça na respectiva campanha.
                                        </p>
                                    </div>
                                </div>


                            )
                        }
                    </div>

                )}

                {annotations.map((annotation) => (
                    <div
                        key={annotation.id}
                        className={`absolute cursor-pointer ${annotation.type === 'ERRADO'
                            ? 'text-red-500 text-4xl'
                            : annotation.type === 'CERTO'
                                ? 'text-green-500 text-9xl'
                                : 'text-blue-500 text-4xl'
                            }`}
                        style={{
                            top: annotation.position.y,
                            left: annotation.position.x,
                            transform: 'translate(-50%, -50%)', // Centraliza o ícone
                            zIndex: 20
                        }}
                    >
                        {annotation.type === 'ERRADO' ? '❌' : annotation.type === 'CERTO' ? '✔️' : '💬'}

                        {annotation.comment && (
                            <div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold px-3 py-2 text-sm bg-orange-600 text-white rounded-lg shadow-lg opacity-20 hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    pointerEvents: 'auto',
                                    zIndex: 30,
                                    minWidth: '120px'
                                }}
                            >
                                {annotation.comment}
                            </div>
                        )}
                    </div>
                ))}

                {commentInput.visible && (
                    <div
                        className="absolute z-50 bg-white p-2 rounded shadow-lg border border-gray-300"
                        style={{
                            top: commentInput.y,
                            left: commentInput.x,
                        }}
                    >
                        <input
                            type="text"
                            className="w-48 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={commentInput.value}
                            onChange={(e) => setCommentInput({ ...commentInput, value: e.target.value })}
                            onKeyDown={handleCommentSubmit}
                            onBlur={() => setCommentInput({ ...commentInput, visible: false })}
                            autoFocus
                            placeholder="Comente e aperte Enter"
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default Praca;