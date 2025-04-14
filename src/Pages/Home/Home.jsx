import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const Home = () => {
    const [numPages, setNumPages] = useState(null);
    const [annotations, setAnnotations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                Math.abs(annotation.position.x - relativeX) < 20 &&
                Math.abs(annotation.position.y - relativeY) < 20
        );

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
            } else if (event.button === 1) {
                newAnnotation = {
                    id: Date.now(),
                    type: 'COMENTAR',
                    position: { x: relativeX, y: relativeY },
                };
            }

            if (newAnnotation) {
                setAnnotations([...annotations, newAnnotation]);
            }
        }
    };

    return (
        <div className="flex w-318 h-148 mt-1 ml-3 bg-gray-600 shadow-xl/30 rounded-sm justify-center">
            <div
                className="relative overflow-auto h-full cursor-pointer mt-1 rounded-lg"
                onMouseDown={handleMouseClick}
                onContextMenu={(e) => e.preventDefault()}
            >
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-orange text-lg">Carregando PDF...</div>
                    </div>
                )}

                <Document
                    file="encarte.pdf"
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="text-orange text-lg">Carregando PDF...</div>}
                >
                    {!isLoading &&
                        Array.from(new Array(numPages), (_, index) => (
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                        ))
                    }
                </Document>

                {annotations.map((annotation) => (
                    <div
                        key={annotation.id}
                        className={`absolute text-xl cursor-pointer ${annotation.type === 'ERRADO'
                            ? 'text-red-500'
                            : annotation.type === 'CERTO'
                                ? 'text-green-500'
                                : 'text-blue-500'
                            }`}

                        style={{
                            top: annotation.position.y - 10,
                            left: annotation.position.x - 10,
                        }}
                    >
                        {annotation.type === 'ERRADO' ? '❌' : annotation.type === 'CERTO' ? '✅' : '💬'}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
