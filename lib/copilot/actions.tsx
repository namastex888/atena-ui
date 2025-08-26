'use client';

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { useCopilotChatSuggestions } from '@copilotkit/react-ui';
import { useDocumentStore } from '@/stores/document.store';
import { AtenaPrompts } from '@/lib/prompts/atena-prompts';
import { useEffect, useState } from 'react';

export function useCopilotActions() {
  const { setCurrentPage, totalPages, currentPage, currentDocument, extractedText } = useDocumentStore();
  const [suggestionKey, setSuggestionKey] = useState(0);
  
  // Force suggestion regeneration when document changes or text is extracted
  useEffect(() => {
    if (currentDocument && extractedText) {
      setSuggestionKey(prev => prev + 1);
    }
  }, [currentDocument?.id, extractedText?.length]);
  
  // Provide current page content as readable context for the AI
  const pageContent = extractedText && currentDocument 
    ? extractedText.substring((currentPage - 1) * 3000, currentPage * 3000)
    : '';
    
  useCopilotReadable({
    description: "Current PDF page content",
    value: pageContent || 'No document loaded'
  });
  
  // Generate suggestions based on current document state
  // Use inline instructions with emojis as this approach was working before
  useCopilotChatSuggestions({
    instructions: currentDocument && extractedText 
      ? `Baseado no conteúdo da página ${currentPage} de ${totalPages} do documento ${currentDocument.name}, sugira 4 ações de estudo relevantes:
      
      Conteúdo atual: ${extractedText.substring((currentPage - 1) * 1000, currentPage * 1000).slice(0, 300)}...
      
      IMPORTANTE: Cada sugestão DEVE começar com um emoji. Exemplos:
      - 📚 Resumir [tópico específico da página]
      - 💭 Explicar [conceito mencionado]
      - 🎯 Questões sobre [assunto da página]  
      - 🔍 Analisar [elemento do conteúdo]
      - 🔬 Detalhar [teoria apresentada]
      - ✏️ Exercícios sobre [tema]
      
      As sugestões devem ser curtas, específicas ao conteúdo atual e em português brasileiro.`
      : `Sugira 4 ações de estudo. CADA uma DEVE começar com emoji:
      📚 Resumir conceitos principais
      💭 Explicar fundamentos teóricos
      🎯 Criar quiz de revisão
      🔍 Analisar pontos importantes`,
    minSuggestions: 4,
    maxSuggestions: 4,
    available: currentDocument && extractedText ? 'enabled' : 'disabled',
  }, [
    `${currentDocument?.id}-${suggestionKey}`, // Combined key for change detection
    currentDocument?.name,
    currentPage,
    extractedText?.slice(0, 500)
  ]);
  // Action 1: Explicar conteúdo selecionado
  useCopilotAction({
    name: 'explicar',
    description: AtenaPrompts.copilotActions.explicar.description,
    parameters: [
      {
        name: 'conteudo',
        type: 'string',
        description: 'O conteúdo do PDF que precisa ser explicado',
        required: true,
      },
    ],
    handler: async ({ conteudo }) => {
      // The actual explanation will be handled by the Agno agent
      return {
        action: 'explicar',
        content: conteudo,
      };
    },
  });

  // Action 2: Gerar exemplos práticos
  useCopilotAction({
    name: 'exemplos',
    description: AtenaPrompts.copilotActions.exemplos.description,
    parameters: [
      {
        name: 'topico',
        type: 'string',
        description: 'O tópico para o qual gerar exemplos',
        required: true,
      },
    ],
    handler: async ({ topico }) => {
      return {
        action: 'exemplos',
        topic: topico,
      };
    },
  });

  // Action 3: Quiz Me - Gerar questões de prática com Generative UI
  useCopilotAction({
    name: 'createQuiz',
    description: AtenaPrompts.copilotActions.createQuiz.description,
    parameters: [
      {
        name: 'topic',
        type: 'string',
        description: 'O tópico do quiz baseado no documento atual',
        required: true,
      },
      {
        name: 'questions',
        type: 'object[]',
        description: 'Array de questões do quiz',
        required: true,
        attributes: [
          {
            name: 'question',
            type: 'string',
            description: 'A pergunta',
            required: true,
          },
          {
            name: 'options',
            type: 'string[]',
            description: 'As opções de resposta',
            required: true,
          },
          {
            name: 'correctAnswer',
            type: 'number',
            description: 'O índice da resposta correta (0-based)',
            required: true,
          },
          {
            name: 'explanation',
            type: 'string',
            description: 'Explicação da resposta correta',
            required: true,
          },
        ],
      },
    ],
    render: ({ status, args }) => {
      if (status === 'inProgress') {
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{AtenaPrompts.copilotActions.createQuiz.generatingMessage}</p>
          </div>
        );
      }
      
      // Lazy load the quiz component
      const QuizComponent = require('@/components/quiz/QuizComponent').QuizComponent;
      return <QuizComponent questions={args.questions} topic={args.topic} />;
    },
  });

  // Action 4: Mostrar funcionalidades futuras
  useCopilotAction({
    name: 'showFutureFeatures',
    description: AtenaPrompts.copilotActions.showFutureFeatures.description,
    parameters: [],
    render: () => {
      const FutureFeatures = require('@/components/future-features/FutureFeatures').FutureFeatures;
      return <FutureFeatures />;
    },
  });

  // Action 5: Navigate to specific page
  useCopilotAction({
    name: 'navigateToPage',
    description: AtenaPrompts.copilotActions.navigateToPage.description,
    parameters: [
      {
        name: 'pageNumber',
        type: 'number',
        description: 'O número da página para navegar (1-indexed)',
        required: true,
      },
    ],
    handler: async ({ pageNumber }) => {
      if (pageNumber < 1 || pageNumber > totalPages) {
        return {
          success: false,
          message: AtenaPrompts.copilotActions.navigateToPage.invalidPage(totalPages),
        };
      }
      setCurrentPage(pageNumber);
      return {
        success: true,
        message: AtenaPrompts.copilotActions.navigateToPage.navigatingTo(pageNumber, totalPages),
      };
    },
  });

  // Action 6: Go to next page
  useCopilotAction({
    name: 'nextPage',
    description: AtenaPrompts.copilotActions.nextPage.description,
    parameters: [],
    handler: async () => {
      if (currentPage >= totalPages) {
        return {
          success: false,
          message: AtenaPrompts.copilotActions.nextPage.lastPageMessage,
        };
      }
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      return {
        success: true,
        message: AtenaPrompts.copilotActions.nextPage.goingToPage(nextPage, totalPages),
      };
    },
  });

  // Action 7: Go to previous page
  useCopilotAction({
    name: 'previousPage',
    description: AtenaPrompts.copilotActions.previousPage.description,
    parameters: [],
    handler: async () => {
      if (currentPage <= 1) {
        return {
          success: false,
          message: AtenaPrompts.copilotActions.previousPage.firstPageMessage,
        };
      }
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      return {
        success: true,
        message: AtenaPrompts.copilotActions.previousPage.goingBackToPage(prevPage, totalPages),
      };
    },
  });
}