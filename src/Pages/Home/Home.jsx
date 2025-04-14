import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const Home = () => {
    const [numPages, setNumPages] = useState(null);
    const [annotations, setAnnotations] = useState(() => {
        try {
            const saved = localStorage.getItem('pdfAnnotations');
            // INICIA O ARRAY COM OS DADOS DO BANCO
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erro ao carregar anotações:', error);
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [commentInput, setCommentInput] = useState({
        visible: false,
        x: 0,
        y: 0,
        value: ''
    });

    useEffect(() => {
        const loadAnnotations = () => {
            try {
                const savedAnnotations = localStorage.getItem('pdfAnnotations');
                // BUSCA OS DADOS APÓS UM REFRESH / CONSISTENCIA
                if (savedAnnotations) {
                    const parsed = JSON.parse(savedAnnotations);
                    setAnnotations(parsed);
                }
            } catch (error) {
                console.error('Erro ao carregar anotações:', error);
            }
        };

        if (!isLoading) {
            loadAnnotations();
        }
    }, [isLoading]);

    useEffect(() => {
        try {
            localStorage.setItem('pdfAnnotations', JSON.stringify(annotations));
            // GRAVAÇÃO DE ITENS NO ARRAY EM TEMPO REAL
        } catch (error) {
            console.error('Erro ao salvar anotações:', error);
        }
    }, [annotations]);

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
            }
        } else {
            let newAnnotation;
            if (event.button === 0) {
                newAnnotation = {
                    id: Date.now(),
                    type: 'CERTO',
                    position: { x: relativeX, y: relativeY },
                };
            } else if (event.button === 2) {
                newAnnotation = {
                    id: Date.now(),
                    type: 'ERRADO',
                    position: { x: relativeX, y: relativeY },
                };
            }

            if (newAnnotation) {
                setAnnotations([...annotations, newAnnotation]);
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
            };
            setAnnotations([...annotations, newAnnotation]);
            setCommentInput({ ...commentInput, visible: false, value: '' });
        }
    };

    return (
        <div className="flex w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">
            <div
                className="relative overflow-auto h-full cursor-pointer mt-1 rounded-lg bg-white"
                onMouseDown={handleMouseClick}
                onContextMenu={(e) => e.preventDefault()}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="text-yellow-400 text-2xl font-bold animate-pulse">
                            Carregando PDF...
                        </div>
                    </div>
                )}

                <Document
                    file="encarte.pdf"
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="hidden" />}
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            width={800}
                        />
                    ))}
                </Document>

                {annotations.map((annotation) => (
                    <div
                        key={annotation.id}
                        className={`absolute cursor-pointer ${annotation.type === 'ERRADO'
                            ? 'text-red-500'
                            : annotation.type === 'CERTO'
                                ? 'text-green-500 text-9xl'
                                : 'text-blue-500'
                            }`}
                        style={{
                            top: annotation.type === 'CERTO' ? annotation.position.y - 70 : annotation.position.y - 10,
                            left: annotation.type === 'CERTO' ? annotation.position.x - 70 : annotation.position.x - 10,
                        }}

                    >
                        {annotation.type === 'ERRADO' ? '❌' : annotation.type === 'CERTO' ? '✔️' : '💬'}

                        {annotation.comment && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg opacity-20 hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    pointerEvents: 'auto',
                                    zIndex: 10,
                                    position: 'absolute',
                                    top: -10,
                                    left: 10
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

export default Home;
