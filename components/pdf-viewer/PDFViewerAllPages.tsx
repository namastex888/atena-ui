'use client';

import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useDocumentStore } from '@/stores/document.store';
import { PDFControls } from './PDFControls';
import { SelectionMenu } from './SelectionMenu';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  onOpenChat?: () => void;
}

export function PDFViewer({ onOpenChat }: PDFViewerProps = {}) {
  const { currentDocument, currentPage, setCurrentPage, setTotalPages, zoom, setExtractedText } = useDocumentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const updatePageWidth = () => {
      const containerWidth = containerRef.current?.clientWidth || 800;
      setPageWidth(containerWidth - 48); // Subtract padding
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  // Scroll to page when currentPage changes
  useEffect(() => {
    if (pageRefs.current[currentPage] && containerRef.current) {
      const pageElement = pageRefs.current[currentPage];
      const container = containerRef.current;
      
      // Calculate the position to scroll to
      const pageRect = pageElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop + (pageRect.top - containerRect.top);
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  // Detect which page is currently visible during scroll
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!containerRef.current || isScrolling) return;
      
      // Clear the previous timeout
      clearTimeout(scrollTimeout);
      
      // Set a new timeout to detect when scrolling has stopped
      scrollTimeout = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        // Find the page that is most visible
        for (let i = 1; i <= numPages; i++) {
          const pageEl = pageRefs.current[i];
          if (pageEl) {
            const rect = pageEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;
            
            // If this page is in the viewport
            if (relativeTop >= -rect.height / 2 && relativeTop < containerHeight / 2) {
              setCurrentPage(i);
              break;
            }
          }
        }
      }, 150); // Wait 150ms after scroll stops
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [numPages, setCurrentPage]);

  // Handle text selection - only within PDF container
  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;
    
    const handleTextSelection = (e: MouseEvent) => {
      // Check if the click is on the selection menu itself
      const target = e.target as HTMLElement;
      if (target && typeof target.closest === 'function') {
        const selectionMenu = target.closest('[data-selection-menu]');
        if (selectionMenu) {
          return; // Don't clear selection when clicking on menu
        }
      }
      
      // Check if selection is within PDF container
      const pdfContainer = document.getElementById('pdf-container');
      
      if (!pdfContainer || !pdfContainer.contains(target)) {
        // Clear selection after a delay to allow menu clicks to process
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          setSelection(null);
        }, 100);
        return;
      }
      
      // Clear any pending timeout
      clearTimeout(selectionTimeout);
      
      // Get selected text after a small delay to ensure selection is complete
      setTimeout(() => {
        const selectedText = window.getSelection()?.toString().trim();
        
        if (selectedText && selectedText.length > 0) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Only show menu if selection is from PDF content
            const container = range.commonAncestorContainer;
            const parentElement = container.nodeType === Node.TEXT_NODE 
              ? container.parentElement 
              : container as HTMLElement;
              
            if (parentElement && pdfContainer.contains(parentElement)) {
              setSelection({
                text: selectedText,
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10,
              });
            }
          }
        }
      }, 10);
    };

    const handleClearSelection = () => {
      // Don't clear if we have an active selection menu
      if (selection) return;
      
      const selectedText = window.getSelection()?.toString().trim();
      if (!selectedText || selectedText.length === 0) {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          setSelection(null);
        }, 100);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('selectionchange', handleClearSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('selectionchange', handleClearSelection);
      clearTimeout(selectionTimeout);
    };
  }, [selection]);

  const onDocumentLoadSuccess = async (pdf: any) => {
    const num = pdf.numPages;
    setNumPages(num);
    setTotalPages(num);
    setLoading(false);
    setError(null);
    
    // Extract text from all pages
    try {
      let fullText = '';
      for (let i = 1; i <= num; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Página ${i} ---\n${pageText}\n`;
      }
      setExtractedText(fullText);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      // Still set some context even if extraction fails
      setExtractedText(`Documento: ${currentDocument?.name || 'PDF'} com ${num} páginas`);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Erro ao carregar o documento');
    setLoading(false);
  };

  if (!currentDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
        <div className="p-8 max-w-4xl">
          <div className="mb-8 text-center">
            <svg 
              className="w-20 h-20 mx-auto text-primary-400 mb-4"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Olá, estudante! Prepare-se para começar sua jornada de estudos.
            </h2>
          </div>
          
          <div className="prose prose-gray max-w-none text-justify space-y-4 text-gray-600">
            <p className="leading-relaxed">
              A disciplina <strong>Algoritmo e Pensamento Computacional</strong> oferece uma formação completa e sistemática para profissionais que desejam dominar a arte e a 
              ciência de resolver problemas computacionais de forma estruturada e eficiente. Esta disciplina foi desenvolvida para capacitar estudantes desde os 
              fundamentos do pensamento lógico até técnicas avançadas de programação, proporcionando as competências essenciais para criar soluções algorítmicas 
              robustas que atendam às demandas tecnológicas contemporâneas.
            </p>
            
            <p className="leading-relaxed">
              O curso está organizado em uma progressão lógica que combina fundamentos teóricos sólidos com implementações práticas intensivas. Iniciamos com os 
              fundamentos da programação e pensamento computacional, explorando raciocínio lógico-matemático, características das linguagens de programação e 
              manipulação de dados em linguagem C. A segunda etapa foca nas estruturas de decisão, controle e repetição, desenvolvendo habilidades para criar 
              programas que tomam decisões inteligentes e executam tarefas repetitivas automaticamente.
            </p>
            
            <p className="leading-relaxed">
              A terceira unidade aprofunda as estruturas de dados e arquivos, abordando arrays, manipulação de arquivos, funções, modularização e o poderoso 
              conceito de ponteiros. A jornada culmina com algoritmos de ordenação, explorando desde métodos simples como Bubble Sort até técnicas recursivas 
              avançadas como Quick Sort, analisando complexidade e aplicações práticas.
            </p>
            
            <p className="leading-relaxed">
              A metodologia adotada enfatiza a aplicação imediata de conceitos através de exercícios práticos, projetos que simulam cenários reais e estudos de caso 
              que demonstram a relevância dos algoritmos no desenvolvimento de sistemas. Cada tópico é apresentado com exemplos concretos, desde a 
              implementação de lógicas simples até o desenvolvimento de sistemas completos de gestão.
            </p>
            
            <p className="leading-relaxed">
              A relevância desta disciplina é fundamental no contexto atual, onde algoritmos são a base de todas as inovações tecnológicas. Desde inteligência artificial 
              até sistemas embarcados, desde aplicações móveis até computação em nuvem, o domínio de algoritmos e pensamento computacional determina a 
              capacidade de criar soluções eficientes e escaláveis que impactam diretamente a experiência do usuário e o sucesso de projetos tecnológicos.
            </p>
            
            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-900 mb-3">Objetivos Gerais:</h3>
              <p className="leading-relaxed text-gray-700">
                Desenvolver competências abrangentes em algoritmos e pensamento computacional, capacitando os estudantes a aplicar raciocínio lógico-matemático 
                para resolver problemas computacionais, dominar os fundamentos da linguagem C incluindo estruturas de controle e manipulação de dados, implementar 
                estruturas de dados eficientes e técnicas de modularização de código, analisar e implementar algoritmos de ordenação considerando complexidade e 
                aplicabilidade, e estabelecer fundamentos sólidos para especialização em áreas como desenvolvimento de sistemas, inteligência artificial, computação 
                científica e engenharia de software, preparando profissionais completos para criar soluções algorítmicas eficientes e escaláveis no mercado atual de 
                tecnologia da informação.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 border-t pt-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Selecione um documento na barra lateral para começar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden" 
        id="pdf-container"
        style={{ height: 'calc(100% - 60px)' }}
      >
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <Document
            file={currentDocument.path}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(el) => { pageRefs.current[index + 1] = el; }}
                className="mb-4 flex justify-center"
              >
                <Page
                  pageNumber={index + 1}
                  width={pageWidth * zoom}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                  loading={
                    <div className="flex items-center justify-center bg-white shadow-lg" 
                         style={{ width: pageWidth * zoom, height: (pageWidth * zoom) * 1.414 }}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
      
      <PDFControls />
      
      {/* Selection Menu */}
      {selection && (
        <SelectionMenu
          selectedText={selection.text}
          x={selection.x}
          y={selection.y}
          onClose={() => setSelection(null)}
          onOpenChat={onOpenChat}
        />
      )}
    </div>
  );
}