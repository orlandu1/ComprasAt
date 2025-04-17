import React, { useEffect, useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Home = () => {

    const PDF_ID = 'encarte-01';
    const usuarioLogado = JSON.parse(localStorage.getItem('user'))?.loginUsuario;
    const [numPages, setNumPages] = useState(null);
    const documentRef = useRef(null);
    const [pdfName, setPdfName] = useState('');


    const [annotations, setAnnotations] = useState(() => {
        try {
            const saved = localStorage.getItem('pdfAnnotations');

            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erro ao carregar anotações:', error);
            return [];
        }
    });

    useEffect(() => {
        fetch('/db/getPdf.php')
            .then(res => res.json())
            .then(data => setPdfName(data.pdf));
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [commentInput, setCommentInput] = useState({
        visible: false,
        x: 0,
        y: 0,
        value: ''
    });

    // get_annotations.php
    // handle_annotation.php

    useEffect(() => {
        const fetchAnnotations = async () => {
            try {
                const response = await fetch(`/db/get_annotations.php?pdf_id=${PDF_ID}`);
                const data = await response.json();
                if (data.success) setAnnotations(data.annotations);
            } catch (error) {
                console.error('Erro ao buscar anotações:', error);
            }
        };


        if (!isLoading) {
            fetchAnnotations();
        }
    }, [isLoading]);

    const syncAnnotation = async (action, annotation) => {
        try {
            const formData = new FormData();
            formData.append('pdf_id', PDF_ID);
            formData.append('action', action);
            formData.append('data', JSON.stringify(annotation));

            await fetch(`/db/handle_annotation.php`, {
                method: 'POST',
                body: formData,
            });
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
        }
    };


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
        <div className="flex w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">
            <div
                className="relative overflow-auto h-full cursor-pointer mt-1 rounded-lg bg-white"
                onMouseDown={handleMouseClick}
                onContextMenu={(e) => e.preventDefault()}
            >
                {isLoading && (
                    <div className="absolute w-full inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="text-yellow-400 text-2xl font-bold animate-pulse">
                            Aguardando o PDF...
                        </div>
                    </div>
                )}

                <Document
                    ref={documentRef}
                    file={`https://comprasat.rf.gd/uploads/encartes/${pdfName}.pdf`}
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
                </Document>

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

export default Home;